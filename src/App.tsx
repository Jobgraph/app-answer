import { useState, useEffect } from 'react';
import { type AppConfig, loadConfig } from './config';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function App() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadConfig().then(setConfig); }, []);
  if (!config) return null;

  if (!config.isConfigured) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md space-y-4">
          <h1 className="text-2xl font-semibold">{config.appName}</h1>
          <p className="text-white/60">This app is not configured. Deploy it from Jobgraph to get started.</p>
          <a href="https://app.jobgraph.com" className="inline-block px-4 py-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500 transition-colors">Go to Jobgraph</a>
        </div>
      </div>
    );
  }

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const question = input;
    setInput('');
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `https://app.jobgraph.com/api/apps/${config!.deploymentId}/process`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input: question, type: 'answer', history: messages }) }
      );
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer ?? 'No response received.' }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
        {config.logoUrl && <img src={config.logoUrl} alt="" className="h-8 w-8 rounded" />}
        <h1 className="text-xl font-semibold">{config.appName}</h1>
        <span className="text-sm text-white/50">{config.orgName}</span>
      </header>
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-8 flex flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto mb-6">
          {messages.length === 0 && (
            <p className="text-white/40 text-center pt-12">Ask a question to get started</p>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-4 py-3 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white/5 border border-white/10 text-white/80'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/50">Thinking...</div>
            </div>
          )}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">{error}</div>
          )}
        </div>
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask a question..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button onClick={send} disabled={loading || !input.trim()} style={{ backgroundColor: config.brandColour }} className="px-6 py-3 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
            Send
          </button>
        </div>
      </main>
    </div>
  );
}
