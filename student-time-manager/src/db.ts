import Dexie, { type Table } from 'dexie';
import { addDays, addHours } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import type { Task, SessionLog, UUID, CalendarEvent } from './types';

class AppDatabase extends Dexie {
  public tasks!: Table<Task, UUID>;
  public sessions!: Table<SessionLog, UUID>;
  public events!: Table<CalendarEvent, string>;

  constructor() {
    super('student_time_manager');
    this.version(1).stores({
      tasks: 'id, dueAt, completedAt, priority, title',
      sessions: 'id, taskId, startedAt, endedAt',
    });
    this.version(2).stores({
      tasks: 'id, dueAt, completedAt, priority, title',
      sessions: 'id, taskId, startedAt, endedAt',
      events: 'id, start, end, source',
    });
  }
}

export const db = new AppDatabase();

export async function seedIfEmpty(): Promise<void> {
  const count = await db.table('tasks').count();
  if (count > 0) return;

  const now = new Date();
  const sampleTitles = [
    'Read chapter on Machine Learning',
    'Finish Calculus problem set',
    'Prepare slides for group project',
    'Part-time shift at cafe',
    'Vietnamese history essay draft',
    'Physics lab report',
    'Buy groceries',
    'Gym workout',
    'Meet professor for office hours',
    'Review Algorithms lecture notes',
  ];

  const tasks: Task[] = [];
  for (let i = 0; i < 25; i += 1) {
    const title = sampleTitles[i % sampleTitles.length];
    const priority = (['low', 'medium', 'high'] as const)[i % 3];
    const estimatedMinutes = 30 + (i % 6) * 15;
    const dueAt = addDays(addHours(now, (i % 10) * 3), (i % 14) - 7).toISOString();
    const createdAt = now.toISOString();
    const updatedAt = createdAt;
    tasks.push({
      id: uuidv4(),
      title: `${title} #${i + 1}`,
      description: '',
      estimatedMinutes,
      dueAt,
      createdAt,
      updatedAt,
      completedAt: null,
      priority,
      labels: [],
    });
  }

  await db.table('tasks').bulkAdd(tasks);
}

