import { useState } from 'react';
import { useLiveAggregatedTasks } from '../hooks/useLiveData';
import { generateDailyPlan, prioritizeTasks, quickAddFromText } from '../services/coach';
import { db } from '../db';
import type { Task } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useI18n } from '../i18n/i18n';

export default function CoachView() {
  const { tasks } = useLiveAggregatedTasks();
  const [plan, setPlan] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  const { t } = useI18n();

  async function handlePrioritize() {
    const ordered = await prioritizeTasks(tasks);
    setPlan(ordered.slice(0, 10).map((t) => t.title));
  }

  async function handleDailyPlan() {
    const suggestions = await generateDailyPlan(tasks);
    setPlan(suggestions.map((s) => s.message));
  }

  async function handleQuickAdd() {
    const parsed = await quickAddFromText(prompt);
    if (!parsed) return;
    const nowIso = new Date().toISOString();
    const newTask: Task = {
      id: uuidv4(),
      title: parsed.title,
      description: '',
      estimatedMinutes: parsed.estimatedMinutes,
      dueAt: parsed.dueAt ?? nowIso,
      createdAt: nowIso,
      updatedAt: nowIso,
      completedAt: null,
      priority: parsed.priority ?? 'medium',
      labels: [],
    };
    await db.table<Task>('tasks').add(newTask);
    setPrompt('');
  }

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h2>{t('coach.title')}</h2>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={handlePrioritize}>{t('coach.prioritize')}</button>
        <button onClick={handleDailyPlan}>{t('coach.dailyPlan')}</button>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        <label>{t('coach.quickAdd.label')}</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder={t('list.search')} value={prompt} onChange={(e) => setPrompt(e.target.value)} style={{ flex: 1 }} />
          <button onClick={handleQuickAdd}>{t('form.add')}</button>
        </div>
      </div>
      {plan.length > 0 && (
        <div style={{ border: '1px solid #333', borderRadius: 10, padding: 12, background: '#151516' }}>
          <strong>Gợi ý:</strong>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {plan.map((p, idx) => <li key={idx}>{p}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

