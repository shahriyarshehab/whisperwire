import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallApkModal: React.FC<InstallApkModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [activeTab, setActiveTab] = useState<'install' | 'package'>('install');

  if (!isOpen) return null;

  const appUrl = window.location.href;
  const bubblewrapCmd = `npx @bubblewrap/cli init --manifest=${window.location.origin}/manifest.webmanifest && npx @bubblewrap/cli build`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(bubblewrapCmd);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#202c33] text-gray-100 rounded-2xl max-w-lg w-full shadow-2xl border border-gray-700/80 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/60 bg-[#111b21]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-gray-100">Android APK & Installation</h3>
              <p className="text-xs text-gray-400">Install WhisperWire as a native Android app</p>
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
            onClick={() => setActiveTab('install')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'install'
                ? 'border-[#00a884] text-[#00a884]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            1-Click Android WebAPK
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('package')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'package'
                ? 'border-[#00a884] text-[#00a884]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Generate .APK Package
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs text-gray-300">
          {activeTab === 'install' ? (
            <div className="space-y-4">
              {/* Status pill */}
              <div className="p-3.5 rounded-xl bg-[#111b21] border border-emerald-900/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                    APK
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">WhisperWire WebAPK</p>
                    <p className="text-gray-400 text-[11px]">
                      Android creates a verified native package with homescreen icon & splash
                    </p>
                  </div>
                </div>
                {isInstalled && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    Installed ✓
                  </span>
                )}
              </div>

              {/* Direct Install Button */}
              {isInstallable ? (
                <div className="text-center p-4 bg-[#182229] rounded-xl border border-gray-700">
                  <p className="text-sm font-semibold text-white mb-1">
                    Ready to Install on This Device
                  </p>
                  <p className="text-gray-400 mb-3">
                    Click below to trigger Android's native package installer.
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      await install();
                      onClose();
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00a884] hover:bg-[#02906f] text-white font-semibold rounded-xl transition-all shadow-md cursor-pointer text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Install APK on Device
                  </button>
                </div>
              ) : isInstalled ? (
                <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
                  <p className="font-semibold text-white text-sm">Already Running as Installed App</p>
                  <p className="text-gray-400 mt-1">
                    WhisperWire is currently running in standalone Android mode with offline caching enabled.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-[#111b21] rounded-xl border border-gray-800 text-center">
                    <p className="font-semibold text-white text-sm mb-1">How to Install on Android Phone</p>
                    <p className="text-gray-400 mb-3">
                      Open this URL in <strong>Google Chrome</strong> on any Android device, tap the <strong>⋮ Menu</strong> (top right), and select:
                    </p>
                    <div className="inline-block px-3 py-1.5 bg-[#182229] border border-emerald-500/40 text-emerald-300 font-semibold rounded-lg text-xs mb-3">
                      "Install App" or "Add to Home screen"
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Android's operating system compiles the Web Manifest into an official <strong>WebAPK</strong> registered in your phone's app drawer.
                    </p>
                  </div>

                  {/* Share/Copy URL box */}
                  <div className="p-3 bg-[#111b21] rounded-xl border border-gray-800 flex items-center justify-between gap-2">
                    <span className="font-mono text-gray-400 truncate text-[11px] select-all">
                      {appUrl}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
                    >
                      {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Native features checklist */}
              <div className="p-3.5 bg-[#182229] rounded-xl border border-gray-700/60 space-y-1.5">
                <p className="font-semibold text-white text-xs mb-1">Native Android Capabilities Included:</p>
                <div className="flex items-center gap-2 text-emerald-400 text-[11px]">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Full-screen standalone display without browser URL address bar</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 text-[11px]">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Hardware Web Cryptography for local AES-256-GCM encryption</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 text-[11px]">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Offline service worker asset precaching via Workbox</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 text-[11px]">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Maskable high-resolution adaptive app icons (512x512)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-200">
                <p className="font-semibold text-sm mb-1 text-white">Export to Standalone .APK File</p>
                <p>
                  Because this app implements the full PWA specification and Web App Manifest, you can export a signed or unsigned <span className="font-mono text-emerald-300">.apk</span> or <span className="font-mono text-emerald-300">.aab</span> (Android App Bundle) using any of the standard tools below:
                </p>
              </div>

              {/* Tool 1: PWABuilder (1-click Web) */}
              <div className="p-3.5 bg-[#111b21] rounded-xl border border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Option 1: PWABuilder (Direct APK Download)</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    No Code Required
                  </span>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  1. Go to <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline">PWABuilder.com</a>.<br />
                  2. Paste this application URL: <span className="font-mono text-gray-300 select-all">{appUrl}</span>.<br />
                  3. Click <strong>Package for Android</strong> and download your <span className="font-mono text-white">.apk</span> ready for sideloading or Google Play!
                </p>
                <a
                  href={`https://www.pwabuilder.com?url=${encodeURIComponent(appUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00a884] hover:bg-[#02906f] text-white rounded-lg font-semibold text-xs transition-colors"
                >
                  <span>Open in PWABuilder</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Tool 2: Bubblewrap CLI (Google Official TWA) */}
              <div className="p-3.5 bg-[#111b21] rounded-xl border border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Option 2: Google Bubblewrap (CLI Tool)</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                    Developer CLI
                  </span>
                </div>
                <p className="text-gray-400">
                  Google's official CLI wraps the web app into a Trusted Web Activity (TWA) Android Studio project:
                </p>
                <div className="p-2.5 rounded-lg bg-[#182229] border border-gray-700 font-mono text-[11px] text-emerald-300 flex items-center justify-between overflow-x-auto">
                  <span className="truncate mr-2">{bubblewrapCmd}</span>
                  <button
                    type="button"
                    onClick={handleCopyCommand}
                    className="text-gray-400 hover:text-white shrink-0 cursor-pointer"
                  >
                    {copiedCommand ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#111b21] border-t border-gray-700/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
