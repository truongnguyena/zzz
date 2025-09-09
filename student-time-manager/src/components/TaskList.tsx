import { useMemo, useState } from 'react';
import { db } from '../db';
import type { AggregatedTask } from '../types';
import { computeUrgencyScore, formatDateTime, formatMinutes } from '../utils/time';

interface Props {
  tasks: AggregatedTask[];
  procrastinationCoefficient: number;
  onEdit: (task: AggregatedTask) => void;
}

export default function TaskList({ tasks, procrastinationCoefficient, onEdit }: Props) {
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

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="checkbox" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} />
          Open only
        </label>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {filtered.map((t) => {
          const urgency = computeUrgencyScore(t, procrastinationCoefficient);
          const pressure = urgency < 60 ? '#ffdddd' : urgency < 180 ? '#fff2cc' : 'transparent';
          return (
            <li key={t.id} style={{ border: '1px solid #333', borderRadius: 8, padding: 12, marginBottom: 8, background: pressure }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div>
                  <strong>{t.title}</strong>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>{t.description}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => onEdit(t)}>Edit</button>
                  <button onClick={() => toggleComplete(t)}>{t.completedAt ? 'Reopen' : 'Done'}</button>
                  <button onClick={() => remove(t)}>Delete</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, opacity: 0.9, marginTop: 8, flexWrap: 'wrap' }}>
                <span>Due: {formatDateTime(t.dueAt)}</span>
                <span>Est: {formatMinutes(t.estimatedMinutes)}</span>
                <span>Spent: {formatMinutes(t.actualMinutes)}</span>
                <span>Remaining: {formatMinutes(t.remainingMinutes)}</span>
                <span>Priority: {t.priority}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

