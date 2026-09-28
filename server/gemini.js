import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const catalog = JSON.parse(readFileSync(join(__dir, 'catalog.json'), 'utf8'));

const CATALOG_BLOCK = [
  '--- PRODUCT CATALOG ---',
  `Return policy: ${catalog.return_policy}`,
  '',
  'Available laptops:',
  ...catalog.laptops.map((l, i) =>
    `[${i + 1}] ${l.name} | $${l.price_usd} | GPU: ${l.gpu} | Screen: ${l.screen_size_inches}" | Battery: ~${l.battery_hours}h | Thermal: ${l.thermal_notes} | In stock: ${l.in_stock}`
  ),
  '--- END CATALOG ---',
  'Only state product facts (stock, specs, prices, return policy) that appear in the catalog.',
  "If the catalog doesn't cover it, say you'll check.",
  'Use CONTACT MEMORY to personalize.',
  '',
].join('\n');

const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
const MODEL_CHAIN = [PRIMARY_MODEL, 'gemini-3.8-flash', 'gemini-2.5-flash'];

let genAI = null;

function getGenAI() {
  if (genAI) return genAI;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
}

const RETRYABLE = new Set([429, 503]);
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

function redactSecrets(text) {
  return text
    .replace(/AIza[0-9A-Za-z_-]{20,}/g, '[REDACTED]')
    .replace(/\bhsk_[0-9A-Za-z_-]+/g, '[REDACTED]')
    .replace(/([?&](?:key|api_key|apikey|token)=)[^&\s]+/gi, '$1[REDACTED]')
    .replace(/\b(?:key|api[_-]?key|token)\s*[:=]\s*[^\s,;]+/gi, '[REDACTED]');
}

function logGeminiError(modelName, err) {
  const status = err?.status ?? err?.statusCode ?? (err?.message?.match(/\[(\d{3})/)?.[1]) ?? 'unknown';
  const message = redactSecrets(String(err?.message ?? err)).slice(0, 200);
  console.error(`${modelName} failed (HTTP ${status}): ${message}`);
}

async function callWithRetry(modelName, prompt) {
  const client = getGenAI();
  if (!client) throw new Error('No Gemini API key configured');

  const model = client.getGenerativeModel({ model: modelName });
  let lastErr;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
      console.log(`Gemini retry ${attempt}/${MAX_RETRIES} on ${modelName} after ${delay}ms`);
      await new Promise((r) => setTimeout(r, delay));
    }
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      const status = err.status ?? err.statusCode ?? (err.message?.match(/\[(\d{3})/)?.[1]);
      if (status && RETRYABLE.has(Number(status))) {
        lastErr = err;
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

function parseJson(text) {
  try { return JSON.parse(text); } catch { /* empty */ }
  const m = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (m?.[1]) { try { return JSON.parse(m[1]); } catch { /* empty */ } }
  const m2 = text.match(/\{[\s\S]*\}/);
  if (m2) { try { return JSON.parse(m2[0]); } catch { /* empty */ } }
  return null;
}

const FALLBACK = {
  priority: 'medium',
  category: 'other',
  sentiment: 'neutral',
  suggestedReplies: ['Thanks for your message!', "I'll get back to you soon.", 'Received, thanks!'],
  autoReply: null,
  aiSummary: 'Message received.',
};

export async function analyzeMessage(content, sender = 'Unknown', memories = []) {
  if (!getGenAI()) {
    return { ...FALLBACK, aiSummary: content.slice(0, 100), modelUsed: 'none', usedFallbackReply: true, memoriesUsed: 0 };
  }

  const memoriesUsed = memories.length;
  const memoryBlock =
    memoriesUsed > 0
      ? [
          '--- CONTACT MEMORY (from previous conversations) ---',
          ...memories.map((m, i) => `[${i + 1}] ${m}`),
          '--- END MEMORY ---',
          'Use the above history to personalize your analysis and suggestedReplies.',
          '',
        ].join('\n')
      : '';

  const prompt = [
    'You are a WhatsApp inbox assistant for a laptop store.',
    'Analyze this message and return ONLY valid JSON with keys:',
    'priority (high|medium|low), category (work|family|marketing|other), sentiment (positive|neutral|negative|urgent),',
    'suggestedReplies (array of up to 3 short strings that feel personal and reference past context when available),',
    'autoReply (string or null), aiSummary (short string).',
    CATALOG_BLOCK,
    memoryBlock,
    `Sender: ${sender}`,
    `Message: ${content}`,
  ]
    .filter(Boolean)
    .join('\n');

  const runModelChain = async () => {
    for (const modelName of MODEL_CHAIN) {
      try {
        console.log(`Trying Gemini model: ${modelName}`);
        const text = await callWithRetry(modelName, prompt);
        const parsed = parseJson(text);
        if (parsed) {
          return { ...parsed, modelUsed: modelName, usedFallbackReply: false, memoriesUsed };
        }
        console.warn(`${modelName} returned non-JSON output, trying next model`);
      } catch (err) {
        logGeminiError(modelName, err);
      }
    }
    return null;
  };

  const firstAttempt = await runModelChain();
  if (firstAttempt) return firstAttempt;

  console.error('All Gemini models failed; waiting 3 seconds before retrying the chain');
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const secondAttempt = await runModelChain();
  if (secondAttempt) return secondAttempt;

  console.error('All Gemini models failed twice; returning hardcoded fallback');
  return {
    ...FALLBACK,
    aiSummary: content.slice(0, 100),
    modelUsed: 'none',
    usedFallbackReply: true,
    memoriesUsed,
  };
}

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}
