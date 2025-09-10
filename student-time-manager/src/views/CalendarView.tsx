import { eachDayOfInterval, endOfWeek, format, isSameDay, parseISO, startOfWeek } from 'date-fns';
import { useLiveAggregatedTasks } from '../hooks/useLiveData';
import { useEffect, useState } from 'react';
import { db } from '../db';
import type { CalendarEvent } from '../types';
import { useCalendarSync } from '../hooks/useCalendarSync';
import { useI18n } from '../i18n/i18n';
import { deleteAclRule, ensureSignedIn, insertAclRule, listAclRules, type AclRule } from '../services/google';

export default function CalendarView() {
  const { tasks } = useLiveAggregatedTasks();
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const end = endOfWeek(start, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const { sync, syncing, error } = useCalendarSync();
  const { t } = useI18n();
  const [acl, setAcl] = useState<AclRule[]>([]);
  const [shareEmail, setShareEmail] = useState('');
  const [shareRole, setShareRole] = useState<AclRule['role']>('reader');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const all = await db.table<CalendarEvent>('events').toArray();
      if (!cancelled) setEvents(all);
    })();
    return () => { cancelled = true };
  }, [syncing]);

  return (
    <div style={{ padding: 16 }}>
      <h2>{t('calendar.title')}</h2>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <button onClick={sync} disabled={syncing}>{syncing ? 'Syncing…' : t('calendar.sync')}</button>
        <button onClick={async () => { await ensureSignedIn(); const rules = await listAclRules('primary'); setAcl(rules); }}>ACL</button>
        {error && <span style={{ color: '#ff6b6b' }}>{error}</span>}
      </div>
      {acl.length > 0 && (
        <div style={{ border: '1px solid #333', borderRadius: 10, padding: 12, background: '#151516', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <input placeholder="email@example.com" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} />
            <select value={shareRole} onChange={(e) => setShareRole(e.target.value as any)}>
              <option value="freeBusyReader">freeBusyReader</option>
              <option value="reader">reader</option>
              <option value="writer">writer</option>
              <option value="owner">owner</option>
            </select>
            <button onClick={async () => { if (!shareEmail) return; await ensureSignedIn(); await insertAclRule('primary', shareEmail, shareRole); setShareEmail(''); const rules = await listAclRules('primary'); setAcl(rules); }}>Share</button>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
            {acl.map((r) => (
              <li key={r.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, border: '1px solid #2a2a2e', borderRadius: 8, padding: '6px 8px', background: '#101014' }}>
                <span>{r.scope.type}{r.scope.value ? `:${r.scope.value}` : ''} — {r.role}</span>
                <button onClick={async () => { await ensureSignedIn(); await deleteAclRule('primary', r.id); const rules = await listAclRules('primary'); setAcl(rules); }}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
        {days.map((d) => (
          <div key={d.toISOString()} style={{ border: '1px solid #301236', borderRadius: 12, padding: 8, minHeight: 140, background: '#170a1d' }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{format(d, 'EEE d')}</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
              {tasks
                .filter((t) => isSameDay(parseISO(t.dueAt), d))
                .map((t) => (
                  <li key={t.id} style={{ fontSize: 12, border: '1px solid #301236', borderRadius: 8, padding: '4px 6px', background: '#14091b' }}>
                    <span style={{ opacity: 0.85 }}>{t.title}</span>
                  </li>
                ))}
              {events
                .filter((e) => isSameDay(parseISO(e.start), d))
                .map((e) => (
                  <li key={e.id} style={{ fontSize: 12, border: '1px dashed #301236', borderRadius: 8, padding: '4px 6px', background: '#120816' }}>
                    <span style={{ opacity: 0.85 }}>🗓 {e.summary}</span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

