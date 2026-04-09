# Astra AI — Smart Messaging Inbox

An AI-powered messaging dashboard that uses **Google Gemini** to analyze incoming messages, classify them by priority, detect sentiment, generate smart replies, and schedule outgoing messages.

**Live Demo:** [amd-hackathon-two.vercel.app](https://amd-hackathon-two.vercel.app/)

## Features

- **AI Message Analysis** — Gemini classifies messages by priority (high/medium/low), detects sentiment, and summarizes each message
- **Smart Quick Replies** — AI-generated contextual reply suggestions with one-click send or schedule
- **Priority Filtering** — Filter inbox by priority level with real-time search
- **Message Scheduling** — Schedule messages with daily/weekly/monthly/yearly recurrence
- **Auto-Reply Mode** — Toggle automatic AI-generated responses
- **Dark Mode** — Full dark theme with system preference detection
- **Responsive Design** — Works seamlessly on mobile, tablet, and desktop

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS
- **AI:** Google Gemini 2.0 Flash (via `@google/generative-ai`)
- **Icons:** Lucide React
- **Deployment:** Vercel

## Getting Started

```bash
# Clone the repo
git clone https://github.com/YasserHUB10/AMD-Hackathon.git
cd AMD-Hackathon

# Install dependencies
npm install

# (Optional) Add Gemini API key for live AI
echo "VITE_GEMINI_API_KEY=your_key_here" > .env

# Start dev server
npm run dev
```

The app works without a Gemini API key using intelligent fallback data. Add a key to enable live AI analysis.

## Project Structure

```
src/
├── App.jsx                  # Main dashboard (ThemeProvider + layout)
├── gemini.js                # Gemini AI integration
├── components/
│   ├── AISummaryBanner.jsx  # AI summary + loading banner
│   ├── FilterBar.jsx        # Priority filter + search
│   ├── MessageCard.jsx      # Individual message card
│   ├── ScheduleModal.jsx    # Message scheduling form
│   ├── ScheduledList.jsx    # Scheduled messages list
│   ├── SkeletonCard.jsx     # Loading skeleton placeholders
│   ├── StatsBar.jsx         # Stats dashboard (totals by priority)
│   ├── ThemeToggle.jsx      # Dark/light mode toggle + provider
│   └── Toast.jsx            # Custom toast notification system
├── index.css                # Tailwind + Inter font
└── App.css                  # Custom animations
```

## Built By

**Yasser** — AMD Hackathon 2026

- [GitHub](https://github.com/YasserHUB10)
