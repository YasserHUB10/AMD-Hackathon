import { useState } from 'react';
import { Brain, Send, Loader2, Sparkles, RotateCcw } from 'lucide-react';
import { analyzeMessage, isGeminiAvailable, initGemini } from '../gemini.js';

const sampleMessages = [
  { text: 'URGENT: The server is down, we need to fix this ASAP!', sender: 'DevOps Team' },
  { text: 'Hey, want to grab lunch tomorrow around noon?', sender: 'Sarah' },
  { text: '🎉 Flash Sale! 50% off everything today only!', sender: 'Marketing Promo' },
  { text: 'Invoice #4521 payment of $2,500 is overdue by 3 days', sender: 'Accounts' },
  { text: 'Great presentation today! The client loved the demo', sender: 'Boss' },
];

const priorityStyles = {
  high: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-500' },
  medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', dot: 'bg-yellow-500' },
  low: { bg: 'bg-stone-500/10', text: 'text-stone-400', border: 'border-stone-500/20', dot: 'bg-stone-500' },
};

const sentimentEmoji = { positive: '😊', negative: '😟', neutral: '😐', urgent: '🚨' };

export default function InteractiveDemo() {
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (text = message, senderName = sender) => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    setAnalysis(null);
    try {
      initGemini();
      if (!isGeminiAvailable()) throw new Error('Gemini API key not configured');
      const result = await analyzeMessage(text, senderName || 'Unknown');
      if (!result) throw new Error('No analysis returned');
      setAnalysis(result);
    } catch {
      setAnalysis({
        priority: 'medium', category: 'other', sentiment: 'neutral',
        suggestedReplies: ['Thanks for your message!', "I'll look into this.", 'Got it, will respond shortly.'],
        autoReply: null, aiSummary: 'Message received and queued for processing.',
      });
    } finally { setLoading(false); }
  };

  const handleSample = (s) => { setMessage(s.text); setSender(s.sender); setAnalysis(null); handleAnalyze(s.text, s.sender); };
  const handleReset = () => { setMessage(''); setSender(''); setAnalysis(null); setError(''); };
  const pStyle = analysis ? (priorityStyles[analysis.priority] || priorityStyles.medium) : null;

  return (
    <section id="demo" className="relative py-28 bg-stone-950">
      <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-emerald-950/20 to-stone-950" />
      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 text-emerald-300 text-xs font-semibold uppercase tracking-[0.2em] mb-6">
            <Sparkles className="w-3.5 h-3.5" />Live Demo
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-6">See AI in Action</h2>
          <p className="text-lg text-stone-400 max-w-2xl mx-auto">Type any WhatsApp message below and watch Gemini AI analyze it in real-time.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Try a sample message</div>
              <div className="flex flex-wrap gap-2">
                {sampleMessages.map((s) => (
                  <button key={s.text} onClick={() => handleSample(s)} disabled={loading}
                    className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-xs text-stone-300 hover:bg-white/[0.06] hover:border-white/20 transition disabled:opacity-50 text-left">
                    {s.text.slice(0, 40)}…
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2" htmlFor="demo-sender">Sender Name</label>
              <input id="demo-sender" type="text" value={sender} onChange={(e) => setSender(e.target.value)} placeholder="e.g. John"
                className="w-full rounded-xl border border-white/10 bg-stone-900/80 px-4 py-3 text-sm text-white placeholder-stone-600 outline-none focus:border-emerald-500/50 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2" htmlFor="demo-message">WhatsApp Message</label>
              <textarea id="demo-message" rows="4" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type or paste a WhatsApp message here..."
                className="w-full rounded-xl border border-white/10 bg-stone-900/80 px-4 py-3 text-sm text-white placeholder-stone-600 outline-none focus:border-emerald-500/50 transition resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleAnalyze()} disabled={loading || !message.trim()}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold text-sm hover:from-emerald-400 hover:to-green-500 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                {loading ? 'Analyzing…' : 'Analyze with Gemini'}
              </button>
              {analysis && <button onClick={handleReset} className="px-4 py-3 border border-white/10 rounded-xl text-stone-400 hover:bg-white/5 transition"><RotateCcw className="w-4 h-4" /></button>}
            </div>
            {error && <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-300">{error}</div>}
          </div>

          <div className="min-h-[400px]">
            {!analysis && !loading && (
              <div className="h-full flex items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
                <div className="text-center"><Brain className="w-12 h-12 text-stone-700 mx-auto mb-3" /><p className="text-stone-500 text-sm">AI analysis will appear here</p></div>
              </div>
            )}
            {loading && (
              <div className="h-full flex items-center justify-center rounded-3xl border border-emerald-500/10 bg-emerald-500/[0.02]">
                <div className="text-center"><Loader2 className="w-10 h-10 text-emerald-400 mx-auto mb-3 animate-spin" /><p className="text-emerald-300 text-sm font-medium">Gemini is analyzing…</p></div>
              </div>
            )}
            {analysis && !loading && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div className={`rounded-2xl border ${pStyle.border} ${pStyle.bg} p-4`}>
                    <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">Priority</div>
                    <div className="flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full ${pStyle.dot}`} /><span className={`text-lg font-bold capitalize ${pStyle.text}`}>{analysis.priority}</span></div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">Sentiment</div>
                    <div className="text-lg font-bold text-white capitalize">{sentimentEmoji[analysis.sentiment] || '📝'} {analysis.sentiment}</div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">Category</div>
                  <div className="inline-flex px-3 py-1 rounded-full bg-white/5 text-sm font-semibold text-stone-200 capitalize">{analysis.category}</div>
                </div>
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div className="flex items-center gap-1.5 mb-2"><Brain className="w-3.5 h-3.5 text-emerald-400" /><span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">AI Summary</span></div>
                  <p className="text-sm text-stone-200 leading-relaxed">{analysis.aiSummary}</p>
                </div>
                {analysis.suggestedReplies?.length > 0 && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-xs text-stone-500 uppercase tracking-wider mb-3">Suggested Replies</div>
                    <div className="space-y-2">
                      {analysis.suggestedReplies.map((r, i) => (
                        <div key={i} className="px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-stone-300 hover:bg-white/[0.06] hover:border-emerald-500/20 transition cursor-pointer">{r}</div>
                      ))}
                    </div>
                  </div>
                )}
                {analysis.autoReply && (
                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
                    <div className="flex items-center gap-1.5 mb-2"><Send className="w-3.5 h-3.5 text-blue-400" /><span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Auto-Reply Ready</span></div>
                    <p className="text-sm text-stone-200">{analysis.autoReply}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
