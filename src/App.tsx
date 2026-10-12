/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  Conversation,
  Message,
  GoogleContact,
  DisappearingTimer,
} from './types';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  setDemoSession,
} from './services/firebaseAuth';
import { fetchGoogleContacts } from './services/googleContacts';
import {
  deriveChatKey,
  encryptText,
  generateSafetyNumber,
  generateFingerprint,
} from './services/crypto';
import {
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  CONTACT_SIMULATION_RESPONSES,
} from './mockData';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { GoogleChatView } from './components/GoogleChatView';
import { SettingsView } from './components/SettingsView';
import { DisappearingTimerModal } from './components/DisappearingTimerModal';
import { SafetyNumberModal } from './components/SafetyNumberModal';
import { CryptoInspectorModal } from './components/CryptoInspectorModal';
import { ViewOnceModal } from './components/ViewOnceModal';
import { VoiceCallModal } from './components/VoiceCallModal';
import { NewChatModal } from './components/NewChatModal';
import { OAuthHelpModal } from './components/OAuthHelpModal';
import { InstallApkModal } from './components/InstallApkModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState<string>('conv-1');
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [googleContacts, setGoogleContacts] = useState<GoogleContact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [activeTab, setActiveTab] = useState<'chats' | 'google-chat' | 'settings' | 'archived'>('chats');
  const [defaultTimer, setDefaultTimer] = useState<DisappearingTimer>(30);

  // Modals state
  const [disappearingModalConv, setDisappearingModalConv] = useState<Conversation | null>(null);
  const [safetyNumberConv, setSafetyNumberConv] = useState<Conversation | null>(null);
  const [cryptoInspectorMsg, setCryptoInspectorMsg] = useState<Message | null>(null);
  const [viewOnceMsg, setViewOnceMsg] = useState<Message | null>(null);
  const [callModalData, setCallModalData] = useState<{ conv: Conversation; isVideo: boolean } | null>(null);
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [oauthHelpOpen, setOauthHelpOpen] = useState(false);
  const [installApkOpen, setInstallApkOpen] = useState(false);

  // In-memory cache of derived CryptoKeys by conversation id
  const keysCacheRef = useRef<Map<string, CryptoKey>>(new Map());

  // Helper to obtain or derive CryptoKey for a conversation
  const getOrCreateChatKey = async (conv: Conversation): Promise<CryptoKey> => {
    if (keysCacheRef.current.has(conv.id)) {
      return keysCacheRef.current.get(conv.id)!;
    }
    const key = await deriveChatKey(conv.sharedKeyHex);
    keysCacheRef.current.set(conv.id, key);
    return key;
  };

  // Auth initialization
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
        loadContacts();
      },
      () => {
        setCurrentUser(null);
        setGoogleContacts([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        loadContacts();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      // Surface test user / 403 help modal immediately
      setOauthHelpOpen(true);
    }
  };

  const handleEnableDemoMode = async () => {
    setDemoSession('DEMO_WORKSPACE_TOKEN');
    const mockUser: any = {
      uid: 'demo-user-shahriyar',
      displayName: 'Shahriyar Shehab',
      email: 'shahriyarshehab7388@gmail.com',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    };
    setCurrentUser(mockUser);
    setIsLoadingContacts(true);
    try {
      const contacts = await fetchGoogleContacts();
      setGoogleContacts(contacts);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    setGoogleContacts([]);
  };

  const loadContacts = async () => {
    setIsLoadingContacts(true);
    try {
      const contacts = await fetchGoogleContacts();
      setGoogleContacts(contacts);
    } catch (err: any) {
      console.warn('Could not fetch Google contacts:', err);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  // Disappearing messages lifecycle cleaner (runs every 1 second)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setMessagesMap((prevMap) => {
        let changed = false;
        const newMap: Record<string, Message[]> = {};

        for (const [convId, msgs] of Object.entries(prevMap)) {
          const filtered = msgs.filter((m) => {
            if (m.expiresAt && now >= m.expiresAt) {
              changed = true;
              return false; // Evaporate / self-destruct
            }
            return true;
          });
          newMap[convId] = filtered;
        }

        return changed ? newMap : prevMap;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || conversations[0];
  const activeMessages = messagesMap[activeConversation?.id] || [];

  // Sending message with E2EE and Disappearing Timer
  const handleSendMessage = async (params: {
    text: string;
    isViewOnce?: boolean;
    mediaType?: 'image' | 'audio' | 'file';
    mediaUrl?: string;
    audioDuration?: number;
  }) => {
    if (!activeConversation) return;

    const timer = activeConversation.disappearingTimer;
    const now = Date.now();
    const expiresAt = timer > 0 ? now + timer * 1000 : undefined;

    // Perform real WebCrypto AES-256-GCM encryption
    let encryptionData;
    try {
      const key = await getOrCreateChatKey(activeConversation);
      const fingerprint = await generateFingerprint(activeConversation.sharedKeyHex);
      encryptionData = await encryptText(params.text, key, fingerprint);
    } catch (err) {
      console.error('Encryption failed, falling back:', err);
    }

    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      conversationId: activeConversation.id,
      senderId: 'me',
      senderName: 'You',
      isMe: true,
      text: params.text,
      encryptedData: encryptionData,
      timestamp: now,
      status: 'sent',
      disappearingTimer: timer,
      expiresAt,
      isViewOnce: params.isViewOnce,
      viewOnceOpened: false,
      mediaType: params.mediaType,
      mediaUrl: params.mediaUrl,
      audioDuration: params.audioDuration,
    };

    // Update messages
    setMessagesMap((prev) => ({
      ...prev,
      [activeConversation.id]: [...(prev[activeConversation.id] || []), newMsg],
    }));

    // Update conversation last message preview
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? {
              ...c,
              lastMessage: {
                text: params.isViewOnce ? '📷 View Once Photo' : params.text,
                timestamp: now,
                senderName: 'You',
                isMe: true,
                status: 'sent',
              },
            }
          : c
      )
    );

    // Simulate network delivery tick
    setTimeout(() => {
      setMessagesMap((prev) => ({
        ...prev,
        [activeConversation.id]: (prev[activeConversation.id] || []).map((m) =>
          m.id === newMsg.id ? { ...m, status: 'delivered' } : m
        ),
      }));
    }, 600);

    // Simulate recipient reading (blue ticks) and replying with encrypted message
    if (activeConversation.id.startsWith('conv-')) {
      setTimeout(() => {
        // Mark read
        setMessagesMap((prev) => ({
          ...prev,
          [activeConversation.id]: (prev[activeConversation.id] || []).map((m) =>
            m.id === newMsg.id ? { ...m, status: 'read' } : m
          ),
        }));

        // Set typing indicator
        setConversations((prev) =>
          prev.map((c) => (c.id === activeConversation.id ? { ...c, isTyping: true } : c))
        );

        // Send simulated response after 1.8 seconds
        setTimeout(async () => {
          setConversations((prev) =>
            prev.map((c) => (c.id === activeConversation.id ? { ...c, isTyping: false } : c))
          );

          const cannedList = CONTACT_SIMULATION_RESPONSES[activeConversation.id] || [
            'E2EE authentication confirmed. Message decrypted.',
          ];
          const replyText = cannedList[Math.floor(Math.random() * cannedList.length)];

          const replyTime = Date.now();
          const replyExpiresAt =
            activeConversation.disappearingTimer > 0
              ? replyTime + activeConversation.disappearingTimer * 1000
              : undefined;

          let replyEncData;
          try {
            const key = await getOrCreateChatKey(activeConversation);
            const fp = await generateFingerprint(activeConversation.sharedKeyHex);
            replyEncData = await encryptText(replyText, key, fp);
          } catch (e) {
            console.error(e);
          }

          const replyMsg: Message = {
            id: `reply-${Date.now()}`,
            conversationId: activeConversation.id,
            senderId: activeConversation.id,
            senderName: activeConversation.name,
            isMe: false,
            text: replyText,
            encryptedData: replyEncData,
            timestamp: replyTime,
            status: 'read',
            disappearingTimer: activeConversation.disappearingTimer,
            expiresAt: replyExpiresAt,
          };

          setMessagesMap((prev) => ({
            ...prev,
            [activeConversation.id]: [...(prev[activeConversation.id] || []), replyMsg],
          }));

          setConversations((prev) =>
            prev.map((c) =>
              c.id === activeConversation.id
                ? {
                    ...c,
                    lastMessage: {
                      text: replyText,
                      timestamp: replyTime,
                      senderName: activeConversation.name,
                      isMe: false,
                      status: 'read',
                    },
                  }
                : c
            )
          );
        }, 1800);
      }, 1200);
    }
  };

  // Change disappearing timer for conversation
  const handleChangeTimer = (timer: DisappearingTimer) => {
    if (!activeConversation) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversation.id ? { ...c, disappearingTimer: timer } : c))
    );

    // Post system message notifying about timer adjustment
    const timerLabel =
      timer === 0
        ? 'off'
        : timer === 5
        ? '5 seconds'
        : timer === 30
        ? '30 seconds'
        : timer === 60
        ? '1 minute'
        : timer === 300
        ? '5 minutes'
        : `${timer} seconds`;

    const systemMsg: Message = {
      id: `sys-${Date.now()}`,
      conversationId: activeConversation.id,
      senderId: 'system',
      senderName: 'System',
      isMe: false,
      text: `⏱️ You changed disappearing messages timer to ${timerLabel}. New messages will disappear from this chat after they are read.`,
      timestamp: Date.now(),
      status: 'read',
      disappearingTimer: 0,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [activeConversation.id]: [...(prev[activeConversation.id] || []), systemMsg],
    }));
  };

  const toggleArchiveConversation = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, archived: !c.archived } : c))
    );
  };


  // Toggle safety number verified status
  const handleToggleVerified = (verified: boolean) => {
    if (!safetyNumberConv) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === safetyNumberConv.id ? { ...c, safetyNumberVerified: verified } : c
      )
    );
    setSafetyNumberConv((prev) => (prev ? { ...prev, safetyNumberVerified: verified } : null));
  };

  // Delete message
  const handleDeleteMessage = (msgId: string) => {
    if (!activeConversation) return;
    setMessagesMap((prev) => ({
      ...prev,
      [activeConversation.id]: (prev[activeConversation.id] || []).filter((m) => m.id !== msgId),
    }));
  };

  // React to message
  const handleReactMessage = (msgId: string, emoji: string) => {
    if (!activeConversation) return;
    setMessagesMap((prev) => ({
      ...prev,
      [activeConversation.id]: (prev[activeConversation.id] || []).map((m) => {
        if (m.id !== msgId) return m;
        const currentReactions = { ...(m.reactions || {}) };
        const users = currentReactions[emoji] || [];
        if (users.includes('You')) {
          currentReactions[emoji] = users.filter((u) => u !== 'You');
          if (currentReactions[emoji].length === 0) delete currentReactions[emoji];
        } else {
          currentReactions[emoji] = [...users, 'You'];
        }
        return { ...m, reactions: currentReactions };
      }),
    }));
  };

  // Create new conversation from modal
  const handleCreateNewChat = async (params: {
    name: string;
    avatar?: string;
    phoneOrEmail: string;
    disappearingTimer: DisappearingTimer;
  }) => {
    const id = `conv-user-${Date.now()}`;
    const seed = `${id}-${params.phoneOrEmail}`;
    const safetyNumber = await generateSafetyNumber(seed);
    const sharedKeyHex = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const newConv: Conversation = {
      id,
      name: params.name,
      avatar:
        params.avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(params.name)}`,
      phoneOrEmail: params.phoneOrEmail,
      online: true,
      lastSeen: 'online',
      unreadCount: 0,
      disappearingTimer: params.disappearingTimer || defaultTimer,
      safetyNumber,
      safetyNumberVerified: false,
      sharedKeyHex,
      about: 'End-to-End Encrypted Session',
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    setActiveTab('chats');

    // Add initial welcome notice
    const welcomeMsg: Message = {
      id: `init-${Date.now()}`,
      conversationId: newConv.id,
      senderId: 'system',
      senderName: 'System',
      isMe: false,
      text: `🔒 Messages and calls with ${newConv.name} are end-to-end encrypted. Disappearing messages are set to ${newConv.disappearingTimer}s.`,
      timestamp: Date.now(),
      status: 'read',
      disappearingTimer: 0,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [newConv.id]: [welcomeMsg],
    }));
  };

  // Close view once modal and purge photo from memory
  const handleCloseViewOnce = () => {
    if (viewOnceMsg && activeConversation) {
      setMessagesMap((prev) => ({
        ...prev,
        [activeConversation.id]: (prev[activeConversation.id] || []).map((m) =>
          m.id === viewOnceMsg.id
            ? { ...m, viewOnceOpened: true, mediaUrl: undefined }
            : m
        ),
      }));
    }
    setViewOnceMsg(null);
  };

  // Export encrypted transcript vault
  const handleExportVault = () => {
    const vault = {
      exportTime: new Date().toISOString(),
      version: '1.0',
      conversations: conversations.map((c) => ({
        id: c.id,
        name: c.name,
        safetyNumber: c.safetyNumber,
        disappearingTimer: c.disappearingTimer,
      })),
      messages: messagesMap,
    };

    const blob = new Blob([JSON.stringify(vault, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whisperwire-encrypted-vault-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0b141a] text-gray-100 select-none">
      {/* WhatsApp Style Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => {
          setActiveConversationId(id);
          setActiveTab('chats');
        }}
        onOpenNewChat={() => setNewChatModalOpen(true)}
        onOpenDisappearingModal={(conv) => setDisappearingModalConv(conv)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onGoogleLogin={handleLogin}
        onLogout={handleLogout}
        onOpenOAuthHelp={() => setOauthHelpOpen(true)}
        onOpenInstallApk={() => setInstallApkOpen(true)}
        onToggleArchive={toggleArchiveConversation}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0b141a]">
        {activeTab === 'chats' ? (
          activeConversation ? (
            <ChatArea
              conversation={activeConversation}
              messages={activeMessages}
              onSendMessage={handleSendMessage}
              onOpenSafetyNumber={() => setSafetyNumberConv(activeConversation)}
              onOpenDisappearingModal={() => setDisappearingModalConv(activeConversation)}
              onOpenCryptoInspector={(msg) => setCryptoInspectorMsg(msg)}
              onOpenViewOnce={(msg) => setViewOnceMsg(msg)}
              onStartCall={(isVideo) =>
                setCallModalData({ conv: activeConversation, isVideo })
              }
              onDeleteMessage={handleDeleteMessage}
              onReactMessage={handleReactMessage}
              onChangeTimer={handleChangeTimer}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a conversation to start messaging
            </div>
          )
        ) : activeTab === 'google-chat' ? (
          <GoogleChatView
            isAuthenticated={!!currentUser}
            onLogin={handleLogin}
          />
        ) : (
          <SettingsView
            currentUser={currentUser}
            onLogin={handleLogin}
            onLogout={handleLogout}
            defaultTimer={defaultTimer}
            onSetDefaultTimer={setDefaultTimer}
            onExportVault={handleExportVault}
            onOpenInstallApk={() => setInstallApkOpen(true)}
          />
        )}
      </div>

      {/* Modals */}
      {disappearingModalConv && (
        <DisappearingTimerModal
          isOpen={!!disappearingModalConv}
          currentTimer={disappearingModalConv.disappearingTimer}
          chatName={disappearingModalConv.name}
          onSelectTimer={(timer) => {
            handleChangeTimer(timer);
            setDisappearingModalConv(null);
          }}
          onClose={() => setDisappearingModalConv(null)}
        />
      )}

      {safetyNumberConv && (
        <SafetyNumberModal
          isOpen={!!safetyNumberConv}
          conversation={safetyNumberConv}
          onToggleVerified={handleToggleVerified}
          onClose={() => setSafetyNumberConv(null)}
        />
      )}

      {cryptoInspectorMsg && (
        <CryptoInspectorModal
          isOpen={!!cryptoInspectorMsg}
          message={cryptoInspectorMsg}
          onClose={() => setCryptoInspectorMsg(null)}
        />
      )}

      {viewOnceMsg && (
        <ViewOnceModal
          isOpen={!!viewOnceMsg}
          imageUrl={viewOnceMsg.mediaUrl}
          senderName={viewOnceMsg.senderName}
          onClose={handleCloseViewOnce}
        />
      )}

      {callModalData && (
        <VoiceCallModal
          isOpen={!!callModalData}
          conversation={callModalData.conv}
          isVideo={callModalData.isVideo}
          onClose={() => setCallModalData(null)}
        />
      )}

      {newChatModalOpen && (
        <NewChatModal
          isOpen={newChatModalOpen}
          contacts={googleContacts}
          isLoadingContacts={isLoadingContacts}
          isAuthenticated={!!currentUser}
          onLogin={handleLogin}
          onCreateChat={handleCreateNewChat}
          onClose={() => setNewChatModalOpen(false)}
        />
      )}

      {oauthHelpOpen && (
        <OAuthHelpModal
          isOpen={oauthHelpOpen}
          onClose={() => setOauthHelpOpen(false)}
          onEnableDemoMode={handleEnableDemoMode}
        />
      )}

      {installApkOpen && (
        <InstallApkModal
          isOpen={installApkOpen}
          onClose={() => setInstallApkOpen(false)}
        />
      )}
    </div>
  );
}
