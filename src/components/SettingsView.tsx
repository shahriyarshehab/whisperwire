import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Clock,
  Key,
  Download,
  Bell,
  RefreshCw,
  LogOut,
  User,
  ExternalLink,
  Flame,
  Smartphone,
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { DisappearingTimer } from '../types';
import { GoogleSignInButton } from './GoogleSignInButton';
import { CHAT_APP_CONSOLE_URL } from '../services/googleChat';

interface SettingsViewProps {
  currentUser: FirebaseUser | null;
  onLogin: () => void;
  onLogout: () => void;
  defaultTimer: DisappearingTimer;
  onSetDefaultTimer: (timer: DisappearingTimer) => void;
  onExportVault: () => void;
  onOpenInstallApk?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onLogin,
  onLogout,
  defaultTimer,
  onSetDefaultTimer,
  onExportVault,
  onOpenInstallApk,
}) => {
  const [notifyOnKeyChange, setNotifyOnKeyChange] = useState(true);
  const [strictDisappearing, setStrictDisappearing] = useState(true);

  return (
    <div className="flex-1 flex flex-col bg-[#0b141a] overflow-y-auto p-6 max-w-3xl mx-auto w-full">
      <div className="mb-6 pb-4 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[#00a884]" />
          Security & Privacy Settings
        </h2>
        <p className="text-xs text-gray-400">
          Manage End-to-End Encryption, Disappearing Message defaults, and Google Workspace integrations.
        </p>
      </div>

      <div className="space-y-6">
        {/* Google Workspace Account Card */}
        <div className="bg-[#111b21] rounded-2xl border border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            Google Workspace Account
          </h3>

          {currentUser ? (
            <div className="flex items-center justify-between p-4 bg-[#182229] rounded-xl border border-gray-700/60">
              <div className="flex items-center gap-3">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || ''}
                    className="w-12 h-12 rounded-full border-2 border-emerald-500/60"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-white text-lg">
                    {currentUser.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-white">{currentUser.displayName || 'Google User'}</p>
                  <p className="text-xs text-gray-400">{currentUser.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    Contacts & Chat Scopes Active
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs font-medium hover:bg-red-900/40 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="p-4 bg-[#182229] rounded-xl border border-gray-700/60 text-center">
              <p className="text-xs text-gray-300 mb-3">
                Connect your Google account to sync real Contacts and communicate across Google Chat spaces with permission.
              </p>
              <GoogleSignInButton onClick={onLogin} />
            </div>
          )}
        </div>

        {/* Android APK & WebAPK Card */}
        <div className="bg-[#111b21] rounded-2xl border border-gray-800 p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                Android APK & Native App Installation
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Install as a full-screen native Android application (WebAPK) or export standalone .apk files.
              </p>
            </div>
            {onOpenInstallApk && (
              <button
                type="button"
                onClick={onOpenInstallApk}
                className="px-3.5 py-1.5 bg-[#00a884] hover:bg-[#02906f] text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer shadow-xs transition-colors"
              >
                Install APK
              </button>
            )}
          </div>
          <div className="p-3 bg-[#182229] rounded-xl border border-gray-700/60 text-xs text-gray-300 space-y-1">
            <p>
              • <strong>1-Click Install:</strong> In Android Chrome, tap "Install app" to automatically generate the verified Android WebAPK.
            </p>
            <p>
              • <strong>Standalone .APK Export:</strong> Compatible with PWABuilder and Google Bubblewrap CLI for Google Play or direct sideloading.
            </p>
          </div>
        </div>

        {/* Disappearing Messages Defaults */}
        <div className="bg-[#111b21] rounded-2xl border border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-200 mb-1 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Default Timer for New Chats
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Start new encrypted conversations with this disappearing message timer pre-configured.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { val: 5, label: '5s (Fast Burn 🔥)' },
              { val: 30, label: '30s (Quick ⏱️)' },
              { val: 60, label: '1 min (Secret ⏳)' },
              { val: 300, label: '5 min' },
              { val: 86400, label: '24 hours' },
              { val: 604800, label: '7 days' },
              { val: 0, label: 'Off (Keep ♾️)' },
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => onSetDefaultTimer(opt.val as DisappearingTimer)}
                className={`p-3 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer ${
                  defaultTimer === opt.val
                    ? 'bg-[#00a884]/20 border-[#00a884] text-white font-semibold'
                    : 'bg-[#182229] border-gray-700/60 text-gray-300 hover:bg-[#222e35]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-200">Strict Memory Purge</p>
              <p className="text-[11px] text-gray-400">
                Instantly garbage-collect decrypted buffers upon timer expiry
              </p>
            </div>
            <input
              type="checkbox"
              checked={strictDisappearing}
              onChange={(e) => setStrictDisappearing(e.target.checked)}
              className="accent-[#00a884] w-4 h-4 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Cryptography & End-to-End Encryption */}
        <div className="bg-[#111b21] rounded-2xl border border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            End-to-End Encryption (E2EE)
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#182229] rounded-xl border border-gray-700/60">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="text-xs font-semibold text-white">Show Security Notifications</p>
                  <p className="text-[11px] text-gray-400">
                    Get notified when a contact's 60-digit security code changes
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyOnKeyChange}
                onChange={(e) => setNotifyOnKeyChange(e.target.checked)}
                className="accent-[#00a884] w-4 h-4 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-[#182229] rounded-xl border border-gray-700/60">
              <div className="flex items-center gap-2.5">
                <Download className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-xs font-semibold text-white">Export Encrypted Transcript Vault</p>
                  <p className="text-[11px] text-gray-400">
                    Download encrypted JSON backup with local keys
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onExportVault}
                className="px-3 py-1.5 bg-[#00a884] hover:bg-[#02906f] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Download Vault
              </button>
            </div>
          </div>
        </div>

        {/* Google Cloud Console Chat Setup Reference */}
        <div className="bg-[#111b21] rounded-2xl border border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-amber-400" />
            Google Cloud Console Quick Link
          </h3>
          <p className="text-xs text-gray-400 mb-3 leading-relaxed">
            If you need to configure your Google Chat app name and avatar for Google Workspace spaces, you can open the Cloud Console directly:
          </p>
          <a
            href={CHAT_APP_CONSOLE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 underline font-medium"
          >
            <span>Open Google Chat API Configuration Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
