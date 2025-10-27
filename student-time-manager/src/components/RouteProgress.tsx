import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function RouteProgress() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setVisible(true);
    setWidth(0);
    let progress = 0;
    const tick = () => {
      progress = Math.min(95, progress + 7 + Math.random() * 6);
      setWidth(progress);
      timerRef.current = window.setTimeout(tick, 120);
    };
    tick();
    const done = window.setTimeout(() => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      setWidth(100);
      setTimeout(() => setVisible(false), 300);
    }, 700);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      window.clearTimeout(done);
    };
  }, [pathname]);

  if (!visible) return null;
  return (
    <div style={{ position: 'fixed', left: 0, top: 0, height: 3, width: '100%', zIndex: 90, background: 'transparent' }}>
      <div style={{ height: '100%', width: `${width}%`, transition: 'width 120ms ease', background: 'linear-gradient(90deg,#ff7ac6,#ff9bd6)' }} />
    </div>
  );
}

