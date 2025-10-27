import { useEffect, useState } from 'react';

export default function AnimeLoading() {
  const [show, setShow] = useState(true);
  useEffect(() => { const id = setTimeout(() => setShow(false), 1200); return () => clearTimeout(id); }, []);
  if (!show) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', zIndex: 85, background: 'linear-gradient(135deg,#1a0b22,#2a0e33)' }}>
      <div style={{ position: 'relative' }}>
        <div style={{ width: 120, height: 120, borderRadius: '50%', border: '6px solid rgba(255,122,198,0.25)', borderTopColor: '#ff7ac6', animation: 'spin 1s linear infinite' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontWeight: 700, color: '#ff9bd6' }}>🌸</div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

