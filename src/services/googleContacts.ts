import { GoogleContact } from '../types';
import { getAccessToken } from './firebaseAuth';

export const DEMO_CONTACTS: GoogleContact[] = [
  {
    resourceName: 'people/c1001',
    displayName: 'Dr. Aris Thorne (SecOps)',
    email: 'aris.thorne@cyber-corp.org',
    phoneNumber: '+1 (555) 349-1102',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    resourceName: 'people/c1002',
    displayName: 'Maya Lin (Cryptanalyst)',
    email: 'maya.lin@zero-trace.io',
    phoneNumber: '+1 (555) 781-9920',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  },
  {
    resourceName: 'people/c1003',
    displayName: 'Liam Vance (Infrastructure)',
    email: 'liam.vance@cloudsec.dev',
    phoneNumber: '+1 (555) 492-8819',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  },
  {
    resourceName: 'people/c1004',
    displayName: 'Kari Nordstrom (Privacy Counsel)',
    email: 'kari.nordstrom@legal-mesh.net',
    phoneNumber: '+1 (555) 901-2244',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  },
];

export async function fetchGoogleContacts(): Promise<GoogleContact[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated. Please sign in with Google.');
  }

  if (token === 'DEMO_WORKSPACE_TOKEN') {
    return DEMO_CONTACTS;
  }

  const url = 'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,photos,phoneNumbers&pageSize=100';
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch contacts: ${res.statusText}`);
  }

  const data = await res.json();
  if (!data.connections || !Array.isArray(data.connections)) {
    return [];
  }

  return data.connections.map((c: any) => {
    const displayName = c.names?.[0]?.displayName || c.emailAddresses?.[0]?.value || 'Unknown Contact';
    const email = c.emailAddresses?.[0]?.value;
    const phoneNumber = c.phoneNumbers?.[0]?.value;
    const photoUrl = c.photos?.[0]?.url;

    return {
      resourceName: c.resourceName || Math.random().toString(),
      displayName,
      email,
      phoneNumber,
      photoUrl,
    };
  });
}
