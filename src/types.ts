export type DisappearingTimer = 0 | 5 | 30 | 60 | 300 | 86400 | 604800; // in seconds, 0 = off

export interface EncryptionMetadata {
  algorithm: string; // 'AES-256-GCM'
  keyFingerprint: string;
  iv: string; // Base64
  ciphertext: string; // Base64
  tag?: string; // Auth tag if separate
  timestamp: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  isMe: boolean;
  text: string;
  encryptedData?: EncryptionMetadata;
  timestamp: number;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  disappearingTimer: DisappearingTimer; // timer applied when sent
  expiresAt?: number; // timestamp when it disappears (if timer > 0)
  isViewOnce?: boolean;
  viewOnceOpened?: boolean;
  mediaType?: 'image' | 'audio' | 'file';
  mediaUrl?: string;
  audioDuration?: number;
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
  reactions?: { [emoji: string]: string[] }; // emoji -> array of user names
  starred?: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  phoneOrEmail?: string;
  online: boolean;
  lastSeen?: string;
  isTyping?: boolean;
  isGoogleChat?: boolean;
  googleSpaceName?: string;
  unreadCount: number;
  disappearingTimer: DisappearingTimer;
  safetyNumber: string;
  safetyNumberVerified: boolean;
  sharedKeyHex: string;
  lastMessage?: {
    text: string;
    timestamp: number;
    senderName: string;
    isMe: boolean;
    status: 'sent' | 'delivered' | 'read';
  };
  about?: string;
  archived?: boolean;
}

export interface GoogleContact {
  resourceName: string;
  displayName: string;
  email?: string;
  phoneNumber?: string;
  photoUrl?: string;
}

export interface GoogleSpace {
  name: string;
  displayName: string;
  type: string;
  spaceType?: string;
}

export interface GoogleChatMessage {
  name: string;
  text: string;
  createTime: string;
  sender: {
    name: string;
    displayName: string;
    avatarUrl?: string;
    type?: string;
  };
}
