import { useState } from 'react';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { useLiveAggregatedTasks, useProcrastinationCoefficient } from '../hooks/useLiveData';
import type { AggregatedTask } from '../types';

export default function FocusView() {
  const { tasks } = useLiveAggregatedTasks();
  const coeff = useProcrastinationCoefficient();
  const [editing, setEditing] = useState<AggregatedTask | null>(null);

  return (
    <div style={{ padding: 16, display: 'grid', gap: 16 }}>
      <h2>Focus</h2>
      <TaskForm task={editing ?? undefined} onSaved={() => setEditing(null)} />
      <TaskList tasks={tasks} procrastinationCoefficient={coeff} onEdit={(t) => setEditing(t)} />
    </div>
  );
}

