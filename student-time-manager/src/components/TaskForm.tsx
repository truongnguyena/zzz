import { useEffect, useMemo, useState } from 'react';
import { addHours, formatISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import type { Task, TaskPriority } from '../types';
import { useI18n } from '../i18n/i18n';

interface Props {
  task?: Task | null;
  onSaved?: () => void;
}

export default function TaskForm({ task, onSaved }: Props) {
  const { t } = useI18n();
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(task?.estimatedMinutes ?? 60);
  const defaultDue = useMemo(() => formatISO(addHours(new Date(), 24)), []);
  const [dueAt, setDueAt] = useState<string>(task?.dueAt ?? defaultDue);
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'medium');

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description ?? '');
    setEstimatedMinutes(task.estimatedMinutes);
    setDueAt(task.dueAt);
    setPriority(task.priority);
  }, [task]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nowIso = new Date().toISOString();
    if (task) {
      const updated = { ...task, title, description, estimatedMinutes, dueAt, priority, updatedAt: nowIso };
      await db.table<Task>('tasks').put(updated);
    } else {
      const newTask: Task = {
        id: uuidv4(),
        title,
        description,
        estimatedMinutes,
        dueAt,
        createdAt: nowIso,
        updatedAt: nowIso,
        completedAt: null,
        priority,
        labels: [],
      };
      await db.table<Task>('tasks').add(newTask);
    }
    onSaved?.();
    setTitle('');
    setDescription('');
    setEstimatedMinutes(60);
    setDueAt(defaultDue);
    setPriority('medium');
  }

  function toLocalInputValue(iso: string): string {
    try {
      const d = new Date(iso);
      const tzOffset = d.getTimezoneOffset() * 60000;
      const local = new Date(d.getTime() - tzOffset);
      return local.toISOString().slice(0, 16);
    } catch {
      return iso;
    }
  }

  function fromLocalInputValue(localValue: string): string {
    // localValue like '2025-09-09T12:30'
    try {
      const [datePart, timePart] = localValue.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);
      const local = new Date(year, (month - 1), day, hour, minute);
      return local.toISOString();
    } catch {
      return localValue;
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, marginBottom: 16, background: 'linear-gradient(135deg, #14091b, #1c0b26)', padding: 12, borderRadius: 12, border: '1px solid #301236', boxShadow: '0 10px 30px rgba(255,122,198,0.08)' }}>
      <div style={{ display: 'grid', gap: 4 }}>
        <label>{t('form.title')}</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder={t('form.title')} />
      </div>
      <div style={{ display: 'grid', gap: 4 }}>
        <label>{t('form.description')}</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('form.description')} />
      </div>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'center' }}>
        <div style={{ display: 'grid', gap: 4 }}>
          <label>{t('form.estimate')}</label>
          <input type="number" min={5} step={5} value={estimatedMinutes}
                 onChange={(e) => setEstimatedMinutes(Number(e.target.value))} required />
        </div>
        <div style={{ display: 'grid', gap: 4 }}>
          <label>{t('form.due')}</label>
          <input type="datetime-local" value={toLocalInputValue(dueAt)} onChange={(e) => setDueAt(fromLocalInputValue(e.target.value))} />
        </div>
        <div style={{ display: 'grid', gap: 4 }}>
          <label>{t('form.priority')}</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="submit">{task ? t('form.save') : t('form.add')}</button>
      </div>
    </form>
  );
}

