import { useCallback, useState } from 'react';
import { db } from '../db';
import type { CalendarEvent } from '../types';
import { ensureSignedIn, listUpcomingEvents } from '../services/google';

export function useCalendarSync() {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sync = useCallback(async () => {
    setError(null);
    setSyncing(true);
    try {
      await ensureSignedIn();
      const items = await listUpcomingEvents(200);
      const rows: CalendarEvent[] = items.map((x) => ({
        id: x.id,
        summary: x.summary,
        description: x.description,
        start: x.start,
        end: x.end,
        source: 'google',
      }));
      await db.table<CalendarEvent>('events').clear();
      await db.table<CalendarEvent>('events').bulkAdd(rows);
    } catch (e: any) {
      setError(e?.message ?? 'Sync failed');
    } finally {
      setSyncing(false);
    }
  }, []);

  return { sync, syncing, error };
}

