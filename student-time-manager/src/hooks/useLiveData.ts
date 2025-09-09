import { useEffect, useState } from 'react';
import { liveQuery } from 'dexie';
import { db } from '../db';
import type { AggregatedTask, SessionLog, Task } from '../types';

function aggregateTasks(tasks: Task[], sessions: SessionLog[]): AggregatedTask[] {
  const minutesByTask = new Map<string, number>();
  for (const s of sessions) {
    minutesByTask.set(s.taskId, (minutesByTask.get(s.taskId) ?? 0) + s.durationMinutes);
  }
  return tasks.map((t) => {
    const actual = minutesByTask.get(t.id) ?? 0;
    const remaining = Math.max(0, t.estimatedMinutes - actual);
    return { ...t, actualMinutes: actual, remainingMinutes: remaining };
  });
}

export function useLiveAggregatedTasks(): { tasks: AggregatedTask[]; loading: boolean; error: unknown } {
  const [tasks, setTasks] = useState<AggregatedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const sub = liveQuery(async () => {
      const [tasksRaw, sessions] = await Promise.all([
        db.table<Task>('tasks').toArray(),
        db.table<SessionLog>('sessions').toArray(),
      ]);
      return aggregateTasks(tasksRaw, sessions);
    }).subscribe({
      next: (data) => {
        setTasks(data);
        setLoading(false);
      },
      error: (err) => {
        setError(err);
        setLoading(false);
      },
    });
    return () => sub.unsubscribe();
  }, []);

  return { tasks, loading, error };
}

export function useProcrastinationCoefficient(): number {
  const [coeff, setCoeff] = useState(1);
  useEffect(() => {
    const sub = liveQuery(async () => {
      const sessions = await db.table<SessionLog>('sessions').toArray();
      const tasks = await db.table<Task>('tasks').toArray();
      if (sessions.length === 0) return 1;
      const actualByTask = new Map<string, number>();
      for (const s of sessions) {
        actualByTask.set(s.taskId, (actualByTask.get(s.taskId) ?? 0) + s.durationMinutes);
      }
      let sumRatios = 0;
      let count = 0;
      for (const t of tasks) {
        const actual = actualByTask.get(t.id) ?? 0;
        if (t.estimatedMinutes > 0 && actual > 0) {
          sumRatios += actual / t.estimatedMinutes;
          count += 1;
        }
      }
      if (count === 0) return 1;
      return Math.min(4, Math.max(0.5, sumRatios / count));
    }).subscribe({
      next: (c) => setCoeff(c),
    });
    return () => sub.unsubscribe();
  }, []);
  return coeff;
}

