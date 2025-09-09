// Lightweight Google Calendar integration using Google Identity Services (GIS)
// Requires env var VITE_GOOGLE_CLIENT_ID

const GIS_SRC = 'https://accounts.google.com/gsi/client';
const GAPI_SRC = 'https://apis.google.com/js/api.js';
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';

let tokenClient: any = null;
let accessToken: string | null = null;
let tokenExpiryMs = 0;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

export async function initGoogle(): Promise<void> {
  await Promise.all([loadScript(GIS_SRC), loadScript(GAPI_SRC)]);
  // @ts-ignore
  await new Promise<void>((r) => (window as any).gapi?.load('client', () => r()));
  // @ts-ignore
  const google = (window as any).google;
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('Missing VITE_GOOGLE_CLIENT_ID');
  }
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: CALENDAR_SCOPE,
    callback: (resp: any) => {
      if (resp && resp.access_token) {
        accessToken = resp.access_token;
        const expiresIn = Number(resp.expires_in ?? 3000);
        tokenExpiryMs = Date.now() + expiresIn * 1000 - 30000;
      }
    },
  });
}

export async function ensureSignedIn(): Promise<void> {
  if (!tokenClient) await initGoogle();
  if (accessToken && Date.now() < tokenExpiryMs) return;
  await new Promise<void>((resolve) => {
    tokenClient.requestAccessToken({ prompt: accessToken ? '' : 'consent' });
    const id = setInterval(() => {
      if (accessToken) {
        clearInterval(id);
        resolve();
      }
    }, 100);
  });
}

export function signOutGoogle(): void {
  if (!accessToken) return;
  try {
    // @ts-ignore
    const google = (window as any).google;
    google.accounts.oauth2.revoke(accessToken);
  } catch {}
  accessToken = null;
  tokenExpiryMs = 0;
}

function authHeaders(): HeadersInit {
  if (!accessToken) throw new Error('Not signed in');
  return { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };
}

interface EventInput {
  summary: string;
  description?: string;
  start: string; // ISO
  end: string; // ISO
}

export async function upsertCalendarEvent(primary: boolean, eventId: string | null | undefined, input: EventInput): Promise<string> {
  const calendarId = primary ? 'primary' : 'primary';
  const urlBase = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;
  const body = {
    summary: input.summary,
    description: input.description ?? '',
    start: { dateTime: input.start },
    end: { dateTime: input.end },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
        { method: 'popup', minutes: 5 },
      ],
    },
  };
  const res = await fetch(eventId ? `${urlBase}/${encodeURIComponent(eventId)}` : urlBase, {
    method: eventId ? 'PATCH' : 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Calendar API error: ${res.status}`);
  const json = await res.json();
  return json.id as string;
}

