import { useEffect, useState } from 'react';
import { db } from '../db';
import type { CalendarEvent, SessionLog, Task } from '../types';

const PRESET_COLORS = [
  { name: 'Pink', primary: '#ff7ac6', ring: '#ff9bd6' },
  { name: 'Purple', primary: '#c084fc', ring: '#d8b4fe' },
  { name: 'Blue', primary: '#60a5fa', ring: '#93c5fd' },
  { name: 'Green', primary: '#34d399', ring: '#6ee7b7' },
  { name: 'Gold', primary: '#f59e0b', ring: '#fbbf24' },
];

export default function SettingsView() {
  const [accent, setAccent] = useState<string>(() => localStorage.getItem('accent-primary') || getComputedStyle(document.documentElement).getPropertyValue('--primary').trim());

  useEffect(() => {
    if (!accent) return;
    document.documentElement.style.setProperty('--primary', accent);
    localStorage.setItem('accent-primary', accent);
  }, [accent]);

  async function handleExport() {
    const [tasks, sessions, events] = await Promise.all([
      db.table<Task>('tasks').toArray(),
      db.table<SessionLog>('sessions').toArray(),
      db.table<CalendarEvent>('events').toArray().catch(() => [] as CalendarEvent[]),
    ]);
    const blob = new Blob([JSON.stringify({ tasks, sessions, events }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stm-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const data = JSON.parse(text);
    if (Array.isArray(data.tasks)) {
      await db.table<Task>('tasks').clear();
      await db.table<Task>('tasks').bulkPut(data.tasks);
    }
    if (Array.isArray(data.sessions)) {
      await db.table<SessionLog>('sessions').clear();
      await db.table<SessionLog>('sessions').bulkPut(data.sessions);
    }
    if (Array.isArray(data.events)) {
      try {
        await db.table<CalendarEvent>('events').clear();
        await db.table<CalendarEvent>('events').bulkPut(data.events);
      } catch {}
    }
    e.currentTarget.value = '';
    alert('Imported successfully.');
  }

  return (
    <div style={{ padding: 16, display: 'grid', gap: 16 }}>
      <h2>Settings</h2>
      <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--muted)' }}>
        <strong>Accent color</strong>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          {PRESET_COLORS.map((c) => (
            <button key={c.name} onClick={() => setAccent(c.primary)} style={{ background: c.primary, color: '#0f0f10', borderColor: 'transparent' }}>{c.name}</button>
          ))}
        </div>
      </div>
      <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--muted)' }}>
        <strong>Export / Import</strong>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
          <button onClick={handleExport}>Export JSON</button>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <input type="file" accept="application/json" onChange={handleImport} />
          </label>
        </div>
      </div>
    </div>
  );
}

