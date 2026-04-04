import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let model = null;

if (API_KEY) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

export async function askGemini(prompt) {
  if (!model) return "API key missing";

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error(err);
    return "Error generating response";
  }
}