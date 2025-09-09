import { eachDayOfInterval, endOfWeek, format, isSameDay, parseISO, startOfWeek } from 'date-fns';
import { useLiveAggregatedTasks } from '../hooks/useLiveData';

export default function CalendarView() {
  const { tasks } = useLiveAggregatedTasks();
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const end = endOfWeek(start, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  return (
    <div style={{ padding: 16 }}>
      <h2>Calendar</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
        {days.map((d) => (
          <div key={d.toISOString()} style={{ border: '1px solid #333', borderRadius: 10, padding: 8, minHeight: 140, background: '#151516' }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{format(d, 'EEE d')}</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
              {tasks
                .filter((t) => isSameDay(parseISO(t.dueAt), d))
                .map((t) => (
                  <li key={t.id} style={{ fontSize: 12, border: '1px solid #2a2a2e', borderRadius: 8, padding: '4px 6px', background: '#101014' }}>
                    <span style={{ opacity: 0.85 }}>{t.title}</span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

