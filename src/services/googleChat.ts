import { GoogleChatMessage, GoogleSpace } from '../types';
import { getAccessToken } from './firebaseAuth';
import firebaseConfig from '../../firebase-applet-config.json';

export const CHAT_APP_CONSOLE_URL = `https://console.cloud.google.com/apis/api/chat.googleapis.com/hangouts-chat?project=${firebaseConfig.projectId}`;

export const DEMO_SPACES: GoogleSpace[] = [
  {
    name: 'spaces/cybersec-incident-response',
    displayName: '🛡️ CyberSec Incident Response',
    type: 'SPACE',
    spaceType: 'SPACE',
  },
  {
    name: 'spaces/quantum-keys-exchange',
    displayName: '🔐 E2EE Key Distribution Squad',
    type: 'SPACE',
    spaceType: 'SPACE',
  },
  {
    name: 'spaces/dev-whisperwire-core',
    displayName: '💬 WhisperWire Core Engineers',
    type: 'SPACE',
    spaceType: 'SPACE',
  },
];

let demoMessagesStore: Record<string, GoogleChatMessage[]> = {
  'spaces/cybersec-incident-response': [
    {
      name: 'spaces/cybersec-incident-response/messages/1',
      text: 'Security audit completed. All WebSocket proxies and TLS 1.3 terminations are verified.',
      createTime: new Date(Date.now() - 3600000).toISOString(),
      sender: {
        name: 'users/101',
        displayName: 'Aris Thorne',
        type: 'HUMAN',
      },
    },
    {
      name: 'spaces/cybersec-incident-response/messages/2',
      text: 'Remember to verify the 60-digit safety codes before transmitting sensitive keys.',
      createTime: new Date(Date.now() - 1800000).toISOString(),
      sender: {
        name: 'users/102',
        displayName: 'Maya Lin',
        type: 'HUMAN',
      },
    },
  ],
  'spaces/quantum-keys-exchange': [
    {
      name: 'spaces/quantum-keys-exchange/messages/1',
      text: 'ECDH Curve25519 public keys published for Q4 rotation.',
      createTime: new Date(Date.now() - 7200000).toISOString(),
      sender: {
        name: 'users/103',
        displayName: 'Liam Vance',
        type: 'HUMAN',
      },
    },
  ],
};

export async function fetchGoogleChatSpaces(): Promise<GoogleSpace[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated. Please sign in with Google.');
  }

  if (token === 'DEMO_WORKSPACE_TOKEN') {
    return DEMO_SPACES;
  }

  const res = await fetch('https://chat.googleapis.com/v1/spaces?pageSize=50', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.error?.message || res.statusText;

    if (
      res.status === 404 ||
      message.toLowerCase().includes('chat app not found') ||
      message.toLowerCase().includes('configure the app')
    ) {
      const err: any = new Error(
        'Google Chat app not found. To create a Chat app, you must turn on the Chat API and configure the app in the Google Cloud console.'
      );
      err.isConfigMissing = true;
      throw err;
    }

    if (res.status === 403 && message.toLowerCase().includes('consumer')) {
      const err: any = new Error(
        'Google Chat API requires a Google Workspace Business or Enterprise account. Consumer @gmail.com accounts are not supported by the Google Chat API.'
      );
      err.isConsumerAccount = true;
      throw err;
    }

    throw new Error(message);
  }

  const data = await res.json();
  if (!data.spaces || !Array.isArray(data.spaces)) {
    return [];
  }

  return data.spaces.map((s: any) => ({
    name: s.name,
    displayName: s.displayName || s.name.replace('spaces/', 'Space '),
    type: s.type || 'SPACE',
    spaceType: s.spaceType || 'SPACE',
  }));
}

export async function fetchGoogleChatMessages(spaceName: string): Promise<GoogleChatMessage[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated. Please sign in with Google.');
  }

  if (token === 'DEMO_WORKSPACE_TOKEN') {
    return demoMessagesStore[spaceName] || [];
  }

  const res = await fetch(
    `https://chat.googleapis.com/v1/${spaceName}/messages?pageSize=50`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch messages: ${res.statusText}`);
  }

  const data = await res.json();
  if (!data.messages || !Array.isArray(data.messages)) {
    return [];
  }

  return data.messages.map((m: any) => ({
    name: m.name,
    text: m.text || '',
    createTime: m.createTime,
    sender: {
      name: m.sender?.name || '',
      displayName: m.sender?.displayName || 'Chat Member',
      avatarUrl: m.sender?.avatarUrl,
      type: m.sender?.type || 'HUMAN',
    },
  }));
}

export async function sendGoogleChatMessage(spaceName: string, text: string): Promise<GoogleChatMessage> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated. Please sign in with Google.');
  }

  if (token === 'DEMO_WORKSPACE_TOKEN') {
    const newMsg: GoogleChatMessage = {
      name: `${spaceName}/messages/${Date.now()}`,
      text,
      createTime: new Date().toISOString(),
      sender: {
        name: 'users/me',
        displayName: 'Shahriyar Shehab (You)',
        type: 'HUMAN',
      },
    };
    if (!demoMessagesStore[spaceName]) {
      demoMessagesStore[spaceName] = [];
    }
    demoMessagesStore[spaceName] = [...demoMessagesStore[spaceName], newMsg];
    return newMsg;
  }

  const res = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to post message: ${res.statusText}`);
  }

  const m = await res.json();
  return {
    name: m.name,
    text: m.text || text,
    createTime: m.createTime || new Date().toISOString(),
    sender: {
      name: m.sender?.name || '',
      displayName: m.sender?.displayName || 'Me',
      avatarUrl: m.sender?.avatarUrl,
      type: m.sender?.type || 'HUMAN',
    },
  };
}
