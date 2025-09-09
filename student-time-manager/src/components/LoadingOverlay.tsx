import { useEffect, useState } from 'react';

export default function LoadingOverlay() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setVisible(false), 600);
    return () => clearTimeout(id);
  }, []);
  if (!visible) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)', zIndex: 50 }}>
      <div style={{ padding: 16, borderRadius: 12, border: '1px solid #333', background: '#121214' }}>
        <div style={{ width: 220, height: 8, background: '#0e0e10', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ width: '60%', height: '100%', background: '#8ab4ff', animation: 'loadingbar 1.2s ease-in-out infinite' }} />
        </div>
      </div>
      <style>{`@keyframes loadingbar { 0%{transform: translateX(-100%)} 50%{transform: translateX(20%)} 100%{transform: translateX(120%)} }`}</style>
    </div>
  );
}

