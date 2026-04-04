import { GoogleGenerativeAI } from "@google/generative-ai";

let model = null;

export function initGemini() {
  if (typeof window === "undefined") return;

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return;

  if (!model) {
    const genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }
}

export function isGeminiAvailable() {
  return Boolean(import.meta.env.VITE_GEMINI_API_KEY);
}

export async function askGemini(prompt) {
  initGemini();
  if (!model) return "AI not ready";

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("Gemini ask error:", err);
    return "Error generating response";
  }
}

function parseJsonFromText(text) {
  try {
    return JSON.parse(text);
  } catch {
    const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fencedMatch?.[1]) {
      try {
        return JSON.parse(fencedMatch[1]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function analyzeMessage(content, sender = "Unknown") {
  initGemini();
  if (!model) return null;

  const prompt = [
    "You are a WhatsApp inbox assistant.",
    "Analyze this message and return ONLY valid JSON with keys:",
    "priority (high|medium|low), category (work|family|marketing|other), sentiment (positive|neutral|negative), suggestedReplies (array of up to 3 short strings), autoReply (string), aiSummary (short string).",
    `Sender: ${sender}`,
    `Message: ${content}`,
  ].join("\n");

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = parseJsonFromText(text);
    return parsed;
  } catch (err) {
    console.error("Gemini analyzeMessage error:", err);
    return null;
  }
}

export async function generateInboxSummary(messages) {
  initGemini();
  if (!model) return null;

  const prompt = [
    "You are a WhatsApp inbox summarizer.",
    "Create a concise one-paragraph summary for the user.",
    "Mention urgent items first, then medium and low-priority signals.",
    "Keep it under 80 words.",
    `Messages JSON: ${JSON.stringify(messages)}`,
  ].join("\n");

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("Gemini generateInboxSummary error:", err);
    return null;
  }
}