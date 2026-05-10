import { MessageCircle, Brain, Zap, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: MessageCircle,
    color: 'emerald',
    title: 'Connect WhatsApp',
    description:
      'Link your WhatsApp Business account through the official Meta Cloud API. Secure webhook verification ensures only your messages are processed.',
    detail: 'Enterprise-grade security',
  },
  {
    icon: Brain,
    color: 'purple',
    title: 'AI Analyzes',
    description:
      'Google Gemini AI reads every incoming message, detects urgency levels, categorizes content, and performs real-time sentiment analysis.',
    detail: 'Powered by Gemini 2.0 Flash',
  },
  {
    icon: Zap,
    color: 'amber',
    title: 'Smart Actions',
    description:
      'Get AI-suggested replies, automatic responses for routine messages, priority-sorted inbox, and daily conversation summaries.',
    detail: 'Save 2-3 hours daily',
  },
];

const colorMap = {
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: 'text-emerald-400',
    glow: 'shadow-emerald-500/10',
    number: 'text-emerald-500/20',
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    icon: 'text-purple-400',
    glow: 'shadow-purple-500/10',
    number: 'text-purple-500/20',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: 'text-amber-400',
    glow: 'shadow-amber-500/10',
    number: 'text-amber-500/20',
  },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-28 bg-stone-950">
      {/* Subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-stone-900/50 to-stone-950" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] text-stone-400 text-xs font-semibold uppercase tracking-[0.2em] mb-6">
            Simple Setup
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-6">
            How Astra AI Works
          </h2>
          <p className="text-lg text-stone-400 max-w-2xl mx-auto">
            Three simple steps to transform your WhatsApp into an AI-powered communication hub.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const colors = colorMap[step.color];
            const Icon = step.icon;

            return (
              <div key={step.title} className="relative group">
                {/* Connector arrow (between cards) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20">
                    <ArrowRight className="w-8 h-8 text-stone-700" />
                  </div>
                )}

                <div
                  className={`relative h-full rounded-3xl border ${colors.border} bg-white/[0.02] p-8 transition-all duration-500 hover:bg-white/[0.04] hover:border-white/10 hover:shadow-2xl ${colors.glow} group-hover:-translate-y-1`}
                >
                  {/* Step number */}
                  <div className={`absolute top-6 right-6 text-6xl font-black ${colors.number}`}>
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl ${colors.bg} flex items-center justify-center mb-6`}>
                    <Icon className={`w-8 h-8 ${colors.icon}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-stone-400 text-sm leading-relaxed mb-4">{step.description}</p>

                  {/* Detail badge */}
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${colors.bg} ${colors.icon} text-xs font-semibold`}>
                    {step.detail}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
