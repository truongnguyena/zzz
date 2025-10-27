import type { AggregatedTask } from '../types';
import { computeUrgencyScore } from '../utils/time';

export interface CoachSuggestion {
  action: 'prioritize' | 'plan' | 'create';
  message: string;
}

export async function prioritizeTasks(tasks: AggregatedTask[]): Promise<AggregatedTask[]> {
  const coeff = await estimateProcrastinationCoefficient(tasks);
  return [...tasks].sort((a, b) => computeUrgencyScore(a, coeff) - computeUrgencyScore(b, coeff));
}

export async function estimateProcrastinationCoefficient(tasks: AggregatedTask[]): Promise<number> {
  // Local heuristic fallback: if avg remaining > 50% of estimate for completed tasks, bump coeff
  const completed = tasks.filter((t) => !!t.completedAt);
  if (completed.length === 0) return 1;
  let ratios = 0;
  let count = 0;
  for (const t of completed) {
    if (t.estimatedMinutes > 0 && t.actualMinutes > 0) {
      ratios += t.actualMinutes / t.estimatedMinutes;
      count += 1;
    }
  }
  if (count === 0) return 1;
  return Math.min(4, Math.max(0.5, ratios / count));
}

export async function quickAddFromText(input: string): Promise<{ title: string; estimatedMinutes: number; dueAt?: string; priority?: 'low'|'medium'|'high' } | null> {
  // Very simple parser: "[title] in 45m by 2025-09-10 21:00 !high"
  const titleMatch = input.match(/^[^!]+?/);
  if (!titleMatch) return null;
  const title = titleMatch[0].trim();
  const minutesMatch = input.match(/\bin\s*(\d+)\s*m\b/i);
  const estimatedMinutes = minutesMatch ? Number(minutesMatch[1]) : 60;
  const dueMatch = input.match(/\bby\s*(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2})/i);
  const dueAt = dueMatch ? new Date(dueMatch[1].replace(' ', 'T')).toISOString() : undefined;
  const prioMatch = input.match(/!(low|medium|high)/i);
  const priority = (prioMatch ? prioMatch[1].toLowerCase() : undefined) as any;
  return { title, estimatedMinutes, dueAt, priority };
}

export async function generateDailyPlan(tasks: AggregatedTask[]): Promise<CoachSuggestion[]> {
  const top = await prioritizeTasks(tasks);
  const pick = top.slice(0, 5);
  return [
    { action: 'prioritize', message: `Top hôm nay: ${pick.map((t) => t.title).join(', ')}` },
    { action: 'plan', message: 'Dành 25 phút cho mỗi mục theo Pomodoro, nghỉ 5 phút giữa các phiên.' },
  ];
}

