import React from 'react';
import { X, Clock, Flame, ShieldAlert, Check } from 'lucide-react';
import { DisappearingTimer } from '../types';

interface DisappearingTimerModalProps {
  isOpen: boolean;
  currentTimer: DisappearingTimer;
  chatName: string;
  onSelectTimer: (timer: DisappearingTimer) => void;
  onClose: () => void;
}

const TIMER_OPTIONS: { value: DisappearingTimer; label: string; description: string; icon: string }[] = [
  {
    value: 5,
    label: '5 seconds',
    description: 'Instant burn mode — perfect for testing or ultra-secret ephemeral codes',
    icon: '🔥',
  },
  {
    value: 30,
    label: '30 seconds',
    description: 'Quick dissolve — ideal for passwords, one-time OTPs, and temporary notes',
    icon: '⏱️',
  },
  {
    value: 60,
    label: '1 minute',
    description: 'Fast cleanup after read for confidential discussions',
    icon: '⏳',
  },
  {
    value: 300,
    label: '5 minutes',
    description: 'Medium duration for active live exchanges',
    icon: '🕒',
  },
  {
    value: 86400,
    label: '24 hours',
    description: 'Standard day-long message lifespan',
    icon: '📅',
  },
  {
    value: 604800,
    label: '7 days',
    description: 'Weekly clean sweep of chat logs',
    icon: '🗓️',
  },
  {
    value: 0,
    label: 'Off',
    description: 'Keep messages permanently in your local encrypted storage',
    icon: '♾️',
  },
];

export const DisappearingTimerModal: React.FC<DisappearingTimerModalProps> = ({
  isOpen,
  currentTimer,
  chatName,
  onSelectTimer,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#202c33] text-gray-100 rounded-2xl max-w-md w-full shadow-2xl border border-gray-700/80 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/60 bg-[#111b21]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-[#00a884]/20 text-[#00a884]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-gray-100">Disappearing Messages</h3>
              <p className="text-xs text-gray-400">Timer for {chatName}</p>
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
        <div className="p-6">
          <div className="flex items-start gap-3 p-3.5 mb-5 rounded-xl bg-[#111b21] border border-emerald-900/40 text-emerald-300 text-xs leading-relaxed">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>
              When enabled, new messages sent in this chat will disappear after the selected time. Recipients will see a visual countdown timer on each message before it dissolves.
            </span>
          </div>

          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {TIMER_OPTIONS.map((opt) => {
              const isSelected = currentTimer === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onSelectTimer(opt.value);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-[#00a884]/15 border-[#00a884] text-white shadow-xs'
                      : 'bg-[#182229] border-gray-700/60 hover:bg-[#222e35] text-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">{opt.icon}</span>
                    <div>
                      <div className="font-medium text-sm flex items-center gap-2">
                        {opt.label}
                        {opt.value === 5 && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                            Fast Burn
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                        {opt.description}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[#00a884] flex items-center justify-center shrink-0 ml-2">
                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
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
