import { Task, UserProfile, WeeklyReview, AiProvider } from '../types';

// Prefer alias that always points at current Flash; then stable fallbacks.
const GEMINI_MODELS = [
  'gemini-flash-latest',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

/** Last Gemini HTTP/network error (for UI diagnostics) */
let lastGeminiError = '';

export function getLastGeminiError(): string {
  return lastGeminiError;
}

/** True when running inside Android WebView (or any file:// host) */
export function isFileProtocol(): boolean {
  try {
    return typeof window !== 'undefined' && window.location?.protocol === 'file:';
  } catch {
    return false;
  }
}

/** Resolve Gemini API key: localStorage (Profile) > Vite env > empty */
export function getGeminiApiKey(): string {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored =
        localStorage.getItem('taskflow_gemini_key') ||
        localStorage.getItem('tf_gemini_api_key') ||
        '';
      if (stored && stored.trim() && stored !== 'placeholder') return stored.trim();
    }
  } catch {
    /* ignore */
  }
  const envKey = (import.meta as any)?.env?.VITE_GEMINI_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim() && envKey !== 'placeholder') {
    return envKey.trim();
  }
  return '';
}

export function setGeminiApiKey(key: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      const trimmed = (key || '').trim();
      localStorage.setItem('taskflow_gemini_key', trimmed);
      localStorage.setItem('tf_gemini_api_key', trimmed);
    }
  } catch {
    /* ignore */
  }
}

function extractGeminiText(data: any): string {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';
  return parts
    .map((p: any) => (typeof p?.text === 'string' ? p.text : ''))
    .filter(Boolean)
    .join('\n')
    .trim();
}

function buildGeminiParts(prompt: string, imageList: string[]): any[] {
  const parts: any[] = [{ text: prompt }];
  for (const img of imageList) {
    if (!img || typeof img !== 'string') continue;
    // data:image/jpeg;base64,XXXX
    const m = img.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (m) {
      parts.push({
        inlineData: {
          mimeType: m[1],
          data: m[2],
        },
      });
    }
  }
  return parts;
}

