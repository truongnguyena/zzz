import { useMemo, useState } from 'react';
import { db } from '../db';
import type { AggregatedTask } from '../types';
import { computeUrgencyScore, formatDateTime, formatMinutes } from '../utils/time';
import { ensureSignedIn, upsertCalendarEvent } from '../services/google';
import { addMinutes, parseISO } from 'date-fns';
import { db as database } from '../db';
import type { CalendarEvent } from '../types';
import { findFreeSlot } from '../utils/schedule';
import { useI18n } from '../i18n/i18n';

interface Props {
  tasks: AggregatedTask[];
  procrastinationCoefficient: number;
  onEdit: (task: AggregatedTask) => void;
}

export default function TaskList({ tasks, procrastinationCoefficient, onEdit }: Props) {
  const { t: tr } = useI18n();
  const [query, setQuery] = useState('');
  const [onlyOpen, setOnlyOpen] = useState(true);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return tasks
      .filter((t) => (onlyOpen ? !t.completedAt : true))
      .filter((t) => (normalized ? `${t.title} ${t.description ?? ''}`.toLowerCase().includes(normalized) : true))
      .sort((a, b) => computeUrgencyScore(a, procrastinationCoefficient) - computeUrgencyScore(b, procrastinationCoefficient));
  }, [tasks, query, onlyOpen, procrastinationCoefficient]);

  async function toggleComplete(task: AggregatedTask) {
    await db.table('tasks').update(task.id, { completedAt: task.completedAt ? null : new Date().toISOString() });
  }

  async function remove(task: AggregatedTask) {
    await db.table('tasks').delete(task.id);
  }

  async function syncToGoogle(task: AggregatedTask) {
    await ensureSignedIn();
    const start = parseISO(task.dueAt);
    const end = addMinutes(start, Math.max(30, task.remainingMinutes || 30));
    const eventId = await upsertCalendarEvent(true, task.googleEventId ?? null, {
      summary: task.title,
      description: task.description ?? '',
      start: start.toISOString(),
      end: end.toISOString(),
    });
    await db.table('tasks').update(task.id, { googleEventId: eventId });
  }

  async function autoSchedule(task: AggregatedTask) {
    await ensureSignedIn();
    const busy = await database.table<CalendarEvent>('events').toArray();
    const slot = findFreeSlot(task, busy, { preferredStartHour: 20, preferredEndHour: 24, minBlockMinutes: 30 });
    const start = slot?.start ?? new Date();
    const end = slot?.end ?? addMinutes(start, Math.max(30, task.remainingMinutes || 30));
    const eventId = await upsertCalendarEvent(true, task.googleEventId ?? null, {
      summary: task.title,
      description: `[Auto-scheduled] ${task.description ?? ''}`.trim(),
      start: start.toISOString(),
      end: end.toISOString(),
    });
    await db.table('tasks').update(task.id, { googleEventId: eventId });
  }

  function badgeColor(priority: string): string {
    if (priority === 'high') return '#ff6b6b';
    if (priority === 'medium') return '#ffd166';
    return '#06d6a0';
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input placeholder={tr('list.search')} value={query} onChange={(e) => setQuery(e.target.value)} />
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="checkbox" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} />
          {tr('list.openOnly')}
        </label>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {filtered.map((t) => {
          const urgency = computeUrgencyScore(t, procrastinationCoefficient);
          const pressure = urgency < 60 ? '#2a1313' : urgency < 180 ? '#2a2613' : '#151516';
          const progress = t.estimatedMinutes > 0 ? Math.min(100, Math.round((t.actualMinutes / t.estimatedMinutes) * 100)) : 0;
          return (
            <li key={t.id} style={{ border: '1px solid #333', borderRadius: 10, padding: 12, marginBottom: 8, background: pressure }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div>
                  <strong>{t.title}</strong>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>{t.description}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ padding: '2px 8px', borderRadius: 999, border: '1px solid #333', background: '#101014', fontSize: 12, alignSelf: 'center', color: badgeColor(t.priority) }}>{t.priority}</span>
                  <button onClick={() => onEdit(t)}>{tr('list.edit')}</button>
                  <button onClick={() => toggleComplete(t)}>{t.completedAt ? tr('list.reopen') : tr('list.done')}</button>
                  <button onClick={() => syncToGoogle(t)}>{t.googleEventId ? tr('list.updateGCal') : tr('list.addGCal')}</button>
                  <button onClick={() => autoSchedule(t)}>{tr('list.autoSchedule')}</button>
                  <button onClick={() => remove(t)}>{tr('list.delete')}</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, opacity: 0.9, marginTop: 8, flexWrap: 'wrap' }}>
                <span>Due: {formatDateTime(t.dueAt)}</span>
                <span>Est: {formatMinutes(t.estimatedMinutes)}</span>
                <span>Spent: {formatMinutes(t.actualMinutes)}</span>
                <span>Remaining: {formatMinutes(t.remainingMinutes)}</span>
              </div>
              <div style={{ marginTop: 8, background: '#0e0e10', borderRadius: 6, overflow: 'hidden', border: '1px solid #2a2a2e' }}>
                <div style={{ width: `${progress}%`, height: 8, background: '#8ab4ff' }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

