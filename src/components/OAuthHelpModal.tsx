import React from 'react';
import { X, ExternalLink, ShieldAlert, CheckCircle2, UserCheck, Sparkles, Copy, Check } from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';

interface OAuthHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnableDemoMode: () => void;
}

export const OAuthHelpModal: React.FC<OAuthHelpModalProps> = ({
  isOpen,
  onClose,
  onEnableDemoMode,
}) => {
  const [copiedEmail, setCopiedEmail] = React.useState(false);
  const userEmail = 'shahriyarshehab7388@gmail.com';
  const consentUrl = `https://console.cloud.google.com/apis/credentials/consent?project=${firebaseConfig.projectId}`;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(userEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#202c33] text-gray-100 rounded-2xl max-w-lg w-full shadow-2xl border border-gray-700/80 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/60 bg-[#111b21]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-amber-500/20 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-gray-100">Google OAuth Test User Setup</h3>
              <p className="text-xs text-amber-400 font-mono">Error 403: access_denied</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4 text-xs leading-relaxed text-gray-300">
          <div className="p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-200">
            <p className="font-medium text-sm mb-1 text-white">Why did Google block access?</p>
            <p>
              Because this app uses sensitive Google Workspace APIs (<span className="text-emerald-300 font-mono">Contacts</span> & <span className="text-emerald-300 font-mono">Google Chat</span>), Google Cloud keeps the app in <strong>Testing</strong> mode until verified. In Testing mode, Google only permits emails explicitly added to the <strong>Test Users</strong> list.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-white">How to fix in 30 seconds:</h4>

            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#111b21] border border-gray-800">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <div className="flex-1">
                  <p className="font-medium text-white mb-1.5">Open OAuth Consent Screen in Google Cloud</p>
                  <a
                    href={consentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00a884] hover:bg-[#02906f] text-white rounded-lg font-medium transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Open OAuth Consent Screen</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#111b21] border border-gray-800">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <div className="flex-1">
                  <p className="font-medium text-white mb-1">Add your email under Test Users</p>
                  <p className="text-gray-400 mb-2">
                    Scroll down to the <strong>Test users</strong> section, click <strong>+ ADD USERS</strong>, and add:
                  </p>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#182229] border border-gray-700/80 font-mono text-emerald-300">
                    <span>{userEmail}</span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-[11px] text-gray-300 hover:text-white cursor-pointer ml-2"
                    >
                      {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#111b21] border border-gray-800">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <div>
                  <p className="font-medium text-white mb-0.5">Click Save and Retry Sign-in</p>
                  <p className="text-gray-400">
                    Once saved, return here and click <strong>Sign in with Google</strong>. Google will now grant immediate access!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Demo Mode fallback option */}
          <div className="pt-2 border-t border-gray-700/60">
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Want to test immediately without configuring Cloud Console?
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Launch with simulated Google Contacts & Google Chat spaces right now.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onEnableDemoMode();
                  onClose();
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer shadow-md transition-colors"
              >
                Launch Demo Mode
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#111b21] border-t border-gray-700/60 flex items-center justify-between">
          <span className="text-[11px] text-gray-500 font-mono">
            Project ID: {firebaseConfig.projectId}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
