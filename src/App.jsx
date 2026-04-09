import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Zap, Calendar, Plus, Sparkles, Github, Linkedin } from 'lucide-react';
import { analyzeMessage, generateInboxSummary, initGemini, isGeminiAvailable } from './gemini';

import { ThemeProvider, ThemeToggle } from './components/ThemeToggle';
import { ToastContainer, toast } from './components/Toast';
import StatsBar from './components/StatsBar';
import FilterBar from './components/FilterBar';
import { AILoadingBanner, AISummaryBanner } from './components/AISummaryBanner';
import MessageCard from './components/MessageCard';
import SkeletonCard from './components/SkeletonCard';
import ScheduleModal from './components/ScheduleModal';
import ScheduledList from './components/ScheduledList';

// ─── Constants (outside component to avoid re-creation) ─────────────
const RAW_MESSAGES = [
  {
    id: 1,
    sender: 'Ahmed',
    phone: '+91 8885536667',
    content: "Hi! Can we reschedule tomorrow's meeting to 3 PM? Something urgent came up.",
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: 2,
    sender: 'Friends Group',
    phone: '+91 8462135789',
    content: 'Do not forget to take your Laptop Bag! Everyone arrive early for good impression.',
    timestamp: new Date(Date.now() - 600000),
  },
  {
    id: 3,
    sender: 'LinkedIn Updates',
    phone: '+1234567892',
    content: 'You have 5 new job recommendations based on your profile. Check them out now!',
    timestamp: new Date(Date.now() - 900000),
  },
  {
    id: 4,
    sender: 'Alex Chen - Client',
    phone: '+040 9834567893',
    content: 'The payment for invoice #1067 has been processed. You should see it in 2-3 business days. Thanks for your excellent work!',
    timestamp: new Date(Date.now() - 1200000),
  },
];

const FALLBACK_AI = {
  1: {
    priority: 'high', category: 'work', sentiment: 'neutral',
    suggestedReplies: [
      'Yes, 3 PM works perfectly. See you then!',
      'Let me check my calendar and get back to you.',
      "Unfortunately I have a conflict at 3 PM. How about 4 PM?",
    ],
    autoReply: 'Thanks for letting me know! 3 PM works for me. See you then!',
    aiSummary: 'Meeting reschedule request for tomorrow at 3 PM',
  },
  2: {
    priority: 'high', category: 'family', sentiment: 'positive',
    suggestedReplies: [
      'Thanks for reminding me!',
      'Will do! Love you bro ❤️',
      'Packing it right now!',
    ],
    autoReply: "Thanks Friend! I'll take my laptop bag. Love you too! ❤️",
    aiSummary: 'Reminder to take laptop bag for meeting',
  },
  3: {
    priority: 'low', category: 'marketing', sentiment: 'neutral',
    suggestedReplies: [],
    autoReply: null,
    aiSummary: 'LinkedIn notification about job recommendations',
  },
  4: {
    priority: 'medium', category: 'work', sentiment: 'positive',
    suggestedReplies: [
      'Thank you! Pleasure working with you.',
      'Great! Looking forward to our next project.',
      'Received, thanks for the update!',
    ],
    autoReply: 'Thank you! Payment confirmation received. Pleasure working with you!',
    aiSummary: 'Payment confirmation for invoice #1067',
  },
};

const SAMPLE_SCHEDULED = [
  {
    id: 1,
    recipient: 'Team Group',
    phone: '+91 9988557456',
    message: "Good morning team! Don't forget our Hackathon at 11 AM today.",
    scheduledDate: new Date(Date.now() + 86400000),
    repeat: 'daily',
    status: 'pending',
  },
  {
    id: 2,
    recipient: 'Mom',
    phone: '+91 9638527410',
    message: 'Happy Birthday Mom! Hope you have an amazing day! 🎉🎂',
    scheduledDate: new Date(Date.now() + 172800000),
    repeat: 'yearly',
    status: 'pending',
  },
];

