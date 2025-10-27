export type UUID = string;

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: UUID;
  title: string;
  description?: string;
  estimatedMinutes: number;
  dueAt: string; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  completedAt?: string | null; // ISO string or null
  priority: TaskPriority;
  labels?: string[];
  googleEventId?: string | null;
}

export interface SessionLog {
  id: UUID;
  taskId: UUID;
  startedAt: string; // ISO string
  endedAt: string; // ISO string
  durationMinutes: number;
}

export interface AggregatedTask extends Task {
  actualMinutes: number;
  remainingMinutes: number;
}

export interface CalendarEvent {
  id: UUID; // Google event id
  summary: string;
  description?: string;
  start: string; // ISO
  end: string; // ISO
  source: 'google';
}

