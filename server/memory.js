/**
 * memory.js — Hindsight persistent memory layer for Astra AI
 *
 * Every WhatsApp contact gets their own memory "bank" scoped by waId.
 * - retain()  : called on every inbound message to store content + facts
 * - recall()  : called before AI reply to fetch relevant past context
 * - isMemoryConfigured() : guards usage when HINDSIGHT_BASE_URL is not set
 *
 * Bank naming convention: "whatsapp-<waId>"
 * This ensures memories are strictly isolated per contact.
 */

import { HindsightClient } from '@vectorize-io/hindsight-client';

let hindsight = null;

function getClient() {
  if (hindsight) return hindsight;

  const baseUrl = process.env.HINDSIGHT_BASE_URL;
  const apiKey = process.env.HINDSIGHT_API_KEY; // optional; needed for cloud

  if (!baseUrl) return null;

  hindsight = new HindsightClient({ baseUrl, ...(apiKey ? { apiKey } : {}) });
  return hindsight;
}

export function isMemoryConfigured() {
  return Boolean(process.env.HINDSIGHT_BASE_URL);
}

/**
 * bankId — deterministic, per-contact memory scope.
 * @param {string} waId  WhatsApp sender ID (e.g. "919876543210")
 */
function bankId(waId) {
  return `whatsapp-${waId}`;
}

/**
 * retain() — store an inbound message + extracted facts in Hindsight.
 *
 * We build a rich observation string that includes:
 *   - who sent it, when
 *   - the raw message text
 *   - any structured facts already extracted by Gemini analysis
 *
 * @param {object} msg  Normalized message object from store.js
 * @param {object|null} analysis  Gemini analysis result (priority, sentiment, etc.)
 */
export async function retainMessage(msg, analysis = null) {
  const client = getClient();
  if (!client) return;

  try {
    const ts = msg.timestamp || new Date().toISOString();

    // Build a rich textual observation
    const lines = [
      `[WhatsApp message from ${msg.sender} (${msg.waId}) at ${ts}]`,
      `Message: ${msg.content}`,
    ];

    if (analysis) {
      if (analysis.priority)   lines.push(`Priority: ${analysis.priority}`);
      if (analysis.sentiment)  lines.push(`Sentiment: ${analysis.sentiment}`);
      if (analysis.category)   lines.push(`Category: ${analysis.category}`);
      if (analysis.aiSummary)  lines.push(`AI Summary: ${analysis.aiSummary}`);
    }

    const observation = lines.join('\n');

    await client.retain(bankId(msg.waId), observation);
    console.log(`🧠 Hindsight retain() → bank="${bankId(msg.waId)}"`);
  } catch (err) {
    // Memory failure must never break the main flow
    console.error('Hindsight retain() failed (non-fatal):', err.message);
  }
}

/**
 * recall() — retrieve relevant past memories for a contact before generating a reply.
 *
 * Returns an array of memory strings, or [] if memory is not configured / empty.
 *
 * @param {string} waId     WhatsApp sender ID
 * @param {string} query    The current message text (used as recall query)
 * @returns {Promise<string[]>}
 */
export async function recallMemories(waId, query) {
  const client = getClient();
  if (!client) return [];

  try {
    const results = await client.recall(bankId(waId), query);

    // results is typically an array of { content: string } or just strings
    if (!results || results.length === 0) return [];

    const memories = results
      .map((r) => (typeof r === 'string' ? r : r.content || r.text || JSON.stringify(r)))
      .filter(Boolean);

    console.log(`🧠 Hindsight recall() → bank="${bankId(waId)}" — ${memories.length} memories found`);
    return memories;
  } catch (err) {
    console.error('Hindsight recall() failed (non-fatal):', err.message);
    return [];
  }
}
