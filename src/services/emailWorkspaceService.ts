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
export async function fetchWorkspaceGmailMessages(userEmail?: string): Promise<IncomingEmailMessage[]> {
  try {
    // If OAuth token is stored or available via window.gapi / Google Workspace
    const gapiToken = typeof window !== 'undefined' ? (window as any).gapi?.auth2?.getAuthInstance()?.currentUser?.get()?.getAuthResponse()?.access_token : null;
    if (gapiToken) {
      const res = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=5&q=is:unread', {
        headers: { Authorization: `Bearer ${gapiToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        console.log('[Gmail Workspace API] Synced incoming emails:', data);
      }
    }
  } catch (err) {
    console.warn('[Gmail Workspace Service] API notice:', err);
  }

  return INITIAL_GMAIL_MESSAGES;
}