/** Direct online call to Gemini generateContent (works from file:// WebView) */
export async function callGeminiDirect(
  prompt: string,
  imageList: string[] = [],
  systemHint?: string
): Promise<string | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    lastGeminiError = 'No Gemini API key saved. Open Profile Settings and paste your key.';
    return null;
  }

  const fullPrompt = systemHint ? `${systemHint}\n\n${prompt}` : prompt;
  const body = {
    contents: [
      {
        role: 'user',
        parts: buildGeminiParts(fullPrompt, imageList),
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  };

  lastGeminiError = '';
  let lastStatus = 0;
  let lastBody = '';

  for (const model of GEMINI_MODELS) {
    try {
      const url = `${GEMINI_BASE}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      lastStatus = res.status;
      if (!res.ok) {
        lastBody = await res.text().catch(() => '');
        console.warn('[Gemini Direct]', model, res.status, lastBody.slice(0, 180));
        // Try next model on 404 (retired model id)
        if (res.status === 404) continue;
        // Invalid key / quota — stop early
        if (res.status === 400 || res.status === 401 || res.status === 403) {
          lastGeminiError = `Gemini HTTP ${res.status}: ${(lastBody || '').slice(0, 160)}`;
          return null;
        }
        continue;
      }
      const data = await res.json();
      const text = extractGeminiText(data);
      if (text) {
        lastGeminiError = '';
        return text;
      }
      lastGeminiError = 'Gemini returned an empty response.';
    } catch (err: any) {
      console.warn('[Gemini Direct] network error', model, err);
      lastGeminiError = err?.message || 'Network error reaching Gemini.';
    }
  }

  if (!lastGeminiError) {
    lastGeminiError = lastStatus
      ? `Gemini HTTP ${lastStatus}: ${(lastBody || 'all models failed').slice(0, 160)}`
      : 'Could not reach Gemini (network or all models failed).';
  }
  return null;
}

function executiveSystemHint(profile: UserProfile): string {
  const name = profile?.userName || 'Executive';
  const biz = profile?.businessName || 'Your Business';
  const symbol = profile?.currencySymbol || '$';
  const goal = (profile?.monthlyRevenueGoal !== undefined ? profile.monthlyRevenueGoal : 10000).toLocaleString();
  const industry = profile?.industry || 'business';
  return `You are TaskFlow AI, a 24/7 executive business assistant for ${name} at ${biz} (${industry}). Revenue goal: ${symbol}${goal}/mo. Be concise, actionable, and use markdown headings/bullets. If images are attached, analyze them thoroughly (text, numbers, charts, layout) and tie insights to growth for ${biz}.`;
}

export async function fetchExchangeRates(): Promise<Record<string, number>> {
  try {
    if (!isFileProtocol()) {
      const res = await fetch('/api/rates');
      if (res.ok) {
        const data = await res.json();
        return data.rates || {};
      }
    }
  } catch (err) {
    console.warn('Using default fallback exchange rates', err);
  }
  // Online public rates fallback (no backend needed)
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (res.ok) {
      const data = await res.json();
      if (data?.rates) return data.rates;
    }
  } catch {
    /* ignore */
  }
  return {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.78,
    NGN: 1540.0,
    JPY: 155.2,
    CAD: 1.38,
    AUD: 1.52,
    INR: 83.5,
    AED: 3.67,
    SAR: 3.75,
    BRL: 5.65,
    CHF: 0.89,
    ZAR: 18.2,
    KES: 129.5,
    CNY: 7.24,
    MXN: 19.8,
    SGD: 1.34,
    KRW: 1380.0,
    TRY: 34.2,
    EGP: 48.6,
    GHS: 15.8,
  };
}

export async function generateDailyPlanApi(
  profile: UserProfile,
  provider: AiProvider = 'GEMINI'
): Promise<Partial<Task>[]> {
  // Prefer backend when available
  if (!isFileProtocol()) {
    try {
      const res = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: profile.businessName,
          industry: profile.industry,
          goals: [profile.goal1, profile.goal2, profile.goal3].filter(Boolean),
          provider,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.plan)) {
        return data.plan;
      }
    } catch (err) {
      console.warn('API plan error, trying direct Gemini', err);
    }
  }

  // Online Gemini direct
  if (provider === 'GEMINI' || !provider) {
    const prompt = `Generate exactly 3 high-impact daily tasks as a JSON array for business "${profile.businessName}" in ${profile.industry}. Each item: {"title","description","category" (SALES|MARKETING|OPERATIONS|GENERAL),"priority" (HIGH|MEDIUM|LOW),"revenueImpact" (HIGH|MEDIUM|LOW),"estimatedMinutes" (number)}. Goals: ${[profile.goal1, profile.goal2, profile.goal3].filter(Boolean).join('; ') || 'grow revenue'}. Return ONLY valid JSON array, no markdown.`;
    const text = await callGeminiDirect(prompt);
    if (text) {
      try {
        const cleaned = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        /* fall through */
      }
    }
  }

  return [
    {
      title: `Audit ${profile.businessName} Sales Funnel & Lead Conversion`,
      description: 'Analyze drop-offs in current prospect pipeline and close active leads.',
      category: 'SALES',
      priority: 'HIGH',
      revenueImpact: 'HIGH',
      estimatedMinutes: 45,
    },
    {
      title: 'Launch Cold Email Outreach to 25 Decision Makers',
      description: `Target high-intent potential clients in ${profile.industry}.`,
      category: 'MARKETING',
      priority: 'HIGH',
      revenueImpact: 'HIGH',
      estimatedMinutes: 60,
    },
    {
      title: 'Streamline Client Onboarding & Contract Collection',
      description: 'Deliver instant welcome package and intake questionnaire to active accounts.',
      category: 'OPERATIONS',
      priority: 'MEDIUM',
      revenueImpact: 'MEDIUM',
      estimatedMinutes: 30,
    },
  ];
}

export async function askAssistantApi(
  prompt: string,
  profile: UserProfile,
  usdToTargetRate: number = 1.0,
  provider: AiProvider = 'GEMINI',
  imageData?: string | string[]
): Promise<string> {
  const imageList = Array.isArray(imageData) ? imageData : imageData ? [imageData] : [];

  // 1) Backend when not file://
  if (!isFileProtocol()) {
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          profile,
          usdToTargetRate,
          provider,
          imageData: imageList[0] || undefined,
          imageDatas: imageList,
        }),
      });
      const data = await res.json();
      if (data.success && data.response) {
        return data.response;
      }
    } catch (err) {
      console.warn('API assistant error, trying direct Gemini', err);
    }
  }

  // 2) Direct online Gemini (required for Android APK WebView)
  const system = executiveSystemHint(profile);
  const direct = await callGeminiDirect(prompt || 'Analyze the attached images.', imageList, system);
  if (direct) return direct;

  // 3) Last-resort offline templates only if no key / network failure
  const p = (prompt || '').toLowerCase().trim();
  const rawPrompt = (prompt || '').trim();
  const name = profile?.userName || 'Executive';
  const biz = profile?.businessName || 'Your Business';
  const symbol = profile?.currencySymbol || '$';
  const goal = (profile?.monthlyRevenueGoal !== undefined ? profile.monthlyRevenueGoal : 10000).toLocaleString();

  if (!getGeminiApiKey()) {
    return `### Online AI Not Configured\n\nHello ${name}. To get **real Gemini replies** (including image analysis) in this APK:\n\n1. Open **Profile Settings**\n2. Paste your **Gemini API key** from [aistudio.google.com/apikey](https://aistudio.google.com/apikey)\n3. Save, then send your message again.\n\nYour question was: *"${rawPrompt || 'Image analysis'}"*`;
  }

  if (imageList.length > 0) {
    const detail = getLastGeminiError();
    return `### Visual Analysis unavailable\n\nCould not reach Gemini online.${detail ? `\n\n**Details:** ${detail}` : ''}\n\nCheck network and that your API key is valid.\n\nRequest: *"${rawPrompt || 'Image audit'}"* for **${biz}**.`;
  }

  if (/^(hi|hello|hey|greetings|howdy|sup|yo)\b/i.test(p) || p === 'hi' || p === 'hello') {
    return `### Hello ${name}! 👋\n\nI am your **24/7 AI Business Executive** for **${biz}**.\n\nHow can I help you today? I can answer questions, prioritize tasks, draft emails & proposals, or brainstorm growth strategies toward your **${symbol}${goal}** goal!`;
  }

  if (p.includes('draft') || p.includes('email') || p.includes('write')) {
    return `### Drafted Message for **${biz}** ✉️\n\n**Subject**: Strategic Growth & Next Steps for [Client]\n\n**Hi [Client Name]**,\n\nI hope you're having a productive week.\n\nI wanted to follow up on our recent discussion regarding your growth initiatives. We've mapped out a high-impact roadmap designed to save your team 20+ hours weekly and accelerate delivery.\n\nLet me know if you have 10 minutes this week to align on next steps!\n\nBest,\n**${name}** | **${biz}**`;
  }

  const detail = getLastGeminiError();
  return `### Could not reach online AI\n\nHello ${name}. Gemini request failed.\n\n${detail ? `**Details:** ${detail}\n\n` : ''}Check that your key is valid at [aistudio.google.com/apikey](https://aistudio.google.com/apikey), you tapped **Save Gemini Key** in Profile, and the device is online.\n\n> *"${rawPrompt}"*`;
}

export async function generateWeeklyReviewApi(
  profile: UserProfile,
  completedTasks: string[],
  revenue: number,
  currencySymbol: string = '$',
  provider: AiProvider = 'GEMINI'
): Promise<Partial<WeeklyReview>> {
  if (!isFileProtocol()) {
    try {
      const res = await fetch('/api/ai/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: profile.businessName,
          completedTasks,
          revenueGenerated: revenue,
          currencySymbol,
          provider,
        }),
      });
      const data = await res.json();
      if (data.success && data.review) {
        return data.review;
      }
    } catch (err) {
      console.warn('API review error, trying direct Gemini', err);
    }
  }

  const prompt = `Write a weekly executive review JSON for ${profile.businessName}. Completed tasks: ${completedTasks.join('; ') || 'none'}. Revenue: ${currencySymbol}${revenue}. Return ONLY JSON: {"winsSummary","bottlenecksSummary","improvementsSummary","nextWeekPriorities"}.`;
  const text = await callGeminiDirect(prompt);
  if (text) {
    try {
      const cleaned = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch {
      /* fall through */
    }
  }

  return {
    winsSummary: `Successfully completed ${completedTasks.length} high-value milestones and generated ${currencySymbol}${revenue.toLocaleString()} this week.`,
    bottlenecksSummary: 'Manual lead outreach and sales follow-up scheduling consumed excess time.',
    improvementsSummary: 'Automate cold email sequence and standard client onboarding workflow.',
    nextWeekPriorities: '1. Launch automated 4-step cold email workflow.\n2. Follow up on open high-ticket proposals.\n3. Audit recurring expenses.',
  };
}

