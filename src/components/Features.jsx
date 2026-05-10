import {
  BarChart3,
  MessageSquareText,
  Reply,
  Globe2,
  FileText,
  ShieldCheck,
} from 'lucide-react';

const features = [
  {
    icon: BarChart3,
    title: 'Priority Classification',
    description:
      'Every message is automatically tagged as high, medium, or low priority so you focus on what matters most.',
    gradient: 'from-red-500/20 to-orange-500/20',
    iconColor: 'text-red-400',
  },
  {
    icon: Reply,
    title: 'Smart Replies',
    description:
      'Gemini AI generates 3 contextual reply suggestions for each message, matching tone and intent perfectly.',
    gradient: 'from-emerald-500/20 to-green-500/20',
    iconColor: 'text-emerald-400',
  },
  {
    icon: MessageSquareText,
    title: 'Auto-Response',
    description:
      'Routine messages get instant AI-powered replies. Acknowledgments, confirmations, and simple queries handled automatically.',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-400',
  },
  {
    icon: BarChart3,
    title: 'Sentiment Analysis',
    description:
      'Understand the emotional tone of every conversation — positive, negative, neutral, or urgent — at a glance.',
    gradient: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-400',
  },
  {
    icon: FileText,
    title: 'Inbox Summary',
    description:
      'Get a concise AI-generated overview of your entire inbox highlighting urgent items and key action points.',
    gradient: 'from-amber-500/20 to-yellow-500/20',
    iconColor: 'text-amber-400',
  },
  {
    icon: Globe2,
    title: 'Multi-Language',
    description:
      'Gemini supports 40+ languages natively. Analyze and respond to messages regardless of the language used.',
    gradient: 'from-teal-500/20 to-emerald-500/20',
    iconColor: 'text-teal-400',
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-28 bg-stone-950">
      <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-stone-900/30 to-stone-950" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] text-stone-400 text-xs font-semibold uppercase tracking-[0.2em] mb-6">
            Capabilities
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-6">
            Everything You Need
          </h2>
          <p className="text-lg text-stone-400 max-w-2xl mx-auto">
            A complete AI toolkit for managing WhatsApp conversations at scale.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative rounded-3xl border border-white/5 bg-white/[0.02] p-7 transition-all duration-500 hover:border-white/10 hover:bg-white/[0.04] hover:-translate-y-1 hover:shadow-2xl"
              >
                {/* Gradient glow on hover */}
                <div
                  className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl`}
                />

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-stone-400 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Bottom badge */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-emerald-500/20 bg-emerald-500/5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-sm text-stone-300">
              All features powered by <span className="text-emerald-400 font-semibold">Google Gemini 2.0 Flash</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
