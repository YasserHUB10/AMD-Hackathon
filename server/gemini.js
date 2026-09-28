import { GoogleGenerativeAI } from '@google/generative-ai';

// ---------------------------------------------------------------------------
// Model chain — primary model read from env, fallbacks tried in order
// ---------------------------------------------------------------------------
const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const MODEL_CHAIN = [PRIMARY_MODEL, 'gemini-3.1-flash-lite', 'gemini-2.5-flash'];

// One GoogleGenerativeAI instance (key never changes at runtime)
let genAI = null;

function getGenAI() {
  if (genAI) return genAI;
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;
  genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
}

// ---------------------------------------------------------------------------
// Retry with exponential backoff — retries on 503 / 429 only
// ---------------------------------------------------------------------------
const RETRYABLE = new Set([429, 503]);
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

async function callWithRetry(modelName, prompt) {
  const client = getGenAI();
  if (!client) throw new Error('No Gemini API key configured');

  const model = client.getGenerativeModel({ model: modelName });
  let lastErr;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1); // 1 s, 2 s, 4 s
      console.log(`  ↻ Gemini retry ${attempt}/${MAX_RETRIES} on ${modelName} after ${delay}ms`);
      await new Promise((r) => setTimeout(r, delay));
    }
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      const status = err.status ?? err.statusCode ?? (err.message?.match(/\[(\d{3})/)?.[1]);
      if (status && RETRYABLE.has(Number(status))) {
        lastErr = err;
        continue; // retry
      }
      throw err; // non-retryable (404, 400, etc.) — bubble up immediately
    }
  }
  throw lastErr;
}

// ---------------------------------------------------------------------------
// JSON extraction from Gemini text output
// ---------------------------------------------------------------------------
function parseJson(text) {
  try { return JSON.parse(text); } catch { /* empty */ }
  const m = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (m?.[1]) { try { return JSON.parse(m[1]); } catch { /* empty */ } }
  const m2 = text.match(/\{[\s\S]*\}/);
  if (m2) { try { return JSON.parse(m2[0]); } catch { /* empty */ } }
  return null;
}

// ---------------------------------------------------------------------------
// Hardcoded fallback (used only when every model in the chain fails)
// ---------------------------------------------------------------------------
const FALLBACK = {
  priority: 'medium',
  category: 'other',
  sentiment: 'neutral',
  suggestedReplies: ['Thanks for your message!', "I'll get back to you soon.", 'Received, thanks!'],
  autoReply: null,
  aiSummary: 'Message received.',
};

// ---------------------------------------------------------------------------
// analyzeMessage — public API
// ---------------------------------------------------------------------------

/**
 * Analyze a WhatsApp message with Gemini AI.
 *
 * Returns the standard analysis object plus three extra fields:
 *   modelUsed        {string}  — which Gemini model actually answered
 *   usedFallbackReply {boolean} — true only when ALL models failed and the
 *                                  hardcoded generic reply was returned
 *   memoriesUsed     {number}  — count of Hindsight memories injected
 *
 * @param {string}   content   Raw message text
 * @param {string}   sender    Display name of the sender
 * @param {string[]} memories  Past memories from Hindsight recall() for this contact
 */
export async function analyzeMessage(content, sender = 'Unknown', memories = []) {
  if (!getGenAI()) {
    return { ...FALLBACK, aiSummary: content.slice(0, 100), modelUsed: 'none', usedFallbackReply: true, memoriesUsed: 0 };
  }

  const memoriesUsed = memories.length;

  // Build memory context block
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
    'You are a WhatsApp inbox assistant.',
    'Analyze this message and return ONLY valid JSON with keys:',
    'priority (high|medium|low), category (work|family|marketing|other), sentiment (positive|neutral|negative|urgent),',
    'suggestedReplies (array of up to 3 short strings that feel personal and reference past context when available),',
    'autoReply (string or null), aiSummary (short string).',
    memoryBlock,
    `Sender: ${sender}`,
    `Message: ${content}`,
  ]
    .filter(Boolean)
    .join('\n');

  // Try each model in the chain
  for (const modelName of MODEL_CHAIN) {
    try {
      console.log(`  🤖 Trying Gemini model: ${modelName}`);
      const text = await callWithRetry(modelName, prompt);
      const parsed = parseJson(text);
      if (parsed) {
        return { ...parsed, modelUsed: modelName, usedFallbackReply: false, memoriesUsed };
      }
      // Parsed returned null — response was not valid JSON; try next model
      console.warn(`  ⚠️  ${modelName} returned non-JSON output, trying next model`);
    } catch (err) {
      console.error(`  ❌ ${modelName} failed after retries: ${err.message?.slice(0, 120)}`);
      // continue to next model in chain
    }
  }

  // All models failed — return hardcoded fallback
  console.error('  🚨 All Gemini models failed — returning hardcoded fallback');
  return {
    ...FALLBACK,
    aiSummary: content.slice(0, 100),
    modelUsed: 'none',
    usedFallbackReply: true,
    memoriesUsed,
  };
}

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY);
}
