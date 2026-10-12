import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Users,
  Send,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Loader2,
  Lock,
  Shield,
  Info,
} from 'lucide-react';
import { GoogleChatMessage, GoogleSpace } from '../types';
import {
  fetchGoogleChatSpaces,
  fetchGoogleChatMessages,
  sendGoogleChatMessage,
  CHAT_APP_CONSOLE_URL,
} from '../services/googleChat';
import { ConfirmModal } from './ConfirmModal';
import { GoogleSignInButton } from './GoogleSignInButton';

interface GoogleChatViewProps {
  isAuthenticated: boolean;
  onLogin: () => void;
}

export const GoogleChatView: React.FC<GoogleChatViewProps> = ({
  isAuthenticated,
  onLogin,
}) => {
  const [spaces, setSpaces] = useState<GoogleSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<GoogleSpace | null>(null);
  const [messages, setMessages] = useState<GoogleChatMessage[]>([]);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAppConfigMissing, setIsAppConfigMissing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const loadSpaces = async () => {
    if (!isAuthenticated) return;
    setIsLoadingSpaces(true);
    setErrorMessage(null);
    setIsAppConfigMissing(false);
    try {
      const data = await fetchGoogleChatSpaces();
      setSpaces(data);
      if (data.length > 0 && !selectedSpace) {
        setSelectedSpace(data[0]);
      }
    } catch (err: any) {
      console.error('Error fetching Google Chat spaces:', err);
      if (err.isConfigMissing) {
        setIsAppConfigMissing(true);
      }
      setErrorMessage(err.message || 'Failed to load Google Chat spaces.');
    } finally {
      setIsLoadingSpaces(false);
    }
  };

  const loadMessages = async (spaceName: string) => {
    setIsLoadingMessages(true);
    try {
      const data = await fetchGoogleChatMessages(spaceName);
      setMessages(data);
    } catch (err: any) {
      console.error('Error fetching Google Chat messages:', err);
      setErrorMessage(err.message || 'Failed to load messages.');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadSpaces();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedSpace) {
      loadMessages(selectedSpace.name);
    }
  }, [selectedSpace]);

  const handleRequestSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedSpace) return;
    // Open mandatory user confirmation modal before mutation
    setConfirmSendOpen(true);
  };

  const handleConfirmSend = async () => {
    if (!selectedSpace || !inputText.trim()) return;
    setConfirmSendOpen(false);
    setIsSending(true);
    try {
      const newMsg = await sendGoogleChatMessage(selectedSpace.name, inputText.trim());
      setMessages((prev) => [...prev, newMsg]);
      setInputText('');
    } catch (err: any) {
      alert(`Error sending message: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0b141a] text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-100 mb-2">Google Chat Integration</h3>
        <p className="text-sm text-gray-400 max-w-md mb-6 leading-relaxed">
          Connect your Google Workspace account with permission to view your team's Google Chat spaces and send messages directly from WhisperWire.
        </p>
        <GoogleSignInButton onClick={onLogin} text="Sign in to Access Google Chat" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-[#0b141a] overflow-hidden">
      {/* Spaces List Column */}
      <div className="w-80 border-r border-gray-800 bg-[#111b21] flex flex-col">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-100">Google Chat Spaces</h3>
            <p className="text-xs text-gray-400">{spaces.length} spaces available</p>
          </div>
          <button
            type="button"
            onClick={loadSpaces}
            disabled={isLoadingSpaces}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            title="Refresh Spaces"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingSpaces ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Prerequisites & Notice Box */}
        <div className="p-3 bg-[#182229] border-b border-gray-800 text-xs text-gray-300">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <span className="font-semibold text-white">Workspace Required:</span> Requires a Business or Enterprise Google Workspace account.
            </div>
          </div>
        </div>

        {/* Spaces list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoadingSpaces ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mb-2" />
              <p className="text-xs">Loading spaces...</p>
            </div>
          ) : isAppConfigMissing ? (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200">
              <div className="flex items-center gap-2 font-semibold text-amber-300 mb-2">
                <AlertCircle className="w-4 h-4" />
                Console Configuration Needed
              </div>
              <p className="mb-3 leading-relaxed">
                Google Chat app is not configured yet. Complete the one-time configuration on Google Cloud Console:
              </p>
              <a
                href={CHAT_APP_CONSOLE_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <span>Open Google Chat Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : spaces.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-400">
              {errorMessage || 'No Google Chat spaces found in your account.'}
            </div>
          ) : (
            spaces.map((sp) => {
              const isSelected = selectedSpace?.name === sp.name;
              return (
                <button
                  key={sp.name}
                  type="button"
                  onClick={() => setSelectedSpace(sp)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left cursor-pointer ${
                    isSelected
                      ? 'bg-[#00a884]/20 border border-[#00a884]/40 text-white'
                      : 'hover:bg-[#182229] text-gray-300 border border-transparent'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate text-gray-100">{sp.displayName}</p>
                    <p className="text-xs text-gray-400 capitalize">{sp.type.toLowerCase()}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Messages Thread Column */}
      <div className="flex-1 flex flex-col bg-[#0b141a]">
        {selectedSpace ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-800 bg-[#111b21] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-900/40 flex items-center justify-center text-emerald-300">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{selectedSpace.displayName}</h4>
                  <p className="text-xs text-gray-400">Google Chat Space ({selectedSpace.name})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => loadMessages(selectedSpace.name)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                title="Refresh Messages"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingMessages ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Messages container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoadingMessages ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin text-[#00a884] mb-2" />
                  <p className="text-xs">Fetching messages from Google Chat...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-sm">
                  No messages yet in this space. Send one below!
                </div>
              ) : (
                messages.map((m, idx) => (
                  <div key={m.name || idx} className="flex items-start gap-3 bg-[#182229] p-3 rounded-xl border border-gray-800/80">
                    <div className="w-8 h-8 rounded-full bg-emerald-950 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
                      {m.sender.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-emerald-300">
                          {m.sender.displayName}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {new Date(m.createTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                        {m.text}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Form with Workspace Confirmation Dialog */}
            <form onSubmit={handleRequestSend} className="p-3 bg-[#111b21] border-t border-gray-800 flex items-center gap-2">
              <input
                type="text"
                placeholder={`Post message to ${selectedSpace.displayName}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-[#182229] border border-gray-700/80 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#00a884]"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className="p-2.5 bg-[#00a884] hover:bg-[#02906f] disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer"
                title="Send to Google Chat"
              >
                {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
            <Users className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm font-medium">Select a Google Chat space on the left</p>
          </div>
        )}
      </div>

      {/* Mandatory User Confirmation Modal before sending to external Google Chat */}
      <ConfirmModal
        isOpen={confirmSendOpen}
        title="Send Message to Google Chat?"
        message={`Are you sure you want to send the message "${inputText}" to the Google Chat space "${selectedSpace?.displayName}" on behalf of your Google Workspace account?`}
        confirmLabel="Send to Google Chat"
        cancelLabel="Cancel"
        onConfirm={handleConfirmSend}
        onCancel={() => setConfirmSendOpen(false)}
      />
    </div>
  );
};
