import React, { useState } from 'react';
import { Clock, Send, Sparkles, TrendingUp, CheckCircle, Trash2 } from 'lucide-react';
import { isGeminiAvailable } from '../gemini';
import { toast, confirmDialog } from './Toast';

const priorityStyles = {
  high: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
  low: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600',
};

const categoryIcons = {
  work: '💼',
  family: '👨‍👩‍👧‍👦',
  marketing: '📢',
  other: '💬',
};

export default function MessageCard({ msg, autoReplyEnabled, onScheduleReply, onDismiss }) {
  const [dismissed, setDismissed] = useState(false);

  const handleQuickReply = async (reply) => {
    const schedule = await confirmDialog(`Schedule this reply to ${msg.sender}?\n\n"${reply}"\n\nYes = schedule, No = send now`);
    if (schedule) {
      onScheduleReply(msg.sender, reply);
    } else {
      toast.success(`Reply sent to ${msg.sender}: "${reply}"`);
    }
  };

  const handleAutoReply = () => {
    if (msg.autoReply) {
      toast.success(`Auto-reply sent to ${msg.sender}`);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setTimeout(() => onDismiss?.(msg.id), 300);
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700
        transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5
        ${dismissed ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-label={msg.category}>
              {categoryIcons[msg.category] || '💬'}
            </span>
            <h3 className="font-bold text-lg">{msg.sender}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${priorityStyles[msg.priority]}`}>
              {msg.priority?.toUpperCase()}
            </span>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg hover:bg-white/20 transition"
              aria-label={`Dismiss message from ${msg.sender}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-green-100 text-sm">
          <Clock className="w-4 h-4" />
          <span>{msg.timestamp?.toLocaleTimeString()}</span>
          {msg.sentiment && (
            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded text-xs">
              {msg.sentiment === 'positive' ? '😊' : msg.sentiment === 'negative' ? '😟' : '😐'} {msg.sentiment}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{msg.content}</p>

        {/* AI Insight */}
        <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-bold text-purple-700 dark:text-purple-300 mb-1">
                AI INSIGHT {isGeminiAvailable() && <span className="font-normal text-purple-500 dark:text-purple-400">· Gemini</span>}
              </div>
              <div className="text-sm text-purple-900 dark:text-purple-200">{msg.aiSummary}</div>
            </div>
          </div>
        </div>

        {/* Suggested Replies */}
        {msg.suggestedReplies?.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Quick Replies
              {isGeminiAvailable() && <span className="font-normal text-gray-400 dark:text-gray-500 text-xs">AI-generated</span>}
            </div>
            {msg.suggestedReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickReply(reply)}
                className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-green-50 dark:hover:bg-green-900/20
                  border border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-700
                  rounded-lg text-sm transition-all duration-200 group"
                aria-label={`Send quick reply: ${reply}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-green-700 dark:group-hover:text-green-400">{reply}</span>
                  <Send className="w-4 h-4 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 shrink-0 ml-2" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Auto Reply */}
        {msg.autoReply && autoReplyEnabled && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-xs font-bold text-green-800 dark:text-green-300 mb-1">AUTO-REPLY</div>
                <div className="text-sm text-green-900 dark:text-green-200">{msg.autoReply}</div>
              </div>
              <button
                onClick={handleAutoReply}
                className="ml-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-sm shrink-0"
                aria-label="Send auto-reply"
              >
                <CheckCircle className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
