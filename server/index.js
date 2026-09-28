import 'dotenv/config';
import http from 'node:http';
import { URL } from 'node:url';
import { addMessages, listMessages, seedMessages } from './store.js';
import {
  getWhatsAppConfig,
  isWhatsAppConfigured,
  parseWebhookPayload,
  sendTextMessage,
} from './whatsapp.js';
import { analyzeMessage, isGeminiConfigured } from './gemini.js';
import { retainMessage, recallMemories, isMemoryConfigured } from './memory.js';

const port = Number(process.env.PORT || 3001);

seedMessages([
  {
    id: 'sample-1',
    waId: '919999999999',
    sender: 'Sample Lead',
    chatName: 'Sample Lead',
    content: 'This demo inbox will switch to live WhatsApp data after your webhook starts receiving events.',
    timestamp: new Date().toISOString(),
    source: 'demo',
    analysis: {
      priority: 'low',
      category: 'other',
      sentiment: 'neutral',
      suggestedReplies: ['Thanks!', 'Got it.', 'Understood.'],
      autoReply: null,
      aiSummary: 'Sample welcome message for the demo inbox.',
    },
  },
]);

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, body) {
  response.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  });
  response.end(body);
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host}`);

  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    response.end();
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/status') {
    const config = getWhatsAppConfig();
    sendJson(response, 200, {
      configured: isWhatsAppConfigured(),
      geminiConfigured: isGeminiConfigured(),
      memoryConfigured: isMemoryConfigured(),
      graphVersion: config.graphVersion,
      phoneNumberIdPresent: Boolean(config.phoneNumberId),
      businessAccountIdPresent: Boolean(config.businessAccountId),
      accessTokenPresent: Boolean(config.accessToken),
      verifyTokenPresent: Boolean(config.verifyToken),
      webhookPath: '/api/whatsapp/webhook',
      messagesCount: listMessages().length,
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/messages') {
    sendJson(response, 200, { messages: listMessages() });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/send') {
    try {
      const body = await readJsonBody(request);
      const result = await sendTextMessage({
        to: body.to,
        body: body.message,
      });

      addMessages([
        {
          id: result.messages?.[0]?.id || `outbound-${Date.now()}`,
          waId: body.to,
          sender: 'You',
          chatName: body.to,
          content: body.message,
          type: 'text',
          direction: 'outbound',
          timestamp: new Date().toISOString(),
          source: 'meta-cloud-api',
          raw: result,
        },
      ]);

      sendJson(response, 200, { ok: true, result });
    } catch (error) {
      sendJson(response, 500, { ok: false, error: error.message });
    }
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/whatsapp/webhook') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode === 'subscribe' && token && token === verifyToken) {
      sendText(response, 200, challenge || '');
      return;
    }

    sendText(response, 403, 'Verification failed');
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/whatsapp/webhook') {
    try {
      const body = await readJsonBody(request);
      const incomingMessages = parseWebhookPayload(body);

      // Analyze each message with Gemini AI (non-blocking)
      for (const msg of incomingMessages) {
        try {
          // 1️⃣  RECALL — fetch this contact's past memories before generating the AI reply
          const memories = await recallMemories(msg.waId, msg.content);

          // 2️⃣  ANALYZE — pass recalled memories to enrich the Gemini prompt
          const analysis = await analyzeMessage(msg.content, msg.sender, memories);
          msg.analysis = analysis;

          // Attach memory metadata so the frontend can show it
          msg.memoryCount = memories.length;

          console.log(`🤖 AI: [${analysis.priority}] ${analysis.aiSummary}`);

          // 3️⃣  RETAIN — persist this message + analysis to Hindsight
          await retainMessage(msg, analysis);
        } catch (err) {
          console.error('AI analysis failed for message:', err.message);
        }
      }

      addMessages(incomingMessages);
      sendJson(response, 200, { ok: true, received: incomingMessages.length });
    } catch (error) {
      sendJson(response, 500, { ok: false, error: error.message });
    }
    return;
  }

  // ─── DEMO ENDPOINT ────────────────────────────────────────────────────────
  // POST /api/demo/conversation
  // Simulates a 10-message multi-turn conversation with one fake contact
  // so you can see memory grow: msg 1 (no memory) → msg 5 → msg 10 (rich context).
  //
  // Body: { waId?: string, senderName?: string }
  // Returns: array of { turn, message, memories, analysis }
  if (request.method === 'POST' && url.pathname === '/api/demo/conversation') {
    try {
      const body = await readJsonBody(request);
      const waId = body.waId || 'demo-9999999999';
      const senderName = body.senderName || 'Demo User';

      // ?memory=off disables recall() and retain() for this run
      const memoryEnabled = url.searchParams.get('memory') !== 'off';

      const script = [
        "Hi! I'm looking for a laptop.",
        "My budget is around $1000.",
        "I mainly do video editing and gaming.",
        "I prefer a 15-inch screen.",
        "Do you have anything with an RTX 4060?",
        "What about battery life? I travel a lot.",
        "I also need good thermal performance — my last laptop throttled badly.",
        "Can you compare the ASUS ROG and the Lenovo Legion?",
        "I think I'm leaning toward the Legion. Any deals?",
        "Great, I'll go with the Legion 5 Pro. What's the return policy?",
      ];

      const results = [];

      for (let i = 0; i < script.length; i++) {
        const content = script[i];
        const turn = i + 1;

        // 1.5 s inter-turn delay (skip before the very first turn)
        if (i > 0) await new Promise((r) => setTimeout(r, 1500));

        // Recall memories from Hindsight before analysis (skipped when memory=off)
        const memories = memoryEnabled ? await recallMemories(waId, content) : [];

        // Analyze with Gemini (memories injected into prompt)
        const analysis = await analyzeMessage(content, senderName, memories).catch(() => null);

        const msg = {
          id: `demo-${waId}-${turn}`,
          waId,
          sender: senderName,
          chatName: senderName,
          content,
          type: 'text',
          direction: 'inbound',
          timestamp: new Date().toISOString(),
          source: 'demo',
          analysis,
          memoryCount: memories.length,
        };

        // Persist to Hindsight after analysis (skipped when memory=off)
        if (memoryEnabled) await retainMessage(msg, analysis);

        // Also add to the in-memory store so it shows in the dashboard
        addMessages([msg]);

        results.push({
          turn,
          message: content,
          memoryEnabled,
          memoriesAtTurnStart: memories,
          modelUsed: analysis?.modelUsed ?? 'none',
          usedFallbackReply: analysis?.usedFallbackReply ?? true,
          memoriesUsed: analysis?.memoriesUsed ?? memories.length,
          analysis,
        });

        console.log(
          `🎬 Demo turn ${turn} [memory=${memoryEnabled ? 'on' : 'off'}]: ${memories.length} memories recalled` +
          ` | model=${analysis?.modelUsed ?? 'none'}` +
          ` | fallback=${analysis?.usedFallbackReply ?? true}`
        );
      }

      sendJson(response, 200, {
        ok: true,
        waId,
        senderName,
        memoryEnabled,
        turns: results,
      });
    } catch (error) {
      sendJson(response, 500, { ok: false, error: error.message });
    }
    return;
  }

  // GET /api/demo/memories/:waId — inspect what Hindsight remembers for a contact
  if (request.method === 'GET' && url.pathname.startsWith('/api/demo/memories/')) {
    const waId = url.pathname.replace('/api/demo/memories/', '');
    try {
      const memories = await recallMemories(waId, 'What do I know about this contact?');
      sendJson(response, 200, { ok: true, waId, memories });
    } catch (error) {
      sendJson(response, 500, { ok: false, error: error.message });
    }
    return;
  }

  sendJson(response, 404, { ok: false, error: 'Not found' });
});

server.listen(port, () => {
  console.log(`WhatsApp server listening on http://localhost:${port}`);
  if (isGeminiConfigured()) {
    console.log('🤖 Gemini AI is configured — incoming messages will be analyzed.');
  } else {
    console.log('⚠️  GEMINI_API_KEY not set — AI analysis disabled.');
  }
  if (isMemoryConfigured()) {
    console.log('🧠 Hindsight memory is configured — messages will be retained and recalled per contact.');
  } else {
    console.log('ℹ️  HINDSIGHT_BASE_URL not set — persistent memory disabled (set it to enable).');
  }
});
