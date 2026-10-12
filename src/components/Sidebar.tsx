import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Plus,
  ShieldCheck,
  Clock,
  Check,
  CheckCheck,
  Flame,
  Lock,
  MoreVertical,
  LogOut,
  Users,
  Sliders,
  Sparkles,
  Smartphone,
  Archive,
} from 'lucide-react';
import { Conversation, DisappearingTimer } from '../types';
import { User as FirebaseUser } from 'firebase/auth';
import { GoogleSignInButton } from './GoogleSignInButton';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onOpenNewChat: () => void;
  onOpenDisappearingModal: (conv: Conversation) => void;
  activeTab: 'chats' | 'google-chat' | 'settings' | 'archived';
  setActiveTab: (tab: 'chats' | 'google-chat' | 'settings' | 'archived') => void;
  currentUser: FirebaseUser | null;
  onGoogleLogin: () => void;
  onLogout: () => void;
  onOpenOAuthHelp?: () => void;
  onOpenInstallApk?: () => void;
  onToggleArchive: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onOpenNewChat,
  onOpenDisappearingModal,
  activeTab,
  setActiveTab,
  currentUser,
  onGoogleLogin,
  onLogout,
  onOpenOAuthHelp,
  onOpenInstallApk,
  onToggleArchive,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'disappearing' | 'verified'>('all');
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.lastMessage && c.lastMessage.text.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (activeTab === 'chats') return !c.archived;
    if (activeTab === 'archived') return c.archived;
    if (filter === 'unread') return c.unreadCount > 0;
    if (filter === 'disappearing') return c.disappearingTimer > 0;
    if (filter === 'verified') return c.safetyNumberVerified;
    return true;
  });

  const formatTimerBadge = (timer: DisappearingTimer) => {
    if (timer === 0) return null;
    if (timer === 5) return '5s';
    if (timer === 30) return '30s';
    if (timer === 60) return '1m';
    if (timer === 300) return '5m';
    if (timer === 86400) return '24h';
    if (timer === 604800) return '7d';
    return `${timer}s`;
  };

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full md:w-[380px] lg:w-[420px] h-full bg-[#111b21] border-r border-gray-800 flex flex-col shrink-0">
      {/* Top Bar Header */}
      <div className="px-4 py-3 bg-[#202c33] flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || 'Me'}
                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500/60"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-white shadow-xs">
                W
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#202c33]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-white tracking-wide">WhisperWire</h2>
              <span className="px-1.5 py-0.2 rounded-xs bg-emerald-500/20 text-emerald-300 font-mono text-[9px] uppercase font-semibold">
                E2EE
              </span>
            </div>
            <p className="text-[11px] text-gray-400 truncate max-w-[150px]">
              {currentUser?.displayName || currentUser?.email || 'End-to-End Encrypted'}
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 text-gray-400">
          <button
            type="button"
            onClick={() => setActiveTab('chats')}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              activeTab === 'chats' ? 'text-[#00a884] bg-gray-700/40' : 'hover:text-gray-200 hover:bg-gray-700/30'
            }`}
            title="Encrypted Chats"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('google-chat')}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              activeTab === 'google-chat' ? 'text-[#00a884] bg-gray-700/40' : 'hover:text-gray-200 hover:bg-gray-700/30'
            }`}
            title="Google Chat Spaces"
          >
            <Users className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('archived')}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              activeTab === 'archived' ? 'text-[#00a884] bg-gray-700/40' : 'hover:text-gray-200 hover:bg-gray-700/30'
            }`}
            title="Archived Chats"
          >
            <Archive className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onOpenNewChat}
            className="p-2 rounded-full hover:text-gray-200 hover:bg-gray-700/30 transition-colors cursor-pointer"
            title="New Chat from Contacts"
          >
            <Plus className="w-5 h-5" />
          </button>

          {onOpenInstallApk && (
            <button
              type="button"
              onClick={onOpenInstallApk}
              className="p-2 rounded-full text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 transition-colors cursor-pointer"
              title="Install Android APK / App"
            >
              <Smartphone className="w-5 h-5" />
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-full hover:text-gray-200 hover:bg-gray-700/30 transition-colors cursor-pointer"
              title="Menu"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-10 w-56 bg-[#233138] rounded-xl shadow-2xl py-2 border border-gray-700 z-50 animate-in fade-in zoom-in-95 duration-100">
                {onOpenInstallApk && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenInstallApk();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-emerald-300 hover:bg-[#182229] flex items-center gap-2.5 cursor-pointer font-medium"
                  >
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    Install Android APK / WebAPK
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('settings');
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-gray-200 hover:bg-[#182229] flex items-center gap-2.5 cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  Security & Disappearing Defaults
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenOAuthHelp) onOpenOAuthHelp();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-amber-300 hover:bg-[#182229] flex items-center gap-2.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Google OAuth / Test Users (403)
                </button>
                {currentUser ? (
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-red-400 hover:bg-[#182229] flex items-center gap-2.5 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out ({currentUser.displayName?.split(' ')[0] || 'User'})
                  </button>
                ) : (
                  <div className="px-3 py-2 border-t border-gray-700/60 mt-1">
                    <GoogleSignInButton
                      onClick={() => {
                        onGoogleLogin();
                        setMenuOpen(false);
                      }}
                      text="Sign in with Google"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Google Login banner if not logged in */}
      {!currentUser && (
        <div className="bg-[#182229] px-4 py-2 border-b border-gray-800 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-gray-300 truncate">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">Connect Google Contacts & Chat</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenOAuthHelp && (
              <button
                type="button"
                onClick={onOpenOAuthHelp}
                className="px-2 py-1 text-amber-400 hover:text-amber-300 text-[11px] underline cursor-pointer"
                title="Troubleshoot Error 403 / Test users"
              >
                403 Help
              </button>
            )}
            <button
              type="button"
              onClick={onGoogleLogin}
              className="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-md text-[11px] cursor-pointer shadow-xs"
            >
              Sign in
            </button>
          </div>
        </div>
      )}

      {/* Search Bar & Filter Pills */}
      <div className="px-3 pt-3 pb-2 border-b border-gray-800 bg-[#111b21] space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search or start new encrypted chat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#202c33] rounded-lg pl-9 pr-4 py-1.5 text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00a884]"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer shrink-0 ${
              filter === 'all'
                ? 'bg-[#00a884] text-white'
                : 'bg-[#202c33] text-gray-400 hover:text-gray-200'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer shrink-0 ${
              filter === 'unread'
                ? 'bg-[#00a884] text-white'
                : 'bg-[#202c33] text-gray-400 hover:text-gray-200'
            }`}
          >
            Unread
          </button>
          <button
            type="button"
            onClick={() => setFilter('disappearing')}
            className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
              filter === 'disappearing'
                ? 'bg-[#00a884] text-white'
                : 'bg-[#202c33] text-gray-400 hover:text-gray-200'
            }`}
          >
            <Clock className="w-3 h-3" /> Disappearing
          </button>
          <button
            type="button"
            onClick={() => setFilter('verified')}
            className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
              filter === 'verified'
                ? 'bg-[#00a884] text-white'
                : 'bg-[#202c33] text-gray-400 hover:text-gray-200'
            }`}
          >
            <ShieldCheck className="w-3 h-3" /> Verified
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-800/40">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Lock className="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-400" />
            <p className="text-sm font-medium text-gray-300">No conversations found</p>
            <p className="text-xs text-gray-500 mt-1">Tap + above to start an encrypted chat</p>
          </div>
        ) : (
          filteredConversations.map((c) => {
            const isSelected = activeConversationId === c.id;
            const timerBadge = formatTimerBadge(c.disappearingTimer);

            return (
              <div
                key={c.id}
                onClick={() => onSelectConversation(c.id)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]'
                }`}
              >
                {/* Avatar with online status */}
                <div className="relative shrink-0">
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {c.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#111b21]" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <h4 className="text-sm font-semibold text-gray-100 truncate">{c.name}</h4>
                      {c.safetyNumberVerified && (
                        <span title="Security Code Verified">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        </span>
                      )}
                    </div>
                    {c.lastMessage && (
                      <span className="text-[11px] text-gray-400 shrink-0">
                        {formatTimestamp(c.lastMessage.timestamp)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 truncate">
                      {c.isTyping ? (
                        <span className="text-emerald-400 font-medium italic animate-pulse">typing...</span>
                      ) : (
                        <>
                          {c.lastMessage?.isMe && (
                            <CheckCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          )}
                          <span className="truncate">{c.lastMessage?.text || 'Encrypted conversation started'}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {/* Archive action */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleArchive(c.id);
                        }}
                        className="p-1.5 rounded-full hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors cursor-pointer"
                        title={c.archived ? 'Unarchive Chat' : 'Archive Chat'}
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>

                      {/* Disappearing Timer Pill */}
                      {timerBadge && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                            c.disappearingTimer === 5
                              ? 'bg-amber-500/20 text-amber-300 font-bold'
                              : 'bg-emerald-500/15 text-emerald-300'
                          }`}
                          title={`Disappearing messages: ${timerBadge}`}
                        >
                          {c.disappearingTimer === 5 ? (
                            <Flame className="w-2.5 h-2.5" />
                          ) : (
                            <Clock className="w-2.5 h-2.5" />
                          )}
                          {timerBadge}
                        </span>
                      )}

                      {/* Unread badge */}
                      {c.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[#00a884] text-white text-[11px] font-bold flex items-center justify-center">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
