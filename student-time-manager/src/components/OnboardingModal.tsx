import { useEffect, useState } from 'react';
import { ensureSignedIn } from '../services/google';

export default function OnboardingModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('seen-onboarding');
    if (!seen) setOpen(true);
  }, []);

  async function allowNotifications() {
    try { await Notification.requestPermission(); } catch {}
  }

  async function signInGoogle() {
    try { await ensureSignedIn(); } catch {}
  }

  function close() {
    localStorage.setItem('seen-onboarding', '1');
    setOpen(false);
  }

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(10,0,15,0.6)', backdropFilter: 'blur(4px)' }}>
      <div style={{ maxWidth: 560, margin: '10vh auto', border: '1px solid var(--border)', borderRadius: 12, background: 'var(--muted)', padding: 16 }}>
        <h3>Welcome ✨</h3>
        <p>Enable notifications and sign in with Google to sync calendar and get reminders.</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={allowNotifications}>Allow notifications</button>
          <button onClick={signInGoogle}>Sign in Google</button>
          <button onClick={close}>Got it</button>
        </div>
      </div>
    </div>
  );
}

