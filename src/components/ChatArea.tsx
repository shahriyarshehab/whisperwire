import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  Video,
  Search,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  Send,
  Lock,
  Clock,
  ShieldCheck,
  Check,
  CheckCheck,
  Flame,
  Terminal,
  Eye,
  Play,
  Pause,
  Image,
  FileText,
  AlertCircle,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Conversation, Message, DisappearingTimer } from '../types';

interface ChatAreaProps {
  conversation: Conversation;
  messages: Message[];
  onSendMessage: (params: {
    text: string;
    isViewOnce?: boolean;
    mediaType?: 'image' | 'audio' | 'file';
    mediaUrl?: string;
    audioDuration?: number;
  }) => void;
  onOpenSafetyNumber: () => void;
  onOpenDisappearingModal: () => void;
  onOpenCryptoInspector: (msg: Message) => void;
  onOpenViewOnce: (msg: Message) => void;
  onStartCall: (isVideo: boolean) => void;
  onDeleteMessage: (msgId: string) => void;
  onReactMessage: (msgId: string, emoji: string) => void;
  onChangeTimer: (timer: DisappearingTimer) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  conversation,
  messages,
  onSendMessage,
  onOpenSafetyNumber,
  onOpenDisappearingModal,
  onOpenCryptoInspector,
  onOpenViewOnce,
  onStartCall,
  onDeleteMessage,
  onReactMessage,
  onChangeTimer,
}) => {
  const [inputText, setInputText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update clock every second for live disappearing message countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Voice recording timer
  useEffect(() => {
    let interval: any;
    if (isRecordingVoice) {
      interval = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage({ text: inputText.trim() });
    setInputText('');
    setShowEmojiPicker(false);
    setShowAttachMenu(false);
  };

  const handleSendVoiceNote = () => {
    setIsRecordingVoice(false);
    const duration = Math.max(recordingSeconds, 3);
    onSendMessage({
      text: `Voice note (${duration}s) - E2E Encrypted Audio`,
      mediaType: 'audio',
      audioDuration: duration,
    });
  };

  const handleSendViewOncePhoto = () => {
    setShowAttachMenu(false);
    onSendMessage({
      text: 'Encrypted blueprint photo (View Once)',
      isViewOnce: true,
      mediaType: 'image',
      mediaUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80',
    });
  };

  const formatSecondsLeft = (expiresAt?: number) => {
    if (!expiresAt) return null;
    const diff = Math.max(0, Math.ceil((expiresAt - now) / 1000));
    if (diff <= 60) return `${diff}s`;
    if (diff < 3600) return `${Math.ceil(diff / 60)}m`;
    return `${Math.ceil(diff / 3600)}h`;
  };

  const formatTimerName = (timer: DisappearingTimer) => {
    if (timer === 0) return 'Off';
    if (timer === 5) return '5 seconds (Fast Burn)';
    if (timer === 30) return '30 seconds';
    if (timer === 60) return '1 minute';
    if (timer === 300) return '5 minutes';
    if (timer === 86400) return '24 hours';
    if (timer === 604800) return '7 days';
    return `${timer}s`;
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔒', '🔥', '👏'];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b141a] relative overflow-hidden">
      {/* Background WhatsApp Doodle Overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#00a884 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top Header */}
      <div className="relative z-10 px-4 py-2.5 bg-[#202c33] border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={conversation.avatar}
              alt={conversation.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            {conversation.online && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#202c33]" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-100 text-sm">{conversation.name}</h3>
              {conversation.safetyNumberVerified ? (
                <button
                  type="button"
                  onClick={onOpenSafetyNumber}
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full hover:bg-emerald-500/20 transition-colors cursor-pointer"
                  title="Verified End-to-End Encryption"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenSafetyNumber}
                  className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-emerald-400 bg-gray-800/80 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                  title="Verify Security Code"
                >
                  <Lock className="w-3 h-3" />
                  <span>Verify Code</span>
                </button>
              )}
            </div>

            <p className="text-xs text-gray-400">
              {conversation.isTyping ? (
                <span className="text-emerald-400 font-medium italic animate-pulse">typing...</span>
              ) : conversation.online ? (
                <span className="text-emerald-400">online</span>
              ) : (
                conversation.lastSeen || 'offline'
              )}
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1 text-gray-400">
          {/* Disappearing Timer Quick Action */}
          <button
            type="button"
            onClick={onOpenDisappearingModal}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium transition-colors cursor-pointer ${
              conversation.disappearingTimer > 0
                ? conversation.disappearingTimer === 5
                  ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/40'
            }`}
            title="Configure Disappearing Messages Timer"
          >
            {conversation.disappearingTimer === 5 ? (
              <Flame className="w-3.5 h-3.5" />
            ) : (
              <Clock className="w-3.5 h-3.5" />
            )}
            <span>
              {conversation.disappearingTimer > 0
                ? formatTimerName(conversation.disappearingTimer)
                : 'Disappearing Off'}
            </span>
          </button>

          {/* Voice Call */}
          <button
            type="button"
            onClick={() => onStartCall(false)}
            className="p-2 rounded-full hover:text-gray-200 hover:bg-gray-700/40 transition-colors cursor-pointer"
            title="Encrypted Voice Call"
          >
            <Phone className="w-4 h-4" />
          </button>

          {/* Video Call */}
          <button
            type="button"
            onClick={() => onStartCall(true)}
            className="p-2 rounded-full hover:text-gray-200 hover:bg-gray-700/40 transition-colors cursor-pointer"
            title="Encrypted Video Call"
          >
            <Video className="w-4 h-4" />
          </button>

          {/* Security Safety Code */}
          <button
            type="button"
            onClick={onOpenSafetyNumber}
            className="p-2 rounded-full hover:text-emerald-400 hover:bg-gray-700/40 transition-colors cursor-pointer"
            title="Verify 60-digit safety code"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 z-10">
        {/* WhatsApp Security Yellow Banner */}
        <div
          onClick={onOpenSafetyNumber}
          className="mx-auto max-w-md p-2.5 rounded-xl bg-[#182229] border border-amber-500/20 shadow-xs text-center cursor-pointer hover:bg-[#1f2c35] transition-colors"
        >
          <div className="flex items-center justify-center gap-1.5 text-xs text-amber-300/90 font-medium mb-0.5">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Messages and calls are end-to-end encrypted</span>
          </div>
          <p className="text-[11px] text-gray-400 leading-snug">
            No one outside of this chat, not even WhisperWire, can read or listen to them. Tap to verify with {conversation.name}.
          </p>
        </div>

        {/* Disappearing Timer Status notice */}
        {conversation.disappearingTimer > 0 && (
          <div
            onClick={onOpenDisappearingModal}
            className="mx-auto max-w-sm p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center cursor-pointer hover:bg-emerald-950/60 transition-colors"
          >
            <p className="text-[11px] text-emerald-300 flex items-center justify-center gap-1.5">
              {conversation.disappearingTimer === 5 ? (
                <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
              ) : (
                <Clock className="w-3 h-3 text-emerald-400" />
              )}
              <span>
                Disappearing messages active: {formatTimerName(conversation.disappearingTimer)}. Tap to adjust.
              </span>
            </p>
          </div>
        )}

        {/* Message Bubbles */}
        {messages.map((m) => {
          const secondsLeft = formatSecondsLeft(m.expiresAt);
          const isExpiringSoon = m.expiresAt && m.expiresAt - now < 10000;

          return (
            <div
              key={m.id}
              className={`flex flex-col group ${m.isMe ? 'items-end' : 'items-start'} ${
                isExpiringSoon ? 'animate-pulse' : ''
              }`}
            >
              <div
                className={`relative max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 shadow-md border ${
                  m.isMe
                    ? 'bg-[#005c4b] border-emerald-700/40 text-gray-100 rounded-tr-xs'
                    : 'bg-[#202c33] border-gray-700/60 text-gray-100 rounded-tl-xs'
                }`}
              >
                {/* View Once Photo Message */}
                {m.isViewOnce && (
                  <div className="mb-2">
                    {m.viewOnceOpened ? (
                      <div className="p-3 bg-black/40 rounded-xl border border-gray-700 flex items-center gap-2 text-xs text-gray-400">
                        <Flame className="w-4 h-4 text-red-400" />
                        <span className="italic">Photo opened & evaporated</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpenViewOnce(m)}
                        className="w-full flex items-center justify-between gap-3 p-3 bg-black/30 hover:bg-black/50 border border-emerald-500/40 rounded-xl text-left transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center">
                            <span className="text-xs font-bold text-emerald-300">1</span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white">Photo</p>
                            <p className="text-[10px] text-emerald-300">View Once • Tap to open</p>
                          </div>
                        </div>
                        <Eye className="w-4 h-4 text-emerald-400" />
                      </button>
                    )}
                  </div>
                )}

                {/* Voice Note Message */}
                {m.mediaType === 'audio' && (
                  <div className="mb-2 flex items-center gap-3 p-2 bg-black/20 rounded-xl border border-gray-700/60">
                    <button
                      type="button"
                      onClick={() =>
                        setPlayingAudioId(playingAudioId === m.id ? null : m.id)
                      }
                      className="w-9 h-9 rounded-full bg-[#00a884] text-white flex items-center justify-center hover:bg-[#02906f] transition-transform active:scale-95 cursor-pointer shrink-0"
                    >
                      {playingAudioId === m.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                      )}
                    </button>
                    <div className="flex-1">
                      {/* Audio waveform visualization */}
                      <div className="flex items-center gap-0.5 h-6">
                        {[20, 45, 80, 50, 100, 60, 30, 90, 70, 40, 85, 30, 65, 50].map(
                          (h, i) => (
                            <div
                              key={i}
                              className={`w-1 rounded-full ${
                                playingAudioId === m.id
                                  ? 'bg-emerald-400 animate-pulse'
                                  : 'bg-gray-400'
                              }`}
                              style={{ height: `${h}%` }}
                            />
                          )
                        )}
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-300 font-mono mt-1">
                        <span>{playingAudioId === m.id ? '0:07' : '0:00'}</span>
                        <span>0:{m.audioDuration || 14}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Standard text content */}
                {m.text && !m.isViewOnce && (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap select-text">
                    {m.text}
                  </p>
                )}

                {/* Footer with Timestamp, Disappearing countdown, and Status ticks */}
                <div className="flex items-center justify-end gap-2 mt-1.5 text-[10px] text-gray-300/80 font-mono">
                  {/* Disappearing Countdown badge */}
                  {secondsLeft && (
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full font-bold ${
                        isExpiringSoon
                          ? 'bg-red-500/30 text-red-300 animate-bounce'
                          : 'bg-black/30 text-amber-300'
                      }`}
                      title={`This message will self-destruct in ${secondsLeft}`}
                    >
                      <Flame className="w-2.5 h-2.5" />
                      {secondsLeft}
                    </span>
                  )}

                  <span>{formatTime(m.timestamp)}</span>

                  {/* Status ticks */}
                  {m.isMe && (
                    <span>
                      {m.status === 'read' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-cyan-300 inline" />
                      ) : m.status === 'delivered' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-gray-300 inline" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-gray-300 inline" />
                      )}
                    </span>
                  )}
                </div>

                {/* Message reactions */}
                {m.reactions && Object.keys(m.reactions).length > 0 && (
                  <div className="absolute -bottom-2.5 left-2 flex gap-1 bg-[#182229] px-1.5 py-0.5 rounded-full border border-gray-700 shadow-xs text-xs">
                    {Object.entries(m.reactions).map(([emoji, users]) => (
                      <span key={emoji} title={users.join(', ')}>
                        {emoji} {users.length > 1 ? users.length : ''}
                      </span>
                    ))}
                  </div>
                )}

                {/* Hover Action Bar */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-[#111b21]/90 rounded-lg p-0.5 border border-gray-700/80 shadow-md">
                  {/* Inspect Cryptography */}
                  <button
                    type="button"
                    onClick={() => onOpenCryptoInspector(m)}
                    className="p-1 hover:text-emerald-400 text-gray-400 rounded transition-colors cursor-pointer"
                    title="Inspect AES-256-GCM Ciphertext & Proof"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                  </button>

                  {/* Quick Reactions */}
                  <button
                    type="button"
                    onClick={() => onReactMessage(m.id, '👍')}
                    className="p-1 hover:text-white text-gray-400 rounded transition-colors cursor-pointer"
                    title="Like"
                  >
                    👍
                  </button>
                  <button
                    type="button"
                    onClick={() => onReactMessage(m.id, '🔒')}
                    className="p-1 hover:text-white text-gray-400 rounded transition-colors cursor-pointer"
                    title="Encrypted"
                  >
                    🔒
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => onDeleteMessage(m.id)}
                    className="p-1 hover:text-red-400 text-gray-400 rounded transition-colors cursor-pointer"
                    title="Delete message"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar Footer */}
      <div className="relative z-20 px-3 py-2 bg-[#202c33] border-t border-gray-800">
        {/* Emoji Bar Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-3 bg-[#233138] p-2.5 rounded-2xl shadow-2xl border border-gray-700 flex items-center gap-2 animate-in fade-in duration-100 z-30">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setInputText((prev) => prev + emoji)}
                className="text-lg hover:scale-125 transition-transform p-1 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Attachment Options Menu */}
        {showAttachMenu && (
          <div className="absolute bottom-16 left-12 bg-[#233138] p-2 rounded-2xl shadow-2xl border border-gray-700 space-y-1 w-56 animate-in fade-in duration-100 z-30">
            <button
              type="button"
              onClick={handleSendViewOncePhoto}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs text-gray-200 hover:bg-[#182229] rounded-xl transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div>
                <p className="font-semibold text-white">View Once Photo</p>
                <p className="text-[10px] text-gray-400">Burns immediately after viewing</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowAttachMenu(false);
                onSendMessage({
                  text: 'Encrypted document archive: keys.enc',
                  mediaType: 'file',
                });
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs text-gray-200 hover:bg-[#182229] rounded-xl transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white">Encrypted Document</p>
                <p className="text-[10px] text-gray-400">Attach file payload</p>
              </div>
            </button>
          </div>
        )}

        {/* Recording voice indicator */}
        {isRecordingVoice ? (
          <div className="flex items-center justify-between bg-red-950/40 border border-red-800/60 p-2.5 rounded-xl">
            <div className="flex items-center gap-2 text-xs text-red-300">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="font-mono font-bold">
                Recording E2EE Audio: 0:{recordingSeconds.toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsRecordingVoice(false)}
                className="px-3 py-1 text-xs text-gray-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendVoiceNote}
                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Send Voice Note
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex items-center gap-2">
            {/* Emoji toggle */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700/30 rounded-full transition-colors cursor-pointer"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Attach toggle */}
            <button
              type="button"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700/30 rounded-full transition-colors cursor-pointer"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Disappearing timer toggle shortcut */}
            <button
              type="button"
              onClick={onOpenDisappearingModal}
              className={`p-1.5 px-2 rounded-lg text-xs font-mono font-medium flex items-center gap-1 transition-colors cursor-pointer shrink-0 ${
                conversation.disappearingTimer > 0
                  ? conversation.disappearingTimer === 5
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-gray-700/40 text-gray-400 hover:text-gray-200'
              }`}
              title="Click to toggle disappearing timer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>
                {conversation.disappearingTimer > 0
                  ? `${conversation.disappearingTimer}s`
                  : 'Off'}
              </span>
            </button>

            {/* Text Input */}
            <input
              type="text"
              placeholder={`Encrypted message for ${conversation.name}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-[#2a3942] rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00a884]"
            />

            {/* Mic or Send button */}
            {inputText.trim() ? (
              <button
                type="submit"
                className="p-2.5 bg-[#00a884] hover:bg-[#02906f] text-white rounded-full transition-transform active:scale-95 cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsRecordingVoice(true)}
                className="p-2.5 bg-[#202c33] hover:bg-gray-700/60 text-gray-300 rounded-full transition-colors cursor-pointer"
                title="Record Encrypted Voice Memo"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
