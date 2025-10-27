import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Command { key: string; label: string; run: () => void }

export default function CommandPalette() {
  const navigate = useNavigate();
  const commands: Command[] = useMemo(() => [
    { key: 'focus', label: 'Go to Focus', run: () => navigate('/') },
    { key: 'calendar', label: 'Go to Calendar', run: () => navigate('/calendar') },
    { key: 'analytics', label: 'Go to Analytics', run: () => navigate('/analytics') },
    { key: 'coach', label: 'Go to Coach', run: () => navigate('/coach') },
  ], [navigate]);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen((v) => !v); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filtered = useMemo(() => commands.filter(c => c.label.toLowerCase().includes(q.toLowerCase())), [q, commands]);

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,0,15,0.55)', backdropFilter: 'blur(4px)', zIndex: 70 }} onClick={() => setOpen(false)}>
      <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560, margin: '10vh auto 0', border: '1px solid #301236', borderRadius: 12, background: 'linear-gradient(135deg,#180a20,#210b2c)', padding: 12, boxShadow: '0 20px 60px rgba(255,122,198,0.15)' }}>
        <input autoFocus placeholder="Type a command... (Ctrl+K)" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: '100%' }} />
        <ul style={{ listStyle: 'none', margin: '8px 0 0 0', padding: 0, maxHeight: 260, overflow: 'auto', display: 'grid', gap: 6 }}>
          {filtered.map((c) => (
            <li key={c.key}>
              <button onClick={() => { c.run(); setOpen(false); }} style={{ width: '100%', textAlign: 'left' }}>{c.label}</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