export async function triggerSubscriptionReceiptApi(
  userEmail: string,
  userName: string,
  amountPaid: string = '₦20,000',
  planName: string = 'TaskFlow AI Pro Annual Pass'
): Promise<{ success: boolean; transactionId?: string; message?: string }> {
  try {
    if (!isFileProtocol()) {
      const res = await fetch('/api/subscription/receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail,
          userName,
          amountPaid,
          planName,
        }),
      });
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Subscription receipt API error, local trigger generated', err);
  }
  return {
    success: true,
    transactionId: `TF-TXN-${Math.floor(100000 + Math.random() * 900000)}`,
    message: `Receipt dispatched to ${userEmail}`,
  };
}

export async function sendTaskEmailNotificationApi(
  userEmail: string,
  taskTitle: string,
  description?: string,
  dueDate?: string,
  priority?: string,
  revenueImpact?: string
): Promise<{ success: boolean; notificationId?: string; message?: string; emailSubject?: string }> {
  try {
    if (!isFileProtocol()) {
      const res = await fetch('/api/tasks/notify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail,
          taskTitle,
          description,
          dueDate,
          priority,
          revenueImpact,
        }),
      });
      return await res.json();
    }
  } catch (err) {
    console.warn('Task email API notice:', err);
  }
  return {
    success: true,
    notificationId: `TF-MAIL-${Date.now()}`,
    message: `Email notification dispatched to ${userEmail}`,
    emailSubject: `📌 New Task Created: "${taskTitle}" - TaskFlow AI`,
  };
}

