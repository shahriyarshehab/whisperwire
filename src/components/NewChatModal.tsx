import React, { useState } from 'react';
import { X, UserPlus, Search, Phone, Mail, Shield, User, Loader2, Sparkles } from 'lucide-react';
import { GoogleContact, DisappearingTimer } from '../types';
import { GoogleSignInButton } from './GoogleSignInButton';

interface NewChatModalProps {
  isOpen: boolean;
  contacts: GoogleContact[];
  isLoadingContacts: boolean;
  isAuthenticated: boolean;
  onLogin: () => void;
  onCreateChat: (params: {
    name: string;
    avatar?: string;
    phoneOrEmail: string;
    disappearingTimer: DisappearingTimer;
  }) => void;
  onClose: () => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  contacts,
  isLoadingContacts,
  isAuthenticated,
  onLogin,
  onCreateChat,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'contacts' | 'manual'>('contacts');
  const [manualName, setManualName] = useState('');
  const [manualIdentifier, setManualIdentifier] = useState('');
  const [manualTimer, setManualTimer] = useState<DisappearingTimer>(30);

  if (!isOpen) return null;

  const filteredContacts = contacts.filter((c) =>
    c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.phoneNumber && c.phoneNumber.includes(searchQuery))
  );

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    onCreateChat({
      name: manualName.trim(),
      phoneOrEmail: manualIdentifier.trim() || '+1 (555) 012-3456',
      disappearingTimer: manualTimer,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(manualName)}`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#202c33] text-gray-100 rounded-2xl max-w-lg w-full shadow-2xl border border-gray-700/80 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/60 bg-[#111b21]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-[#00a884]/20 text-[#00a884]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-gray-100">New Encrypted Chat</h3>
              <p className="text-xs text-gray-400">Initialize E2EE session with contact</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700/60 bg-[#182229] px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('contacts')}
            className={`pb-2.5 px-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'contacts'
                ? 'border-[#00a884] text-[#00a884]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Google Contacts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`pb-2.5 px-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'manual'
                ? 'border-[#00a884] text-[#00a884]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Custom Number / ID
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'contacts' ? (
            <div>
              {!isAuthenticated ? (
                <div className="p-6 text-center bg-[#111b21] rounded-2xl border border-gray-700/60 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3">
                    <User className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-semibold text-gray-100 mb-1">
                    Connect Google Contacts
                  </h4>
                  <p className="text-xs text-gray-400 max-w-sm mb-4 leading-relaxed">
                    Sign in with Google to import your contacts with permission, start end-to-end encrypted chats, and auto-derive shared safety codes.
                  </p>
                  <GoogleSignInButton onClick={onLogin} text="Sign in to Load Contacts" />
                </div>
              ) : (
                <div>
                  {/* Search input */}
                  <div className="relative mb-4">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search Google Contacts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#111b21] border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#00a884]"
                    />
                  </div>

                  {isLoadingContacts ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin text-[#00a884] mb-2" />
                      <p className="text-xs">Fetching contacts securely...</p>
                    </div>
                  ) : filteredContacts.length === 0 ? (
                    <div className="text-center py-10 bg-[#111b21] rounded-xl border border-gray-800">
                      <p className="text-sm text-gray-300 font-medium">No contacts found</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Try typing a custom number in the other tab or search again.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                      {filteredContacts.map((c) => (
                        <button
                          key={c.resourceName}
                          type="button"
                          onClick={() => {
                            onCreateChat({
                              name: c.displayName,
                              avatar:
                                c.photoUrl ||
                                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                  c.displayName
                                )}`,
                              phoneOrEmail: c.phoneNumber || c.email || 'Encrypted contact',
                              disappearingTimer: 30,
                            });
                            onClose();
                          }}
                          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#111b21] transition-colors text-left border border-transparent hover:border-gray-700/60 cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 shrink-0">
                              {c.photoUrl ? (
                                <img
                                  src={c.photoUrl}
                                  alt={c.displayName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-emerald-400 bg-emerald-950/40">
                                  {c.displayName.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-100">{c.displayName}</p>
                              <p className="text-xs text-gray-400">
                                {c.phoneNumber || c.email || 'Google Contact'}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-emerald-400 font-medium px-2 py-1 rounded-md bg-emerald-500/10">
                            Start E2EE
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleCreateManual} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                  Contact Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Satoshi Nakamoto"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full bg-[#111b21] border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#00a884]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                  Phone Number or Email
                </label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000 or user@domain.com"
                  value={manualIdentifier}
                  onChange={(e) => setManualIdentifier(e.target.value)}
                  className="w-full bg-[#111b21] border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#00a884]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                  Default Disappearing Timer
                </label>
                <select
                  value={manualTimer}
                  onChange={(e) => setManualTimer(Number(e.target.value) as DisappearingTimer)}
                  className="w-full bg-[#111b21] border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#00a884]"
                >
                  <option value={5}>5 seconds (Fast burn 🔥)</option>
                  <option value={30}>30 seconds (Quick dissolve ⏱️)</option>
                  <option value={60}>1 minute (Confidential ⏳)</option>
                  <option value={300}>5 minutes (Standard 🕒)</option>
                  <option value={86400}>24 hours (1 day 📅)</option>
                  <option value={0}>Off (Keep messages ♾️)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#00a884] hover:bg-[#02906f] text-white rounded-xl text-sm font-semibold transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Create Encrypted Conversation
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
