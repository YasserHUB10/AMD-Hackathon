const messages = [];

function normalizeTimestamp(timestamp) {
  if (!timestamp) return new Date().toISOString();

  const numeric = Number(timestamp);
  if (Number.isFinite(numeric)) {
    return new Date(numeric * 1000).toISOString();
  }

  const parsed = new Date(timestamp);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  return new Date().toISOString();
}

export function addMessages(items) {
  for (const item of items) {
    const id = item.id || `${item.waId}-${item.timestamp || Date.now()}`;
    const existingIndex = messages.findIndex((message) => message.id === id);
    const normalized = {
      id,
      waId: item.waId || '',
      sender: item.sender || item.waId || 'Unknown',
      chatName: item.chatName || item.sender || item.waId || 'Unknown chat',
      content: item.content || '',
      type: item.type || 'text',
      source: item.source || 'whatsapp',
      direction: item.direction || 'inbound',
      timestamp: normalizeTimestamp(item.timestamp),
      analysis: item.analysis || null,
      raw: item.raw || null,
    };

    if (existingIndex >= 0) {
      messages[existingIndex] = normalized;
    } else {
      messages.unshift(normalized);
    }
  }
}

export function listMessages() {
  return [...messages].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export function seedMessages(items) {
  if (messages.length > 0) return;
  addMessages(items);
}
