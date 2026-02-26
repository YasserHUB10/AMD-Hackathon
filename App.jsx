import React, { useState, useEffect } from 'react';
import { MessageCircle, Zap, Clock, CheckCircle, Send, Sparkles, Filter, TrendingUp, Calendar, Plus, X, Edit } from 'lucide-react';

const WhatsAppAIDashboard = () => {
  const [messages, setMessages] = useState([]);
  const [scheduledMessages, setScheduledMessages] = useState([]);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('inbox');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    recipient: '',
    message: '',
    date: '',
    time: '',
    repeat: 'none'
  });

  // Simulated messages with AI analysis
  const sampleMessages = [
    {
      id: 1,
      sender: " Ahmed   ",
      phone: "+91 8885536667",
      content: "Hi! Can we reschedule tomorrow's meeting to 3 PM? Something urgent came up.",
      timestamp: new Date(Date.now() - 300000),
      priority: "high",
      category: "work",
      sentiment: "neutral",
      suggestedReplies: [
        "Yes, 3 PM works perfectly. See you then!",
        "Let me check my calendar and get back to you.",
        "Unfortunately I have a conflict at 3 PM. How about 4 PM?"
      ],
      autoReply: "Thanks for letting me know! 3 PM works for me. See you then!",
      aiSummary: "Meeting reschedule request for tomorrow at 3 PM"
    },
    {
      id: 2,
      sender: "Friends Group",
      phone: "+91 8462135789",
      content: "Do not forget to take your Laptop Bag!, Everyone arrive early for Good impression.",
      timestamp: new Date(Date.now() - 600000),
      priority: "high",
      category: "family",
      sentiment: "positive",
      suggestedReplies: [
        "Thanks for reminding me!.",
        "Will do! Love you bro ❤️",
        "Keeping it right now!"
      ],
      autoReply: "Thanks Friend! I'll take my laptop bag. Love you too! ❤️",
      aiSummary: "Reminder to take laptop bag for meeting"
    },
    {
      id: 3,
      sender: "LinkedIn Updates",
      phone: "+1234567892",
      content: "You have 5 new job recommendations based on your profile. Check them out now!",
      timestamp: new Date(Date.now() - 900000),
      priority: "low",
      category: "marketing",
      sentiment: "neutral",
      suggestedReplies: [],
      autoReply: null,
      aiSummary: "LinkedIn notification about job recommendations"
    },
    {
      id: 4,
      sender: "Alex Chen - Client",
      phone: "+040 9834567893",
      content: "The payment for invoice #1067 has been processed. You should see it in 2-3 business days. Thanks for your excellent work!",
      timestamp: new Date(Date.now() - 1200000),
      priority: "medium",
      category: "work",
      sentiment: "positive",
      suggestedReplies: [
        "Thank you! Pleasure working with you.",
        "Great! Looking forward to our next project.",
        "Received, thanks for the update!"
      ],
      autoReply: "Thank you! Payment confirmation received. Pleasure working with you!",
      aiSummary: "Payment confirmation for invoice #1067"
    }
  ];

  const sampleScheduled = [
    {
      id: 1,
      recipient: "Team Group",
      phone: "+ 91 9988557456",
      message: "Good morning team! Don't forget our Hackathon at 11 AM today.",
      scheduledDate: new Date(Date.now() + 86400000),
      repeat: "daily",
      status: "pending"
    },
    {
      id: 2,
      recipient: "Mom",
      phone: "+91 9638527410",
      message: "Happy Birthday Mom! Hope you have an amazing day! 🎉🎂",
      scheduledDate: new Date(Date.now() + 172800000),
      repeat: "yearly",
      status: "pending"
    }
  ];

  useEffect(() => {
    setMessages(sampleMessages);
    setScheduledMessages(sampleScheduled);
  }, []);

  const filteredMessages = messages.filter(msg => {
    if (filter === 'all') return true;
    return msg.priority === filter;
  });

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'work': return '💼';
      case 'family': return '👨‍👩‍👧‍👦';
      case 'marketing': return '📢';
      default: return '💬';
    }
  };

  const handleQuickReply = (reply, sender) => {
    const option = confirm(`Schedule this reply to ${sender}?\n\n"${reply}"\n\nClick OK to schedule, Cancel to send now.`);
    if (option) {
      setScheduleForm({
        ...scheduleForm,
        recipient: sender,
        message: reply
      });
      setShowScheduleModal(true);
    } else {
      alert(`Sending now: "${reply}"`);
    }
  };

  const handleAutoReply = (msg) => {
    if (msg.autoReply) {
      alert(`Auto-reply sent: "${msg.autoReply}"`);
    }
  };

  const handleScheduleMessage = (e) => {
    e.preventDefault();
    const newScheduled = {
      id: scheduledMessages.length + 1,
      recipient: scheduleForm.recipient,
      message: scheduleForm.message,
      scheduledDate: new Date(`${scheduleForm.date}T${scheduleForm.time}`),
      repeat: scheduleForm.repeat,
      status: 'pending'
    };
    setScheduledMessages([...scheduledMessages, newScheduled]);
    setShowScheduleModal(false);
    setScheduleForm({
      recipient: '',
      message: '',
      date: '',
      time: '',
      repeat: 'none'
    });
    alert('Message scheduled successfully!');
  };

  const deleteScheduled = (id) => {
    setScheduledMessages(scheduledMessages.filter(msg => msg.id !== id));
  };

  const stats = {
    total: messages.length,
    high: messages.filter(m => m.priority === 'high').length,
    medium: messages.filter(m => m.priority === 'medium').length,
    low: messages.filter(m => m.priority === 'low').length,
    scheduled: scheduledMessages.length
  };

  const overallSummary = `✨ Astral AI detected ${stats.total} unread messages: ${stats.high} high priority (requiring immediate attention), ${stats.medium} medium priority, and ${stats.low} low priority. 
  Key items:
   "~ Meeting reschedule request from Ahmed,
    ~ Reminder to take laptop bag, 
    ~ and Payment Confirmation from client."`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-violet-600" />
              <h1 className="text-3xl font-bold text-gray-800"> Astra AI</h1>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoReplyEnabled}
                  onChange={(e) => setAutoReplyEnabled(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="text-sm font-medium">Auto-Reply</span>
              </label>
              <Zap className={autoReplyEnabled ? "text-yellow-500" : "text-gray-400"} />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-800">Total Messages</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{stats.high}</div>
              <div className="text-sm text-red-800">High Priority</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">{stats.medium}</div>
              <div className="text-sm text-yellow-800">Medium Priority</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-600">{stats.low}</div>
              <div className="text-sm text-gray-800">Low Priority</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">{stats.scheduled}</div>
              <div className="text-sm text-purple-800">Scheduled</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('inbox')}
                className={`px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 ${
                  activeTab === 'inbox' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                Inbox
              </button>
              <button
                onClick={() => setActiveTab('scheduled')}
                className={`px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 ${
                  activeTab === 'scheduled' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Calendar className="w-5 h-5" />
                Scheduled ({stats.scheduled})
              </button>
            </div>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Schedule Message
            </button>
          </div>
        </div>

        {/* Inbox Tab */}
        {activeTab === 'inbox' && (
          <>
            {/* Overall Summary */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg p-6 mb-6 text-white">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-bold mb-2">AI Summary</h2>
                  <p className="text-white/90">{overallSummary}</p>
                </div>
              </div>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-gray-600" />
                <div className="flex gap-2">
                  {['all', 'high', 'medium', 'low'].map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        filter === f 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Messages Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredMessages.map(msg => (
                <div key={msg.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  {/* Message Header */}
                  <div className="bg-gradient-to-r from-green-600 to-green-500 p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getCategoryIcon(msg.category)}</span>
                        <h3 className="font-bold text-lg">{msg.sender}</h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(msg.priority)} bg-white`}>
                        {msg.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-green-100 text-sm">
                      <Clock className="w-4 h-4" />
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="p-4">
                    <p className="text-gray-700 mb-4">{msg.content}</p>
                    
                    {/* AI Summary */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-600 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-purple-800 mb-1">AI INSIGHT</div>
                          <div className="text-sm text-purple-900">{msg.aiSummary}</div>
                        </div>
                      </div>
                    </div>

                    {/* Suggested Replies */}
                    {msg.suggestedReplies.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-bold text-gray-700 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-yellow-500" />
                          Quick Replies
                        </div>
                        {msg.suggestedReplies.map((reply, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuickReply(reply, msg.sender)}
                            className="w-full text-left p-3 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-lg text-sm transition group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-gray-700 group-hover:text-green-700">{reply}</span>
                              <Send className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Auto Reply */}
                    {msg.autoReply && autoReplyEnabled && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-xs font-bold text-green-800 mb-1">AUTO-REPLY</div>
                            <div className="text-sm text-green-900">{msg.autoReply}</div>
                          </div>
                          <button
                            onClick={() => handleAutoReply(msg)}
                            className="ml-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Send
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Scheduled Tab */}
        {activeTab === 'scheduled' && (
          <div className="space-y-4">
            {scheduledMessages.map(msg => (
              <div key={msg.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <h3 className="font-bold text-lg text-gray-800">{msg.recipient}</h3>
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold">
                        {msg.repeat.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3 pl-8">{msg.message}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 pl-8">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {msg.scheduledDate.toLocaleString()}
                      </div>
                      <div className="px-2 py-1 bg-green-100 text-green-700 rounded">
                        {msg.status}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                      <Edit className="w-5 h-5 text-gray-600" />
                    </button>
                    <button 
                      onClick={() => deleteScheduled(msg.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition"
                    >
                      <X className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {scheduledMessages.length === 0 && (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">No Scheduled Messages</h3>
                <p className="text-gray-500">Click "Schedule Message" to create your first scheduled message</p>
              </div>
            )}
          </div>
        )}

        {/* Schedule Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Schedule Message</h2>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              <form onSubmit={handleScheduleMessage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient
                  </label>
                  <input
                    type="text"
                    value={scheduleForm.recipient}
                    onChange={(e) => setScheduleForm({...scheduleForm, recipient: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter name or number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={scheduleForm.message}
                    onChange={(e) => setScheduleForm({...scheduleForm, message: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows="4"
                    placeholder="Type your message..."
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={scheduleForm.date}
                      onChange={(e) => setScheduleForm({...scheduleForm, date: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      value={scheduleForm.time}
                      onChange={(e) => setScheduleForm({...scheduleForm, time: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repeat
                  </label>
                  <select
                    value={scheduleForm.repeat}
                    onChange={(e) => setScheduleForm({...scheduleForm, repeat: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="none">None</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Schedule Message
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppAIDashboard;
