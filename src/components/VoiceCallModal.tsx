import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, ShieldCheck, Lock } from 'lucide-react';
import { Conversation } from '../types';

interface VoiceCallModalProps {
  isOpen: boolean;
  conversation: Conversation;
  isVideo?: boolean;
  onClose: () => void;
}

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({
  isOpen,
  conversation,
  isVideo = false,
  onClose,
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [videoActive, setVideoActive] = useState(isVideo);
  const [speakerActive, setSpeakerActive] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      setCallDuration(0);
      return;
    }

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md h-[580px] bg-[#111b21] rounded-3xl overflow-hidden shadow-2xl border border-gray-800 flex flex-col justify-between p-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a332c]/40 via-transparent to-black pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex flex-col items-center text-center pt-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-3">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>End-to-End Encrypted</span>
          </div>

          <h3 className="text-2xl font-bold text-white mb-1">{conversation.name}</h3>
          <p className="text-sm text-emerald-400 font-mono tracking-wider font-semibold">
            {callDuration > 0 ? formatDuration(callDuration) : 'Connecting secure session...'}
          </p>

          {/* SAS Emojis for caller verification */}
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-black/40 rounded-lg border border-gray-700/60 text-xs text-gray-300">
            <span className="text-[10px] uppercase text-gray-400 font-mono">Verify SAS:</span>
            <span className="text-base">🛡️ 🔑 ⚡ 🌐</span>
          </div>
        </div>

        {/* Center: Avatar & Sound Wave */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto">
          <div className="relative">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-emerald-500/40 shadow-2xl ring-8 ring-emerald-500/10">
              <img
                src={conversation.avatar}
                alt={conversation.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Animated ringing pulse ring */}
            <div className="absolute inset-0 rounded-full border border-emerald-400/30 animate-ping pointer-events-none" />
          </div>

          {/* Audio waveforms visualizer */}
          <div className="flex items-center gap-1.5 mt-8 h-8">
            {[40, 75, 50, 90, 60, 100, 45, 80, 55, 30].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-emerald-400/80 rounded-full animate-pulse"
                style={{
                  height: `${h}%`,
                  animationDelay: `${i * 120}ms`,
                  animationDuration: '900ms',
                }}
              />
            ))}
          </div>
        </div>

        {/* Call Controls */}
        <div className="relative z-10 flex flex-col items-center gap-6 pb-4">
          <div className="flex items-center gap-4">
            {/* Speaker */}
            <button
              type="button"
              onClick={() => setSpeakerActive(!speakerActive)}
              className={`p-3.5 rounded-full transition-colors cursor-pointer ${
                speakerActive ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              <Volume2 className="w-5 h-5" />
            </button>

            {/* Video */}
            <button
              type="button"
              onClick={() => setVideoActive(!videoActive)}
              className={`p-3.5 rounded-full transition-colors cursor-pointer ${
                videoActive ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {videoActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            {/* Mute */}
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3.5 rounded-full transition-colors cursor-pointer ${
                isMuted ? 'bg-red-500/30 text-red-300 border border-red-500' : 'bg-white/20 text-white'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* End Call */}
            <button
              type="button"
              onClick={onClose}
              className="p-4 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
