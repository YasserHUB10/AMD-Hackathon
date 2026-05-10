import { MessageCircle, Github, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-stone-950 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Astra AI</span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed max-w-xs">
              AI-powered WhatsApp assistant that analyzes, prioritizes, and responds to your messages intelligently.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="#how-it-works" className="text-sm text-stone-400 hover:text-emerald-400 transition">How It Works</a></li>
              <li><a href="#features" className="text-sm text-stone-400 hover:text-emerald-400 transition">Features</a></li>
              <li><a href="#demo" className="text-sm text-stone-400 hover:text-emerald-400 transition">Live Demo</a></li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Built With</h3>
            <div className="flex flex-wrap gap-2">
              {['Google Gemini', 'React', 'Vite', 'Node.js', 'Meta Cloud API', 'Tailwind CSS'].map((tech) => (
                <span key={tech} className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-xs text-stone-400">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/YasserHUB10/AMD-Hackathon"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-white transition"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <a
              href="https://ai.google.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-white transition"
            >
              <ExternalLink className="w-4 h-4" />
              Google AI Studio
            </a>
          </div>
          <p className="text-xs text-stone-600">
            © {new Date().getFullYear()} Astra AI — Powered by Google Gemini
          </p>
        </div>
      </div>
    </footer>
  );
}
