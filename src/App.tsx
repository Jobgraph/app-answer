import { useState, useEffect } from 'react';
import { type AppConfig, loadConfig } from './config';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CANNED_ANSWERS: Record<string, string> = {
  'default': "I don't have specific information about that in the knowledge base yet. Once connected to your data sources, I'll be able to provide accurate answers based on your documentation.",
  'refund': "Our refund policy allows full refunds within 30 days of purchase. After 30 days, we offer pro-rated refunds for annual subscriptions. To request a refund, contact support@example.com with your order number.",
  'hours': "Our support team is available Monday to Friday, 9:00 AM to 6:00 PM GMT. For urgent issues outside these hours, use the emergency contact form on our website.",
  'pricing': "We offer three tiers: Starter (£29/month, up to 5 users), Professional (£79/month, up to 25 users), and Enterprise (custom pricing, unlimited users). All plans include a 14-day free trial.",
  'integration': "We integrate with Slack, Microsoft Teams, Salesforce, HubSpot, and Jira out of the box. Custom integrations are available via our REST API and webhooks. See docs.example.com/integrations for setup guides.",
};

function getAnswer(question: string): string {
  const q = question.toLowerCase();
  if (q.includes('refund') || q.includes('money back')) return CANNED_ANSWERS['refund'];
  if (q.includes('hours') || q.includes('available') || q.includes('support')) return CANNED_ANSWERS['hours'];
  if (q.includes('price') || q.includes('pricing') || q.includes('cost') || q.includes('plan')) return CANNED_ANSWERS['pricing'];
  if (q.includes('integrat') || q.includes('connect') || q.includes('slack') || q.includes('api')) return CANNED_ANSWERS['integration'];
  return CANNED_ANSWERS['default'];
}

export default function App() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadConfig().then(setConfig); }, []);
  if (!config) return null;

  async function send() {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const question = input;
    setInput('');
    setLoading(true);
    try {
      if (config!.deploymentId === 'local') {
        await new Promise((r) => setTimeout(r, 1000));
        setMessages(prev => [...prev, { role: 'assistant', content: getAnswer(question) }]);
      } else {
        const res = await fetch(
          `https://app.jobgraph.com/api/apps/${config!.deploymentId}/process`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input: question, type: 'answer', history: messages }) }
        );
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
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
        </div>
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
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
