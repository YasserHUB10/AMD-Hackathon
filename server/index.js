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
          const analysis = await analyzeMessage(msg.content, msg.sender);
          msg.analysis = analysis;
          console.log(`🤖 AI: [${analysis.priority}] ${analysis.aiSummary}`);
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

  sendJson(response, 404, { ok: false, error: 'Not found' });
});

server.listen(port, () => {
  console.log(`WhatsApp server listening on http://localhost:${port}`);
  if (isGeminiConfigured()) {
    console.log('🤖 Gemini AI is configured — incoming messages will be analyzed.');
  } else {
    console.log('⚠️  GEMINI_API_KEY not set — AI analysis disabled.');
  }
});
