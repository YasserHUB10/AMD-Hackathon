import { MessageCircle, Zap, Brain, Play, ArrowDown, Sparkles, Shield } from 'lucide-react';

export default function Hero({ onNavigate }) {
  return (
    <section className="relative min-h-screen overflow-hidden bg-stone-950" id="hero">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-stone-950 to-teal-900/30 animate-gradient-shift" />

      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/8 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-green-400/5 rounded-full blur-3xl animate-pulse-slow" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Astra AI</span>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <a href="#how-it-works" className="text-sm text-stone-400 hover:text-white transition">How It Works</a>
            <a href="#features" className="text-sm text-stone-400 hover:text-white transition">Features</a>
            <a href="#demo" className="text-sm text-stone-400 hover:text-white transition">Demo</a>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl text-sm font-semibold hover:from-emerald-400 hover:to-green-500 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
            >
              Open Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Hero content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-24 lg:pt-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Value Proposition */}
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 text-emerald-300 text-xs font-semibold uppercase tracking-[0.2em] mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              Powered by Google Gemini AI
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              Your WhatsApp,
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
                Supercharged
              </span>
            </h1>

            <p className="text-lg text-stone-400 leading-relaxed mb-10 max-w-lg">
              Astra AI analyzes your WhatsApp messages in real-time,
              prioritizes what matters, and suggests smart replies — saving you{' '}
              <span className="text-emerald-400 font-semibold">2-3 hours daily</span>.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-10">
              {[
                { value: '70%', label: 'Time Saved' },
                { value: '85%', label: 'Faster Replies' },
                { value: '0', label: 'Missed Messages' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                  <div className="text-3xl font-bold text-white mb-1">{value}</div>
                  <div className="text-xs text-stone-500 uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <a
                href="#demo"
                className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl text-base font-bold hover:from-emerald-400 hover:to-green-500 transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center gap-2.5 hover:gap-3.5"
              >
                <Play className="w-5 h-5" />
                Try Live Demo
              </a>
              <a
                href="#how-it-works"
                className="px-8 py-4 border border-white/10 text-white rounded-2xl text-base font-bold hover:bg-white/5 transition-all flex items-center gap-2"
              >
                See How It Works
                <ArrowDown className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right: Phone Mockup */}
          <div className="relative animate-slide-up hidden lg:block">
            {/* Phone frame */}
            <div className="relative mx-auto w-[320px] rounded-[2.5rem] border-[3px] border-stone-700/80 bg-stone-900 p-1.5 shadow-2xl shadow-black/50">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-stone-900 rounded-b-2xl z-10" />

              {/* Screen */}
              <div className="rounded-[2rem] overflow-hidden bg-stone-800">
                {/* WhatsApp Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-3 pt-8 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-white">
                    <div className="text-sm font-bold">Astra AI</div>
                    <div className="text-[10px] opacity-80">analyzing messages…</div>
                  </div>
                </div>

                {/* Messages */}
                <div className="p-3 space-y-2.5 min-h-[380px] bg-[#0a0a0a]">
                  {/* Message 1 - High priority */}
                  <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <div className="flex gap-2 items-end">
                      <div className="w-7 h-7 rounded-full bg-blue-500/80 flex-shrink-0" />
                      <div className="bg-stone-800 rounded-2xl rounded-bl-sm px-3 py-2 max-w-[85%] border border-white/5">
                        <p className="text-xs text-stone-200 leading-relaxed">Can we reschedule tomorrow's meeting to 3 PM?</p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">High Priority</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message 2 - Medium priority */}
                  <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
                    <div className="flex gap-2 items-end">
                      <div className="w-7 h-7 rounded-full bg-purple-500/80 flex-shrink-0" />
                      <div className="bg-stone-800 rounded-2xl rounded-bl-sm px-3 py-2 max-w-[85%] border border-white/5">
                        <p className="text-xs text-stone-200 leading-relaxed">Payment received for invoice #1234</p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="inline-block w-2 h-2 rounded-full bg-yellow-500" />
                          <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">Medium</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Suggestion Card */}
                  <div className="animate-fade-in" style={{ animationDelay: '0.9s' }}>
                    <div className="bg-gradient-to-br from-emerald-900/60 to-teal-900/40 rounded-2xl p-3 border border-emerald-500/20">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Brain className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">AI Suggests</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="bg-stone-900/80 rounded-lg px-2.5 py-1.5 text-[11px] text-stone-300 border border-white/5 hover:border-emerald-500/30 transition cursor-pointer">
                          "Yes, 3 PM works perfectly. See you then!"
                        </div>
                        <div className="bg-stone-900/80 rounded-lg px-2.5 py-1.5 text-[11px] text-stone-300 border border-white/5 hover:border-emerald-500/30 transition cursor-pointer">
                          "Let me check my calendar and confirm."
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message 3 - Low priority */}
                  <div className="animate-fade-in" style={{ animationDelay: '1.2s' }}>
                    <div className="flex gap-2 items-end">
                      <div className="w-7 h-7 rounded-full bg-orange-500/80 flex-shrink-0" />
                      <div className="bg-stone-800 rounded-2xl rounded-bl-sm px-3 py-2 max-w-[85%] border border-white/5">
                        <p className="text-xs text-stone-200 leading-relaxed">Check out our latest deals! 🎉</p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="inline-block w-2 h-2 rounded-full bg-stone-500" />
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Low</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating stats card */}
            <div className="absolute -right-8 top-24 bg-stone-900 rounded-2xl border border-white/10 p-4 w-44 shadow-xl animate-float">
              <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Today's Impact</div>
              <div className="space-y-2.5">
                {[
                  { label: 'Messages', value: '47', color: 'text-emerald-400' },
                  { label: 'Time Saved', value: '2.5h', color: 'text-emerald-400' },
                  { label: 'Auto-Replied', value: '12', color: 'text-emerald-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-[11px] text-stone-500">{label}</span>
                    <span className={`text-sm font-bold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security badge */}
            <div className="absolute -left-4 bottom-32 bg-stone-900 rounded-xl border border-white/10 px-3 py-2 shadow-xl flex items-center gap-2 animate-float-delayed">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] text-stone-300 font-semibold">End-to-End Encrypted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ArrowDown className="w-5 h-5 text-stone-600" />
      </div>
    </section>
  );
}
