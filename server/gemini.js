import { GoogleGenerativeAI } from '@google/generative-ai';

let model = null;

function ensureModel() {
  if (model) return true;
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return false;
  const genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  return true;
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

export async function analyzeMessage(content, sender = 'Unknown') {
  if (!ensureModel()) return { ...FALLBACK, aiSummary: content.slice(0, 100) };

  const prompt = [
    'You are a WhatsApp inbox assistant.',
    'Analyze this message and return ONLY valid JSON with keys:',
    'priority (high|medium|low), category (work|family|marketing|other), sentiment (positive|neutral|negative|urgent),',
    'suggestedReplies (array of up to 3 short strings), autoReply (string or null), aiSummary (short string).',
    `Sender: ${sender}`,
    `Message: ${content}`,
  ].join('\n');

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = parseJson(text);
    return parsed || { ...FALLBACK, aiSummary: content.slice(0, 100) };
  } catch (err) {
    console.error('Server Gemini error:', err.message);
    return { ...FALLBACK, aiSummary: content.slice(0, 100) };
  }
}

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY);
}
