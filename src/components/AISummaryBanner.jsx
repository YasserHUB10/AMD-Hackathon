import React, { useState } from 'react';
import { Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { isGeminiAvailable } from '../gemini';

export function AILoadingBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 mb-6 text-white animate-pulse">
      <div className="flex items-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin" />
        <div>
          <h2 className="text-lg font-bold">Gemini AI is analyzing your messages…</h2>
          <p className="text-white/80 text-sm">Summarizing, classifying priority, generating smart replies</p>
        </div>
      </div>
    </div>
  );
}

export function AISummaryBanner({ summary }) {
  const [expanded, setExpanded] = useState(false);

  if (!summary) return null;

  const isLong = summary.length > 100;
  const displayText = isLong && !expanded ? summary.slice(0, 100) + '…' : summary;

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl shadow-lg p-6 mb-6 text-white transition-all duration-300">
      <div className="flex items-start gap-3">
        <Sparkles className="w-6 h-6 mt-0.5 shrink-0" />
        <div className="flex-1">
          <h2 className="text-lg font-bold mb-1">
            AI Summary
            {isGeminiAvailable() && (
              <span className="ml-2 text-sm font-normal opacity-80">— by Google Gemini</span>
            )}
          </h2>
          <p className="text-white/90 text-sm leading-relaxed">{displayText}</p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 mt-2 text-white/70 hover:text-white text-xs font-medium transition"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
