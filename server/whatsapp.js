const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || 'v23.0';

export function getWhatsAppConfig() {
  return {
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || '',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    graphVersion: GRAPH_VERSION,
  };
}

export function isWhatsAppConfigured() {
  const config = getWhatsAppConfig();
  return Boolean(config.verifyToken && config.accessToken && config.phoneNumberId);
}

function getMessageText(message) {
  if (message.text?.body) return message.text.body;
  if (message.button?.text) return message.button.text;
  if (message.interactive?.button_reply?.title) return message.interactive.button_reply.title;
  if (message.interactive?.list_reply?.title) return message.interactive.list_reply.title;
  return `[${message.type || 'message'}]`;
}

export function parseWebhookPayload(body) {
  const parsedMessages = [];

  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value || {};
      const contactMap = new Map(
        (value.contacts || []).map((contact) => [
          contact.wa_id,
          contact.profile?.name || contact.wa_id || 'Unknown',
        ]),
      );

      for (const message of value.messages || []) {
        const waId = message.from || '';
        parsedMessages.push({
          id: message.id,
          waId,
          sender: contactMap.get(waId) || waId || 'Unknown',
          chatName: contactMap.get(waId) || waId || 'Unknown chat',
          content: getMessageText(message),
          type: message.type || 'text',
          direction: 'inbound',
          timestamp: message.timestamp,
          source: 'meta-cloud-api',
          raw: message,
        });
      }
    }
  }

  return parsedMessages;
}

export async function sendTextMessage({ to, body }) {
  const config = getWhatsAppConfig();

  if (!config.accessToken || !config.phoneNumberId) {
    throw new Error('Missing WhatsApp access token or phone number ID.');
  }

  const response = await fetch(
    `https://graph.facebook.com/${config.graphVersion}/${config.phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: {
          body,
        },
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const detail = data?.error?.message || 'Unknown Meta API error';
    throw new Error(detail);
  }

  return data;
}
