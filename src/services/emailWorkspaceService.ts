import { AppNotification } from '../types';

export interface IncomingEmailMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  body: string;
  timestamp: string;
  suggestedReplies: string[];
}

export const INITIAL_GMAIL_MESSAGES: IncomingEmailMessage[] = [
  {
    id: 'msg_gmail_101',
    senderName: 'Sarah Jenkins (Apex Investments)',
    senderEmail: 'sarah.j@apexinvestments.com',
    subject: '📌 Q3 $15,000 Consulting Retainer Agreement',
    body: 'Hi Alex! Our executive board reviewed your TaskFlow AI consulting proposal. We are ready to sign, but can we split the retainer into two $7,500 monthly milestones starting this Monday?',
    timestamp: '10 mins ago',
    suggestedReplies: [
      'Hi Sarah! That works great. I can structure the agreement into two $7,500 monthly milestone deliverables. I will send over the updated contract link today so we can kick off on Monday.',
    ],
  },
  {
    id: 'msg_gmail_102',
    senderName: 'David Vance (Vance Growth Agency)',
    senderEmail: 'dvance@vancegrowth.io',
    subject: '🚀 High-Ticket Partnership & AI Automation Workflow',
    body: 'Hey Alex, loved your automated client onboarding workflow video. Would you be open to white-labeling TaskFlow AI for our 35 agency accounts? Let us know your availability for a brief call.',
    timestamp: '25 mins ago',
    suggestedReplies: [
      'Hey David, thanks for reaching out! White-labeling for your 35 accounts sounds like a high-leverage fit. Let us schedule a 15-minute strategy call tomorrow at 2 PM EST to discuss pricing and custom setup.',
    ],
  },
  {
    id: 'msg_gmail_103',
    senderName: 'Marcus Thorne (ScaleCapital VP)',
    senderEmail: 'mthorne@scalecapital.com',
    subject: '⚡ Quick Question on Monthly Revenue Projections',
    body: 'Hi Alex, following up on our quarterly review. Could you send over the updated monthly revenue engine breakdown and automated task completion metrics by end of day?',
    timestamp: '1 hour ago',
    suggestedReplies: [
      'Hi Marcus, absolutely! I am compiling the updated revenue metrics and automated task completion analytics from TaskFlow AI now. I will email you the full executive PDF report within the next two hours.',
    ],
  },
];

/**
 * Syncs Gmail messages via Workspace API or returns local inbox items
 */
function getGoogleAccessToken(): string {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('tf_google_access_token') || '';
    }
  } catch {
    /* ignore */
  }
  return '';
}

export async function fetchWorkspaceGmailMessages(userEmail?: string): Promise<IncomingEmailMessage[]> {
  const token = getGoogleAccessToken();
  if (!token) {
    return INITIAL_GMAIL_MESSAGES;
  }

  try {
    const listRes = await fetch(
      'https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=8&q=in:inbox',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!listRes.ok) {
      console.warn('[Gmail] list failed', listRes.status, await listRes.text().catch(() => ''));
      return INITIAL_GMAIL_MESSAGES;
    }
    const listData = await listRes.json();
    const ids: string[] = (listData.messages || []).map((m: any) => m.id).filter(Boolean);
    if (!ids.length) return [];

    const messages: IncomingEmailMessage[] = [];
    for (const id of ids.slice(0, 8)) {
      try {
        const msgRes = await fetch(
          `https://www.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!msgRes.ok) continue;
        const msg = await msgRes.json();
        const headers: Record<string, string> = {};
        for (const h of msg.payload?.headers || []) {
          if (h?.name && h?.value) headers[String(h.name).toLowerCase()] = h.value;
        }
        const from = headers['from'] || 'Unknown';
        const nameMatch = from.match(/^"?([^"<]+)"?\s*</);
        const emailMatch = from.match(/<([^>]+)>/);
        messages.push({
          id: msg.id || id,
          senderName: (nameMatch?.[1] || from).trim(),
          senderEmail: (emailMatch?.[1] || from).trim(),
          subject: headers['subject'] || '(no subject)',
          body: msg.snippet || '',
          timestamp: headers['date'] || 'recent',
          suggestedReplies: [],
        });
      } catch (e) {
        console.warn('[Gmail] message fetch notice', e);
      }
    }
    if (messages.length) return messages;
  } catch (err) {
    console.warn('[Gmail Workspace Service] API notice:', err);
  }

  return INITIAL_GMAIL_MESSAGES;
}
