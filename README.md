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

## Notes

- The local message store is in-memory for now, so messages reset when the server restarts.
- Outbound sending is currently text-only.
- Group and community behavior depends on what Meta delivers to your WABA and webhook subscriptions.
