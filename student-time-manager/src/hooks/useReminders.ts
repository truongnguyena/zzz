import { useEffect } from 'react';
import { differenceInMinutes, parseISO } from 'date-fns';
import { useLiveAggregatedTasks } from './useLiveData';

export function useReminders() {
  const { tasks } = useLiveAggregatedTasks();

  useEffect(() => {
    if (typeof window === 'undefined' || typeof Notification === 'undefined') return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || Notification.permission !== 'granted') return;
    const id = setInterval(() => {
      const now = new Date();
      for (const t of tasks) {
        if (t.completedAt) continue;
        const mins = differenceInMinutes(parseISO(t.dueAt), now);
        if (mins === 60 || mins === 30 || mins === 5) {
          new Notification('Upcoming task', { body: `${t.title} in ${mins} minutes` });
        }
      }
    }, 60000);
    return () => clearInterval(id);
  }, [tasks]);
}

