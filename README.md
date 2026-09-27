# WhatsApp Cloud API Dashboard

This project now includes:

- A Vite React dashboard for viewing incoming webhook messages
- A small Node server for Meta webhook verification and message ingestion
- A send endpoint for outbound WhatsApp text messages through the official Cloud API

## Environment

Copy `.env.example` to `.env` and fill in:

- `WHATSAPP_VERIFY_TOKEN`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_BUSINESS_ACCOUNT_ID`
- `WHATSAPP_GRAPH_VERSION`
- `PORT`
- `VITE_GEMINI_API_KEY` if you also want Gemini features later

## Run locally

Use two terminals from the repo root:

```powershell
npm run server
```

```powershell
npm run dev
```

The frontend runs on Vite and proxies `/api` calls to `http://localhost:3001`.

## Webhook URL

Expose your local server over HTTPS with a tunnel, then use:

```text
https://your-public-url/api/whatsapp/webhook
```

Use the same verify token value in Meta and your local `.env`.

## Available endpoints

- `GET /api/status`
- `GET /api/messages`
- `POST /api/send`
- `GET /api/whatsapp/webhook`
- `POST /api/whatsapp/webhook`
- `POST /api/demo/conversation` *(new — see below)*
- `GET /api/demo/memories/:waId` *(new — see below)*

## Notes

- The local message store is in-memory for now, so messages reset when the server restarts.
- Outbound sending is currently text-only.
- Group and community behavior depends on what Meta delivers to your WABA and webhook subscriptions.

---

## How Hindsight Memory Is Used

Astra AI uses [Hindsight](https://hindsight.vectorize.io/) to give the agent **persistent memory across conversations** — not just within one chat session, but across every interaction with a specific WhatsApp contact over time.

### Why it matters

Without memory, every inbound message is treated as the first one. The AI has no idea that a contact mentioned their budget, preferred product, or past objections. With Hindsight, the agent accumulates a growing "mental model" of each contact and surfaces that context automatically.

### What `retain()` does

Every time an inbound message arrives, `retainMessage()` in [`server/memory.js`](server/memory.js) is called **after** Gemini analysis. It builds a rich observation string containing:

```
[WhatsApp message from Alice (919876543210) at 2026-09-27T16:00:00Z]
Message: My budget is around $1000.
Priority: high
Sentiment: positive
Category: work
AI Summary: Contact has stated a $1000 budget for a product purchase.
```

This observation is stored in a **contact-scoped memory bank** named `whatsapp-<waId>`, isolating every contact's memories from every other.

### What `recall()` does

Every time an inbound message arrives, `recallMemories()` is called **before** Gemini analysis. It sends the current message text as a query to Hindsight's multi-strategy retrieval (semantic + keyword + graph traversal + temporal). Hindsight returns the most relevant past facts for that contact.

These memories are injected into the Gemini prompt as a block:

```
--- CONTACT MEMORY (from previous conversations) ---
[1] [WhatsApp message from Alice...] Budget: $1000, prefers 15-inch screen...
[2] [WhatsApp message from Alice...] Interested in RTX 4060, travels often...
--- END MEMORY ---
Use the above history to personalize your analysis and suggestedReplies.
```

The result: suggested replies and AI summaries reference what Alice actually told us — not a generic template.

### Configuration

Set these in your `.env`:

```env
# Self-hosted Hindsight server
HINDSIGHT_BASE_URL=http://localhost:8888

# OR Hindsight Cloud
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_API_KEY=your_api_key_here
```

If `HINDSIGHT_BASE_URL` is not set, memory is silently disabled and all other features continue to work normally.

### Demo endpoint

To see memory growth across 10 messages with a fake contact:

```bash
curl -X POST http://localhost:3001/api/demo/conversation \
  -H "Content-Type: application/json" \
  -d '{"waId": "demo-alice-001", "senderName": "Alice"}'
```

The response shows `memoriesAtTurnStart` for each turn — turn 1 will have 0 memories, turn 5 will have several, and turn 10 will have a full picture of Alice's stated preferences, budget, and product decisions.

To inspect what Hindsight currently knows about a contact:

```bash
curl http://localhost:3001/api/demo/memories/demo-alice-001
```
