export function initGemini() {
  // Gemini runs on the backend; no browser-side initialization is needed.
}

export function isGeminiAvailable() {
  // The frontend talks to the backend endpoint, which owns provider configuration.
  return true;
}

export async function analyzeMessage(content, sender = 'Unknown') {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, sender }),
  });

  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || 'Analysis request failed');
  }

  return payload.analysis;
}
