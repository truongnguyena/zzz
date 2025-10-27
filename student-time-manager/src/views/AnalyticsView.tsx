import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { db } from '../db';
import type { SessionLog, Task } from '../types';
import { format, parseISO } from 'date-fns';
import { useI18n } from '../i18n/i18n';
import { listBigML } from '../services/bigml';

export default function AnalyticsView() {
  const [data, setData] = useState<{ day: string; minutes: number }[]>([]);
  const [avgRatio, setAvgRatio] = useState<number>(1);
  const [bigml, setBigml] = useState<any[]>([]);
  const [hours, setHours] = useState<{ hour: number; minutes: number }[]>([]);

  useEffect(() => {
    async function load() {
      const [sessions, tasks] = await Promise.all([
        db.table<SessionLog>('sessions').toArray(),
        db.table<Task>('tasks').toArray(),
      ]);
      const map = new Map<string, number>();
      for (const s of sessions) {
        const day = format(parseISO(s.startedAt), 'yyyy-MM-dd');
        map.set(day, (map.get(day) ?? 0) + s.durationMinutes);
      }
      const rows = Array.from(map.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([day, minutes]) => ({ day, minutes }));
      setData(rows);

      // Compute average actual/estimate ratio for completed tasks
      const actualByTask = new Map<string, number>();
      for (const s of sessions) {
        actualByTask.set(s.taskId, (actualByTask.get(s.taskId) ?? 0) + s.durationMinutes);
      }
      let sum = 0;
      let count = 0;
      for (const t of tasks) {
        if (!t.completedAt) continue;
        const actual = actualByTask.get(t.id) ?? 0;
        if (t.estimatedMinutes > 0 && actual > 0) {
          sum += actual / t.estimatedMinutes;
          count += 1;
        }
      }
      setAvgRatio(count ? Math.round((sum / count) * 100) / 100 : 1);

      // Best work hours (aggregate session minutes by start hour)
      const hourMap = new Map<number, number>();
      for (const s of sessions) {
        const h = parseISO(s.startedAt).getHours();
        hourMap.set(h, (hourMap.get(h) ?? 0) + s.durationMinutes);
      }
      const hourRows = Array.from({ length: 24 }).map((_, h) => ({ hour: h, minutes: hourMap.get(h) ?? 0 }));
      setHours(hourRows);
    }
    load();
  }, []);

  const totalMinutes = useMemo(() => data.reduce((acc, d) => acc + d.minutes, 0), [data]);
  const { t } = useI18n();

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h2>{t('analytics.title')}</h2>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ border: '1px solid #301236', borderRadius: 10, padding: 12, background: '#170a1d' }}>{t('analytics.avgRatio')}: <strong>{avgRatio}x</strong></div>
        <div style={{ border: '1px solid #301236', borderRadius: 10, padding: 12, background: '#170a1d' }}>{t('analytics.total')}: <strong>{totalMinutes}</strong></div>
      </div>
      <div style={{ marginTop: 12, border: '1px solid #301236', borderRadius: 10, padding: 12, background: '#170a1d' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <button onClick={async () => { try { const r = await listBigML('model'); setBigml(r?.objects || r?.resources || []); } catch (e) {} }}>BigML Models</button>
          <button onClick={async () => { try { const r = await listBigML('dataset'); setBigml(r?.objects || r?.resources || []); } catch (e) {} }}>BigML Datasets</button>
        </div>
        {bigml.length > 0 && (
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {bigml.slice(0, 8).map((it: any, idx: number) => <li key={idx}>{typeof it === 'string' ? it : (it?.name || it?.resource || 'item')}</li>)}
          </ul>
        )}
      </div>
      <div style={{ width: '100%', height: 320, border: '1px solid #301236', borderRadius: 12, background: '#170a1d', padding: 8 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="minutes" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ width: '100%', height: 240, border: '1px solid #301236', borderRadius: 12, background: '#170a1d', padding: 8 }}>
        <ResponsiveContainer>
          <BarChart data={hours}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="minutes" fill="#ff7ac6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

