import { differenceInMinutes, format, isBefore, parseISO } from 'date-fns';
import type { AggregatedTask } from '../types';

export function formatDateTime(isoString: string): string {
  try {
    return format(parseISO(isoString), 'MMM d, HH:mm');
  } catch {
    return isoString;
  }
}

export function formatMinutes(totalMinutes: number): string {
  const minutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  if (hours === 0) return `${rem}m`;
  if (rem === 0) return `${hours}h`;
  return `${hours}h ${rem}m`;
}

export function isOverdue(task: AggregatedTask, now = new Date()): boolean {
  return isBefore(parseISO(task.dueAt), now) && !task.completedAt;
}

export function computeUrgencyScore(
  task: AggregatedTask,
  procrastinationCoefficient: number,
  now = new Date()
): number {
  const timeToDueMinutes = differenceInMinutes(parseISO(task.dueAt), now);
  const remaining = Math.max(0, task.remainingMinutes) * procrastinationCoefficient;
  // Lower score means higher urgency
  const slack = timeToDueMinutes - remaining;
  // Add priority weighting: high -> stronger penalty when slack is small
  const priorityWeight = task.priority === 'high' ? 2 : task.priority === 'medium' ? 1 : 0.5;
  return slack / priorityWeight;
}

