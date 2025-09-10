import { useState } from 'react';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { useLiveAggregatedTasks, useProcrastinationCoefficient } from '../hooks/useLiveData';
import type { AggregatedTask } from '../types';
import { triggerConfetti } from '../utils/confetti';
import Pomodoro from '../components/Pomodoro';

export default function FocusView() {
  const { tasks } = useLiveAggregatedTasks();
  const coeff = useProcrastinationCoefficient();
  const [editing, setEditing] = useState<AggregatedTask | null>(null);

  return (
    <div style={{ padding: 16, display: 'grid', gap: 16 }}>
      <h2>Focus</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Pomodoro onEnd={() => triggerConfetti()} />
      </div>
      <TaskForm task={editing ?? undefined} onSaved={() => setEditing(null)} />
      <TaskList tasks={tasks} procrastinationCoefficient={coeff} onEdit={(t) => setEditing(t)} />
    </div>
  );
}

