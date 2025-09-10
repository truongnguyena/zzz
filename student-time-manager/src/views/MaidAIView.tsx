import { useState } from 'react';
import { useI18n } from '../i18n/i18n';
import { useLiveAggregatedTasks } from '../hooks/useLiveData';
import { computeUrgencyScore } from '../utils/time';

export default function MaidAIView() {
  const { lang } = useI18n();
  const cutes = lang === 'vi'
    ? { hello: 'Chủ nhân ơi, em Kurumi đã sẵn sàng~', prompt: 'Hãy dặn em điều gì nhé...', send: 'Gợi ý đi nè', reply: 'Em nghĩ hôm nay chủ nhân nên làm: ' }
    : { hello: 'Master, Kurumi is ready~', prompt: 'Tell me anything...', send: 'Suggest', reply: 'I think you should do: ' };
  const { tasks } = useLiveAggregatedTasks();
  const [text, setText] = useState('');
  const [answer, setAnswer] = useState<string>('');

  function suggest() {
    const ordered = [...tasks].sort((a, b) => computeUrgencyScore(a, 1) - computeUrgencyScore(b, 1));
    const top = ordered.slice(0, 3).map((t) => t.title).join(', ');
    setAnswer(cutes.reply + top);
  }

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h2>Kurumi Maid AI</h2>
      <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--muted)' }}>
        <div style={{ marginBottom: 8 }}>{cutes.hello} ✨</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder={cutes.prompt} value={text} onChange={(e) => setText(e.target.value)} style={{ flex: 1 }} />
          <button onClick={suggest}>{cutes.send}</button>
        </div>
        {answer && <div style={{ marginTop: 10 }}>{answer}</div>}
      </div>
    </div>
  );
}

