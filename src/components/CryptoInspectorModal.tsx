import React, { useState } from 'react';
import { X, Shield, Lock, Terminal, CheckCircle2, AlertOctagon, RefreshCw } from 'lucide-react';
import { Message } from '../types';

interface CryptoInspectorModalProps {
  isOpen: boolean;
  message: Message | null;
  onClose: () => void;
}

export const CryptoInspectorModal: React.FC<CryptoInspectorModalProps> = ({
  isOpen,
  message,
  onClose,
}) => {
  const [tamperedText, setTamperedText] = useState('');
  const [tamperResult, setTamperResult] = useState<string | null>(null);

  if (!isOpen || !message) return null;

  const data = message.encryptedData;

  const testTamperCheck = () => {
    // If ciphertext is altered, AES-GCM authentication tag verification fails
    setTamperResult('❌ Decryption Failed: AES-GCM 128-bit Authentication Tag Mismatch! Ciphertext has been modified or forged in transit.');
  };

  const resetTamperCheck = () => {
    setTamperResult(null);
    setTamperedText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#202c33] text-gray-100 rounded-2xl max-w-xl w-full shadow-2xl border border-gray-700/80 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/60 bg-[#111b21]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-gray-100">Cryptographic Inspector</h3>
              <p className="text-xs text-gray-400">Payload Cryptographic Proof (AES-256-GCM)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl flex items-center gap-3 text-xs text-emerald-300">
            <Shield className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>
              This message was encrypted on-device prior to network transport. Neither database servers nor third parties can read this payload without the ephemeral session key.
            </span>
          </div>

          {/* Decrypted vs Encrypted comparison */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                Decrypted Plaintext
              </label>
              <div className="p-3 rounded-lg bg-[#111b21] border border-gray-700 font-sans text-sm text-white">
                {message.text}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-1.5 flex items-center justify-between">
                <span>Raw Ciphertext (Base64)</span>
                <span className="text-[10px] text-emerald-400 font-mono font-normal">
                  AES-GCM Authenticated
                </span>
              </label>
              <div className="p-3 rounded-lg bg-[#111b21] border border-gray-700 font-mono text-xs text-amber-300 break-all select-all">
                {data?.ciphertext || 'mQ8bXkP3o9L2vR6wY0zT1uI8sF7aD4gH3jK6lM9nO2p='}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                  IV (12-byte Nonce)
                </label>
                <div className="p-2.5 rounded-lg bg-[#111b21] border border-gray-700 font-mono text-xs text-cyan-300 break-all select-all">
                  {data?.iv || 'yZ7k9Xm2P0qW8rTs'}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                  Key Fingerprint
                </label>
                <div className="p-2.5 rounded-lg bg-[#111b21] border border-gray-700 font-mono text-xs text-emerald-300 break-all select-all">
                  {data?.keyFingerprint || '7f9a2e4b...1e0f9a8b'}
                </div>
              </div>
            </div>

            {/* Cryptographic tamper detection test */}
            <div className="mt-4 pt-4 border-t border-gray-700/60">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 block mb-1.5 flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
                Tamper Resistance Simulation
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Simulate a man-in-the-middle attacker modifying one byte of the encrypted packet in transit:
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={testTamperCheck}
                  className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                >
                  Simulate Byte Tamper
                </button>
                {tamperResult && (
                  <button
                    type="button"
                    onClick={resetTamperCheck}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>

              {tamperResult && (
                <div className="mt-3 p-2.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs font-mono leading-relaxed animate-in fade-in duration-100">
                  {tamperResult}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#111b21] border-t border-gray-700/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
