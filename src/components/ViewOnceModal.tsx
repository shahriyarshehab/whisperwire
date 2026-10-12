import React from 'react';
import { X, EyeOff, ShieldCheck, Flame } from 'lucide-react';

interface ViewOnceModalProps {
  isOpen: boolean;
  imageUrl?: string;
  senderName: string;
  onClose: () => void;
}

export const ViewOnceModal: React.FC<ViewOnceModalProps> = ({
  isOpen,
  imageUrl,
  senderName,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="max-w-2xl w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-150">
        {/* Top bar */}
        <div className="w-full flex items-center justify-between px-4 py-3 text-white mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-500/30 flex items-center justify-center border border-emerald-400/50">
              <span className="text-xs font-bold text-emerald-300">1</span>
            </div>
            <div>
              <p className="text-sm font-semibold">{senderName}</p>
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <Flame className="w-3 h-3" /> View Once Ephemeral Media
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Frame */}
        <div className="relative rounded-2xl overflow-hidden border border-gray-800 shadow-2xl bg-black max-h-[70vh] flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="View Once Attachment"
              className="max-h-[70vh] max-w-full object-contain select-none pointer-events-none"
            />
          ) : (
            <div className="p-16 text-center text-gray-500">
              <EyeOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Media has already been purged from memory.</p>
            </div>
          )}
        </div>

        {/* Self Destruct notice */}
        <div className="mt-4 p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-xs text-red-300 flex items-center gap-2 max-w-md text-center">
          <ShieldCheck className="w-4 h-4 shrink-0 text-red-400" />
          <span>
            Self-destruct active: When you dismiss this view, this decrypted photo will be immediately wiped from browser memory.
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 px-6 py-2 bg-white text-gray-900 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors shadow-lg cursor-pointer"
        >
          Close and Burn Photo
        </button>
      </div>
    </div>
  );
};
