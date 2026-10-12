import React, { useState } from 'react';
import { X, ShieldCheck, Check, Copy, QrCode, Lock, Shield } from 'lucide-react';
import { Conversation } from '../types';

interface SafetyNumberModalProps {
  isOpen: boolean;
  conversation: Conversation;
  onToggleVerified: (verified: boolean) => void;
  onClose: () => void;
}

export const SafetyNumberModal: React.FC<SafetyNumberModalProps> = ({
  isOpen,
  conversation,
  onToggleVerified,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  if (!isOpen) return null;

  const chunks = conversation.safetyNumber.split(' ');

  const handleCopy = () => {
    navigator.clipboard.writeText(conversation.safetyNumber.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#202c33] text-gray-100 rounded-2xl max-w-lg w-full shadow-2xl border border-gray-700/80 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/60 bg-[#111b21]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-gray-100">Verify Security Code</h3>
              <p className="text-xs text-gray-400">End-to-End Encryption with {conversation.name}</p>
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
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {/* WhatsApp style QR Code & Lock illustration */}
          <div className="flex flex-col items-center justify-center text-center mb-6">
            <div className="relative p-4 bg-white rounded-2xl shadow-inner mb-3">
              {/* SVG QR Code Simulation */}
              <div className="w-40 h-40 bg-white grid grid-cols-7 grid-rows-7 gap-1 p-2 rounded-lg border border-gray-200">
                {/* 7x7 matrix simulating QR patterns */}
                <div className="bg-black col-span-2 row-span-2 rounded-xs" />
                <div className="bg-white" />
                <div className="bg-black col-span-2 row-span-2 rounded-xs" />
                <div className="bg-black" />
                <div className="bg-black" />
                <div className="bg-white" />
                <div className="bg-black" />
                <div className="bg-black" />
                <div className="bg-white col-span-2 row-span-2" />
                <div className="bg-black col-span-2 row-span-2 rounded-xs" />
                <div className="bg-black" />
                <div className="bg-white" />
                <div className="bg-black" />
                <div className="bg-black" />
                <div className="bg-white" />
                <div className="bg-black" />
                <div className="bg-black" />
                <div className="bg-white" />
                <div className="bg-black col-span-2 row-span-2 rounded-xs" />
                <div className="bg-white" />
                <div className="bg-black" />
                <div className="bg-white" />
                <div className="bg-black" />
                <div className="bg-black" />
                <div className="bg-black" />
                <div className="bg-white" />
                <div className="bg-black col-span-2" />
                <div className="bg-white" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                  <Lock className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-300 max-w-sm leading-relaxed">
              To verify that messages and calls with <span className="font-semibold text-white">{conversation.name}</span> are end-to-end encrypted, scan this code on their device or compare the 60-digit number below.
            </p>
          </div>

          {/* 60-digit number grid (12 blocks of 5 digits) */}
          <div className="bg-[#111b21] p-4 rounded-xl border border-gray-700/60 mb-5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-800">
              <span className="text-xs uppercase font-semibold tracking-wider text-gray-400">
                Safety Number Fingerprint
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Code
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 text-center">
              {chunks.map((chunk, i) => (
                <div
                  key={i}
                  className="bg-[#1c272e] py-1.5 px-2 rounded-md font-mono text-xs sm:text-sm font-semibold tracking-widest text-emerald-300 border border-gray-700/40"
                >
                  {chunk}
                </div>
              ))}
            </div>
          </div>

          {/* Verification Status Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#182229] border border-gray-700/60 mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full ${
                  conversation.safetyNumberVerified
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-100">
                  {conversation.safetyNumberVerified ? 'Marked as Verified' : 'Unverified Identity'}
                </p>
                <p className="text-xs text-gray-400">
                  {conversation.safetyNumberVerified
                    ? 'Cryptographic identity matched and certified'
                    : 'Tap to certify this contact after comparing codes'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onToggleVerified(!conversation.safetyNumberVerified)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                conversation.safetyNumberVerified
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/40'
                  : 'bg-[#00a884] text-white hover:bg-[#02906f]'
              }`}
            >
              {conversation.safetyNumberVerified ? 'Verified ✓' : 'Mark Verified'}
            </button>
          </div>

          {/* Collapsible Cryptographic Details */}
          <button
            type="button"
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="text-xs text-gray-400 hover:text-gray-200 underline cursor-pointer"
          >
            {showTechnicalDetails ? 'Hide Cryptographic Spec' : 'Show Cryptographic Spec'}
          </button>

          {showTechnicalDetails && (
            <div className="mt-3 p-3 rounded-lg bg-[#111b21] border border-gray-800 text-[11px] font-mono text-gray-300 space-y-1.5 animate-in fade-in duration-100">
              <p><span className="text-emerald-400">Cipher:</span> AES-256-GCM with 128-bit authentication tag</p>
              <p><span className="text-emerald-400">Key Exchange:</span> ECDH Curve25519 / PBKDF2-SHA256</p>
              <p><span className="text-emerald-400">Session Key ID:</span> {conversation.sharedKeyHex.slice(0, 16)}...</p>
              <p><span className="text-emerald-400">Verification Hash:</span> SHA-512 truncated to 60 decimal digits</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#111b21] border-t border-gray-700/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
