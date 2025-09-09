import { addMinutes, areIntervalsOverlapping, parseISO } from 'date-fns';
import type { AggregatedTask, CalendarEvent } from '../types';

export interface HabitProfile {
  preferredStartHour: number; // e.g., 20 = 8PM
  preferredEndHour: number; // e.g., 24 = midnight
  minBlockMinutes: number; // e.g., 30
}

export function findFreeSlot(
  task: AggregatedTask,
  busyEvents: CalendarEvent[],
  profile: HabitProfile,
  searchHorizonMinutes = 7 * 24 * 60
): { start: Date; end: Date } | null {
  const now = new Date();
  const endSearch = addMinutes(now, searchHorizonMinutes);
  const block = Math.max(profile.minBlockMinutes, Math.min(180, task.remainingMinutes || task.estimatedMinutes));

  let cursor = now;
  while (cursor < endSearch) {
    const day = new Date(cursor);
    const startBlock = new Date(day);
    startBlock.setHours(profile.preferredStartHour, 0, 0, 0);
    const endBlock = new Date(day);
    endBlock.setHours(profile.preferredEndHour, 0, 0, 0);
    if (cursor > startBlock) startBlock.setTime(cursor.getTime());

    // Try stepping through 15-minute increments
    for (let t = new Date(startBlock); t < endBlock; t = addMinutes(t, 15)) {
      const slotStart = t;
      const slotEnd = addMinutes(slotStart, block);
      if (slotEnd > endBlock) break;
      const overlaps = busyEvents.some((e) => areIntervalsOverlapping(
        { start: parseISO(e.start), end: parseISO(e.end) },
        { start: slotStart, end: slotEnd },
        { inclusive: false }
      ));
      if (!overlaps) return { start: slotStart, end: slotEnd };
    }
    // Move to next day
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);
    nextDay.setHours(0, 0, 0, 0);
    cursor = nextDay;
  }
  return null;
}

