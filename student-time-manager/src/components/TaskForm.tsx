import { useEffect, useMemo, useState } from 'react';
import { addHours, formatISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import type { Task, TaskPriority } from '../types';

interface Props {
  task?: Task | null;
  onSaved?: () => void;
}

export default function TaskForm({ task, onSaved }: Props) {
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

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
      <div style={{ display: 'grid', gap: 4 }}>
        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="What will you do?" />
      </div>
      <div style={{ display: 'grid', gap: 4 }}>
        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional details" />
      </div>
      <div style={{ display: 'grid', gap: 4, gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'center' }}>
        <div style={{ display: 'grid', gap: 4 }}>
          <label>Estimate (minutes)</label>
          <input type="number" min={5} step={5} value={estimatedMinutes}
                 onChange={(e) => setEstimatedMinutes(Number(e.target.value))} required />
        </div>
        <div style={{ display: 'grid', gap: 4 }}>
          <label>Due at (ISO)</label>
          <input value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
        </div>
        <div style={{ display: 'grid', gap: 4 }}>
          <label>Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      <div>
        <button type="submit">{task ? 'Save Changes' : 'Add Task'}</button>
      </div>
    </form>
  );
}