// ─── Main Dashboard Component ───────────────────────────────────────
function AstraAIDashboard() {
  const [messages, setMessages] = useState([]);
  const [scheduledMessages, setScheduledMessages] = useState(SAMPLE_SCHEDULED);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('inbox');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedulePrefill, setSchedulePrefill] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [overallSummary, setOverallSummary] = useState('');

  // ─── Gemini AI analysis ──────────────────────────────────────────
  const processMessagesWithAI = useCallback(async () => {
    setAiLoading(true);

    if (!isGeminiAvailable()) {
      const enriched = RAW_MESSAGES.map((msg) => ({ ...msg, ...FALLBACK_AI[msg.id] }));
      setMessages(enriched);
      setOverallSummary(
        `Astra AI detected ${enriched.length} unread messages: ${enriched.filter((m) => m.priority === 'high').length} high priority, ${enriched.filter((m) => m.priority === 'medium').length} medium, and ${enriched.filter((m) => m.priority === 'low').length} low. Key items: meeting reschedule from Ahmed, laptop bag reminder, and payment confirmation from client.`
      );
      setAiLoading(false);
      return;
    }

    try {
      const enrichedPromises = RAW_MESSAGES.map(async (msg) => {
        const aiResult = await analyzeMessage(msg.content, msg.sender);
        if (aiResult) {
          return {
            ...msg,
            priority: aiResult.priority || 'medium',
            category: aiResult.category || 'other',
            sentiment: aiResult.sentiment || 'neutral',
            suggestedReplies: aiResult.suggestedReplies || [],
            autoReply: aiResult.autoReply || null,
            aiSummary: aiResult.aiSummary || 'No summary available',
          };
        }
        return { ...msg, ...FALLBACK_AI[msg.id] };
      });

      const enriched = await Promise.all(enrichedPromises);
      setMessages(enriched);

      const summary = await generateInboxSummary(enriched);
      setOverallSummary(summary || `Astra AI analyzed ${enriched.length} messages with Google Gemini.`);
    } catch (err) {
      console.error('Gemini processing error:', err);
      const enriched = RAW_MESSAGES.map((msg) => ({ ...msg, ...FALLBACK_AI[msg.id] }));
      setMessages(enriched);
      setOverallSummary('AI analysis temporarily unavailable. Showing cached insights.');
    }

    setAiLoading(false);
  }, []);

  useEffect(() => {
    initGemini();
    processMessagesWithAI();
  }, [processMessagesWithAI]);

  // ─── Filtering ───────────────────────────────────────────────────
  const filteredMessages = messages.filter((msg) => {
    const matchesFilter = filter === 'all' || msg.priority === filter;
    const matchesSearch =
      !searchQuery ||
      msg.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // ─── Handlers ────────────────────────────────────────────────────
  const handleScheduleReply = (recipient, message) => {
    setSchedulePrefill({ recipient, message });
    setShowScheduleModal(true);
  };

  const handleAddScheduled = (newMsg) => {
    setScheduledMessages((prev) => [...prev, { ...newMsg, id: Date.now() }]);
  };

  const handleDeleteScheduled = (id) => {
    setScheduledMessages((prev) => prev.filter((m) => m.id !== id));
    toast.info('Scheduled message deleted');
  };

  const handleEditScheduled = (msg) => {
    setSchedulePrefill({ recipient: msg.recipient, message: msg.message });
    setShowScheduleModal(true);
  };

  const handleDismissMessage = (id) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    toast.info('Message dismissed');
  };

  const stats = {
    total: messages.length,
    high: messages.filter((m) => m.priority === 'high').length,
    medium: messages.filter((m) => m.priority === 'medium').length,
    low: messages.filter((m) => m.priority === 'low').length,
    scheduled: scheduledMessages.length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-950 transition-colors duration-300">
      {/* Skip navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-green-600 focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto p-4 sm:p-6" id="main-content">
        {/* ─── Header ────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 border border-gray-100 dark:border-gray-700 transition-colors duration-200">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-violet-600 dark:text-violet-400" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Astra AI</h1>
              {isGeminiAvailable() && (
                <span className="hidden sm:inline px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">
                  Powered by Gemini
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoReplyEnabled}
                  onChange={(e) => setAutoReplyEnabled(e.target.checked)}
                  className="w-5 h-5 rounded accent-green-600"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">Auto-Reply</span>
              </label>
              <Zap className={`w-5 h-5 transition-colors ${autoReplyEnabled ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-600'}`} />
            </div>
          </div>
          <StatsBar stats={stats} />
        </div>

        {/* ─── Tab Navigation ────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6 transition-colors duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('inbox')}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm ${
                  activeTab === 'inbox'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                Inbox
              </button>
              <button
                onClick={() => setActiveTab('scheduled')}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm ${
                  activeTab === 'scheduled'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Scheduled ({stats.scheduled})
              </button>
            </div>
            <button
              onClick={() => {
                setSchedulePrefill(null);
                setShowScheduleModal(true);
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2 font-medium text-sm shadow-sm hover:shadow"
            >
              <Plus className="w-4 h-4" />
              Schedule Message
            </button>
          </div>
        </div>

        {/* ─── Inbox Tab ─────────────────────────────────────────── */}
        {activeTab === 'inbox' && (
          <>
            {aiLoading && <AILoadingBanner />}
            {!aiLoading && overallSummary && <AISummaryBanner summary={overallSummary} />}

            <FilterBar filter={filter} setFilter={setFilter} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

            {/* Skeleton loading */}
            {aiLoading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {/* Messages */}
            {!aiLoading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredMessages.map((msg) => (
                  <MessageCard
                    key={msg.id}
                    msg={msg}
                    autoReplyEnabled={autoReplyEnabled}
                    onScheduleReply={handleScheduleReply}
                    onDismiss={handleDismissMessage}
                  />
                ))}
                {filteredMessages.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No messages match your filters</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ─── Scheduled Tab ─────────────────────────────────────── */}
        {activeTab === 'scheduled' && (
          <ScheduledList
            scheduledMessages={scheduledMessages}
            onDelete={handleDeleteScheduled}
            onEdit={handleEditScheduled}
          />
        )}

        {/* ─── Schedule Modal ────────────────────────────────────── */}
        <ScheduleModal
          show={showScheduleModal}
          onClose={() => {
            setShowScheduleModal(false);
            setSchedulePrefill(null);
          }}
          onSchedule={handleAddScheduled}
          prefill={schedulePrefill}
        />

        {/* ─── Footer ────────────────────────────────────────────── */}
        <footer className="mt-12 pb-6 text-center border-t border-gray-200 dark:border-gray-700 pt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Built by <span className="font-semibold text-gray-700 dark:text-gray-300">Yasser</span> — AMD Hackathon 2026
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Powered by Google Gemini AI · React + Vite + Tailwind CSS
          </p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <a
              href="https://github.com/YasserHUB10"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition"
              aria-label="GitHub profile"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://linkedin.com/in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
              aria-label="LinkedIn profile"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </footer>
      </div>

      <ToastContainer />
    </div>
  );
}

// ─── Root export with ThemeProvider ──────────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <AstraAIDashboard />
    </ThemeProvider>
  );
}
