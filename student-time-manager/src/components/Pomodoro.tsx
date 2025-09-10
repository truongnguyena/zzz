import { useEffect, useMemo, useState } from 'react';

export default function Pomodoro({ onEnd }: { onEnd?: () => void }) {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const mmss = useMemo(() => new Date(seconds * 1000).toISOString().substring(14, 19), [seconds]);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s > 0 ? s - 1 : 0), 1000);
    return () => clearInterval(id);
  }, [running]);
  useEffect(() => { if (seconds === 0 && running) { setRunning(false); onEnd?.(); } }, [seconds, running, onEnd]);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ fontFeatureSettings: 'tnum', fontVariantNumeric: 'tabular-nums', fontSize: 18 }}>{mmss}</div>
      <button onClick={() => setRunning((v) => !v)}>{running ? 'Pause' : 'Start'}</button>
      <button onClick={() => { setSeconds(25 * 60); setRunning(false); }}>Reset</button>
    </div>
  );
}

