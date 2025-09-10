import { useEffect, useRef, useState } from 'react';

export default function ConfettiLayer() {
  const [burst, setBurst] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    function onConfetti() { setBurst((b) => b + 1); }
    window.addEventListener('confetti' as any, onConfetti);
    return () => window.removeEventListener('confetti' as any, onConfetti);
  }, []);

  useEffect(() => {
    if (burst === 0) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);
    const pieces = Array.from({ length: 120 }).map(() => ({
      x: Math.random() * width,
      y: -20 - Math.random() * 60,
      dx: -1 + Math.random() * 2,
      dy: 2 + Math.random() * 2,
      size: 4 + Math.random() * 4,
      hue: 300 + Math.random() * 60,
      rot: Math.random() * Math.PI,
      dr: -0.2 + Math.random() * 0.4,
    }));
    let raf = 0;
    function draw() {
      ctx.clearRect(0, 0, width, height);
      let alive = false;
      for (const p of pieces) {
        p.x += p.dx; p.y += p.dy; p.rot += p.dr;
        if (p.y < height + 20) alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = `hsl(${p.hue}, 100%, 70%)`;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
      if (alive) raf = requestAnimationFrame(draw);
    }
    function onResize() { width = (canvas.width = canvas.offsetWidth); height = (canvas.height = canvas.offsetHeight); }
    window.addEventListener('resize', onResize);
    draw();
    const timeout = setTimeout(() => { cancelAnimationFrame(raf); ctx.clearRect(0, 0, width, height); }, 3000);
    return () => { clearTimeout(timeout); cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, [burst]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 60 }} />;
}