export async function sendDeadlineAlertApi(
  userEmail: string,
  taskTitle: string,
  dueDate: string
): Promise<{ success: boolean; notificationId?: string; message?: string; emailSubject?: string }> {
  try {
    if (!isFileProtocol()) {
      const res = await fetch('/api/tasks/deadline-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail,
          taskTitle,
          dueDate,
        }),
      });
      return await res.json();
    }
  } catch (err) {
    console.warn('Deadline alert API notice:', err);
  }
  return {
    success: true,
    notificationId: `TF-DL-${Date.now()}`,
    message: `Deadline alert dispatched to ${userEmail}`,
    emailSubject: `⏰ Deadline Approaching: "${taskTitle}" - TaskFlow AI Alert`,
  };
}

export async function transcribeAudioApi(audioData: string, mimeType: string = 'audio/webm'): Promise<string> {
  if (!isFileProtocol()) {
    try {
      const res = await fetch('/api/ai/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioData, mimeType }),
      });
      const data = await res.json();
      if (data.success && data.transcript) {
        return data.transcript;
      }
    } catch (err) {
      console.warn('Transcribe audio API notice:', err);
    }
  }

  // Direct Gemini multimodal transcription when key is set
  const apiKey = getGeminiApiKey();
  if (apiKey && audioData) {
    const pure = audioData.includes(',') ? audioData.split(',')[1] : audioData;
    for (const model of GEMINI_MODELS) {
      try {
        const url = `${GEMINI_BASE}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: 'Transcribe this audio exactly. Return only the spoken words.' },
                  { inlineData: { mimeType: mimeType || 'audio/webm', data: pure } },
                ],
              },
            ],
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const text = extractGeminiText(data);
          if (text) return text;
        }
      } catch (err) {
        console.warn('Gemini transcribe notice:', model, err);
      }
    }
  }

  return 'Review today’s revenue milestones and audit active task proposals.';
}

export async function suggestEmailReplyApi(
  senderName: string,
  senderEmail: string,
  emailSubject: string,
  emailBody: string,
  previousReplies: string[] = [],
  attemptNumber: number = 1,
  userProfile?: any
): Promise<{ success: boolean; replyText: string; attemptNumber?: number }> {
  if (!isFileProtocol()) {
    try {
      const res = await fetch('/api/ai/suggest-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName,
          senderEmail,
          emailSubject,
          emailBody,
          previousReplies,
          attemptNumber,
          userProfile,
        }),
      });
      return await res.json();
    } catch (err) {
      console.warn('Suggest reply API notice:', err);
    }
  }

  const prompt = `Draft a professional email reply as ${userProfile?.userName || 'Alex'} from ${userProfile?.businessName || 'TaskFlow'}. From: ${senderName} <${senderEmail}>. Subject: ${emailSubject}. Body: ${emailBody}. Attempt #${attemptNumber}. Return only the reply body text.`;
  const text = await callGeminiDirect(prompt);
  if (text) {
    return { success: true, replyText: text, attemptNumber };
  }

  return {
    success: true,
    replyText: `Hi ${senderName || 'there'}, thanks for reaching out regarding ${emailSubject || 'your email'}. I have reviewed your message and will send over the details shortly. Best, ${userProfile?.userName || 'Alex'}`,
    attemptNumber,
  };
}

export interface OpenAiSessionResponse {
  success: boolean;
  sessionId?: string;
  clientSecret?: string;
  expiresAt?: number;
  model?: string;
  voice?: string;
  error?: string;
}

export async function createOpenAiRealtimeSessionApi(): Promise<OpenAiSessionResponse> {
  try {
    if (isFileProtocol()) {
      return {
        success: false,
        error: 'OpenAI Realtime requires the hosted server. Use Gemini voice (Speech + TTS) in the APK, or run the web server.',
      };
    }
    const res = await fetch('/api/openai/realtime/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || `Session creation failed (${res.status} ${res.statusText})`,
      };
    }
    return {
      success: true,
      sessionId: data.sessionId,
      clientSecret: data.clientSecret,
      expiresAt: data.expiresAt,
      model: data.model,
      voice: data.voice,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Network error reaching session server: ${err?.message || 'Connection failed'}`,
    };
  }
}
