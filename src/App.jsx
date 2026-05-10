import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Brain,
  CheckCircle2,
  Loader2,
  MessageCircle,
  RefreshCw,
  Send,
  ShieldCheck,
  Webhook,
} from 'lucide-react';
import './App.css';

import Hero from './components/Hero.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import Features from './components/Features.jsx';
import InteractiveDemo from './components/InteractiveDemo.jsx';
import Footer from './components/Footer.jsx';

/* ───── helpers ───── */

function formatTimestamp(value) {
  try { return new Date(value).toLocaleString(); } catch { return value; }
}

const priorityColors = {
  high:   { dot: 'bg-red-500',    badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
  medium: { dot: 'bg-yellow-500', badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  low:    { dot: 'bg-stone-500',  badge: 'bg-stone-500/10 text-stone-400 border-stone-500/20' },
};
const sentimentEmoji = { positive: '😊', negative: '😟', neutral: '😐', urgent: '🚨' };

const emptyCompose = { to: '', message: '' };

/* ───── Dashboard (existing, enhanced) ───── */

function Dashboard({ onBack }) {
  const [status, setStatus]     = useState(null);
  const [messages, setMessages] = useState([]);
  const [compose, setCompose]   = useState(emptyCompose);
  const [loading, setLoading]   = useState(true);
  const [sending, setSending]   = useState(false);
  const [error, setError]       = useState('');
  const [notice, setNotice]     = useState('');

  async function loadDashboard() {
    setError('');
    try {
      const [sRes, mRes] = await Promise.all([
        fetch('/api/status'),
        fetch('/api/messages'),
      ]);
      if (!sRes.ok || !mRes.ok) throw new Error('Failed to load dashboard data.');
      setStatus(await sRes.json());
      setMessages((await mRes.json()).messages || []);
    } catch (err) {
      setError(err.message || 'Unable to reach the local WhatsApp server.');
    } finally { setLoading(false); }
  }

  useEffect(() => {
    loadDashboard();
    const t = setInterval(loadDashboard, 7000);
    return () => clearInterval(t);
  }, []);

  async function handleSend(e) {
    e.preventDefault();
    setSending(true); setError(''); setNotice('');
    try {
      const res = await fetch('/api/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(compose),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to send message.');
      setCompose(emptyCompose);
      setNotice('Message sent through Meta Cloud API.');
      await loadDashboard();
    } catch (err) { setError(err.message || 'Failed to send message.'); }
    finally { setSending(false); }
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 animate-view-fade">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <header className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.3),_transparent_35%),linear-gradient(135deg,_rgba(12,10,9,0.96),_rgba(24,24,27,0.92))] p-8 shadow-2xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-green-200">
                <ShieldCheck className="h-4 w-4" />Official Meta Setup
              </div>
              <h1 className="font-serif text-4xl leading-tight text-white sm:text-5xl">
                Astra AI Dashboard
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-300 sm:text-base">
                Live WhatsApp inbox with AI-powered message analysis. Incoming webhook events are analyzed by Gemini in real-time.
              </p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onBack}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                <ArrowLeft className="h-4 w-4" />Home
              </button>
              <button type="button" onClick={loadDashboard}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                <RefreshCw className="h-4 w-4" />Refresh
              </button>
            </div>
          </div>
        </header>

        {/* Alerts */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-red-100">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" /><p>{error}</p>
          </div>
        )}
        {notice && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-400/30 bg-green-500/10 p-4 text-green-100">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" /><p>{notice}</p>
          </div>
        )}

        {/* Stats cards */}
        <section className="mb-6 grid gap-4 lg:grid-cols-4">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="mb-3 flex items-center gap-2 text-stone-300"><Webhook className="h-5 w-5 text-green-300" />Webhook</div>
            <div className="text-2xl font-bold text-white">{status?.webhookPath || '/api/whatsapp/webhook'}</div>
            <p className="mt-2 text-sm text-stone-400">Use this path behind your public HTTPS tunnel.</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="mb-3 flex items-center gap-2 text-stone-300"><ShieldCheck className="h-5 w-5 text-green-300" />Config</div>
            <div className="text-2xl font-bold text-white">{status?.configured ? 'Ready' : 'Missing env'}</div>
            <p className="mt-2 text-sm text-stone-400">Verify token, access token, and phone number ID.</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="mb-3 flex items-center gap-2 text-stone-300"><MessageCircle className="h-5 w-5 text-green-300" />Messages</div>
            <div className="text-2xl font-bold text-white">{messages.length}</div>
            <p className="mt-2 text-sm text-stone-400">Stored locally from webhook events and sends.</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="mb-3 flex items-center gap-2 text-stone-300"><Brain className="h-5 w-5 text-green-300" />Gemini AI</div>
            <div className="text-2xl font-bold text-white">{status?.geminiConfigured ? 'Active' : 'Off'}</div>
            <p className="mt-2 text-sm text-stone-400">Automatic message analysis with Gemini 2.0 Flash.</p>
          </article>
        </section>

        {/* Main content */}
        <section className="mb-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Message Feed */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">Live Message Feed</h2>
                <p className="mt-1 text-sm text-stone-400">Incoming webhook traffic and outbound sends appear here.</p>
              </div>
              {loading && <Loader2 className="h-5 w-5 animate-spin text-green-300" />}
            </div>

            <div className="space-y-4">
              {messages.map((msg) => {
                const a = msg.analysis;
                const pc = a ? (priorityColors[a.priority] || priorityColors.medium) : null;
                return (
                  <article key={msg.id} className="rounded-2xl border border-white/10 bg-stone-900/80 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-green-400/15 px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-green-200">{msg.direction}</span>
                          <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-stone-300">{msg.type}</span>
                          {a && (
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-semibold capitalize ${pc.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />{a.priority}
                            </span>
                          )}
                          {a?.sentiment && (
                            <span className="text-xs">{sentimentEmoji[a.sentiment] || '📝'} {a.sentiment}</span>
                          )}
                        </div>
                        <h3 className="mt-3 text-lg font-semibold text-white">{msg.sender}</h3>
                        <p className="text-sm text-stone-400">{msg.waId || msg.chatName}</p>
                      </div>
                      <div className="text-sm text-stone-400">{formatTimestamp(msg.timestamp)}</div>
                    </div>

                    <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-stone-200">{msg.content}</p>

                    {/* AI Analysis */}
                    {a && (
                      <div className="mt-4 space-y-3 border-t border-white/5 pt-4">
                        {a.aiSummary && (
                          <div className="flex items-start gap-2">
                            <Brain className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-stone-300">{a.aiSummary}</p>
                          </div>
                        )}
                        {a.suggestedReplies?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {a.suggestedReplies.map((r, i) => (
                              <span key={i} className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-xs text-stone-300 hover:bg-white/[0.06] hover:border-emerald-500/20 transition cursor-pointer">
                                {r}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}

              {!loading && messages.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/15 bg-stone-900/60 p-8 text-center text-stone-400">
                  No webhook messages yet. Once Meta sends an event to your endpoint, it will appear here.
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Send form */}
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-2xl font-semibold text-white">Send Test Reply</h2>
              <p className="mt-2 text-sm leading-7 text-stone-400">
                Send a text message through the official Cloud API. Use an E.164 WhatsApp number like
                <span className="mx-1 rounded bg-white/5 px-2 py-1 text-stone-200">919876543210</span>
                without a plus sign.
              </p>
              <form className="mt-6 space-y-4" onSubmit={handleSend}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-300" htmlFor="to">Recipient number</label>
                  <input id="to" type="text" value={compose.to}
                    onChange={(e) => setCompose((c) => ({ ...c, to: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-stone-950/80 px-4 py-3 text-white outline-none transition focus:border-green-400/50"
                    placeholder="919876543210" required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-300" htmlFor="message">Message body</label>
                  <textarea id="message" rows="5" value={compose.message}
                    onChange={(e) => setCompose((c) => ({ ...c, message: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-stone-950/80 px-4 py-3 text-white outline-none transition focus:border-green-400/50"
                    placeholder="Hello from the official Meta WhatsApp integration." required />
                </div>
                <button type="submit" disabled={sending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-green-500 px-5 py-3 font-semibold text-stone-950 transition hover:bg-green-400 disabled:cursor-not-allowed disabled:bg-green-500/60">
                  {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  {sending ? 'Sending...' : 'Send with Meta'}
                </button>
              </form>
            </section>

            {/* Setup checklist */}
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-2xl font-semibold text-white">Meta Setup Checklist</h2>
              <ol className="mt-4 space-y-3 text-sm leading-7 text-stone-300">
                <li>1. Copy <code className="rounded bg-white/5 px-2 py-1">.env.example</code> to <code className="rounded bg-white/5 px-2 py-1">.env</code>.</li>
                <li>2. Add your Meta verify token, access token, phone number ID, and WABA ID.</li>
                <li>3. Run the Node server and expose it with an HTTPS tunnel like ngrok.</li>
                <li>4. In Meta App Dashboard, set the callback URL to your public tunnel plus <code className="rounded bg-white/5 px-2 py-1">/api/whatsapp/webhook</code>.</li>
                <li>5. Subscribe to message webhook events, then send a test message to your business number.</li>
              </ol>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ───── Landing Page ───── */

function LandingPage({ onNavigate }) {
  return (
    <div className="animate-view-fade">
      <Hero onNavigate={onNavigate} />
      <HowItWorks />
      <Features />
      <InteractiveDemo />
      <Footer />
    </div>
  );
}

/* ───── Root App ───── */

export default function App() {
  const [view, setView] = useState('landing');

  // scroll to top on view change
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [view]);

  if (view === 'dashboard') {
    return <Dashboard onBack={() => setView('landing')} />;
  }

  return <LandingPage onNavigate={setView} />;
}
