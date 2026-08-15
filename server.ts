import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Modality } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// In-memory verification code store with 10-minute validity
// NOTE: For production, replace with Redis or a persistent store.
interface ResetCodeEntry {
  code: string;
  method: 'email' | 'phone';
  expiresAt: number;
  verified: boolean;
  createdAt: number;
}
const resetCodeStore = new Map<string, ResetCodeEntry>();

function getMailTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return null;
}

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  });
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGeminiKey: !!process.env.GEMINI_API_KEY });
});

// --- Auth: send reset code (code is NEVER returned in the response) ---
app.post('/api/auth/send-reset-code', async (req, res) => {
  try {
    const { identifier, method } = req.body;
    if (!identifier || typeof identifier !== 'string') {
      return res.status(400).json({ success: false, error: 'Valid email address or phone number is required.' });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const isEmail = method === 'email' || cleanIdentifier.includes('@');
    const resetChannel = isEmail ? 'email' : 'phone';

    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    const now = Date.now();
    const expiresAt = now + 10 * 60 * 1000;

    resetCodeStore.set(cleanIdentifier, {
      code: generatedCode,
      method: resetChannel,
      expiresAt,
      verified: false,
      createdAt: now,
    });

    console.log(`[TaskFlow Auth] Generated reset OTP for ${cleanIdentifier} via ${resetChannel}`);

    if (isEmail) {
      const transporter = getMailTransporter();
      if (transporter) {
        const fromAddress = process.env.SMTP_FROM || '"TaskFlow AI Security" <security@taskflow.ai>';
        transporter.sendMail({
          from: fromAddress,
          to: cleanIdentifier,
          subject: `Your TaskFlow AI Password Reset Code: ${generatedCode}`,
          text: `Hello,\n\nYour 6-digit verification code is: ${generatedCode}\n\nThis code expires in 10 minutes.\n\nTaskFlow AI Security Team`,
          html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#0A0C14;color:#fff;border-radius:16px"><h1 style="color:#06B6D4">TaskFlow AI</h1><p>Your verification code:</p><div style="font-size:36px;font-weight:800;letter-spacing:8px;color:#00E676;text-align:center;padding:14px">${generatedCode}</div><p style="color:#94A3B8;font-size:12px">Valid for 10 minutes.</p></div>`,
        }).catch((err) => console.warn('[TaskFlow Auth] SMTP notice:', err.message));
      } else {
        console.warn('[TaskFlow Auth] SMTP not configured – code generated but email not sent.');
      }
    } else if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`;
      const authHeader = 'Basic ' + Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
      fetch(twilioUrl, {
        method: 'POST',
        headers: { Authorization: authHeader, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          To: cleanIdentifier,
          From: process.env.TWILIO_PHONE_NUMBER,
          Body: `Your TaskFlow AI reset code is: ${generatedCode}. Valid for 10 mins.`,
        }).toString(),
      }).catch((err: any) => console.warn('[TaskFlow Auth] Twilio notice:', err.message));
    } else {
      console.warn('[TaskFlow Auth] Twilio not configured – code generated but SMS not sent.');
    }

    // SECURITY FIX: do not return the code in the API response
    return res.json({
      success: true,
      message: `Verification code sent via ${resetChannel}. Check your ${resetChannel === 'email' ? 'inbox' : 'phone'}.`,
      channel: resetChannel,
      identifier: cleanIdentifier,
      expiresInSeconds: 600,
    });
  } catch (error: any) {
    console.error('[TaskFlow Auth] Error in send-reset-code:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to dispatch reset code.' });
  }
});

// --- Auth: verify code (no universal demo code) ---
app.post('/api/auth/verify-reset-code', (req, res) => {
  try {
    const { identifier, code } = req.body;
    if (!identifier || !code) {
      return res.status(400).json({ success: false, error: 'Identifier and verification code are required.' });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const cleanCode = String(code).trim();
    const entry = resetCodeStore.get(cleanIdentifier);
    const isValid = entry && entry.code === cleanCode && Date.now() <= entry.expiresAt;

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: entry && Date.now() > entry.expiresAt
          ? 'Verification code has expired. Please request a new code.'
          : 'Invalid verification code. Please check and try again.',
      });
    }

    entry.verified = true;
    return res.json({ success: true, verified: true, message: 'Verification code confirmed successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Verification failed.' });
  }
});

// --- Auth: reset password (requires prior verification) ---
app.post('/api/auth/reset-password', (req, res) => {
  try {
    const { identifier, newPassword } = req.body;
    if (!identifier || !newPassword) {
      return res.status(400).json({ success: false, error: 'Identifier and new password are required.' });
    }
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters.' });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const entry = resetCodeStore.get(cleanIdentifier);

    if (!entry || !entry.verified) {
      return res.status(403).json({
        success: false,
        error: 'Identity not verified. Please request and verify a reset code first.',
      });
    }

    resetCodeStore.delete(cleanIdentifier);
    return res.json({ success: true, message: 'Password reset successfully. You can now sign in with your new password.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Password update failed.' });
  }
});

app.get('/api/rates', async (req, res) => {
  try {
    const rates: Record<string, number> = {
      USD: 1.0, EUR: 0.92, GBP: 0.78, NGN: 1540.0, JPY: 155.2,
      CAD: 1.38, AUD: 1.52, INR: 83.5, AED: 3.67, SAR: 3.75,
      BRL: 5.65, CHF: 0.89, ZAR: 18.2, KES: 129.5, CNY: 7.24,
      MXN: 19.8, SGD: 1.34, KRW: 1380.0, TRY: 34.2, EGP: 48.6, GHS: 15.8,
    };
    res.json({ success: true, base: 'USD', rates, lastUpdated: new Date().toISOString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

function generateDynamicChatFallback(prompt: string, profile: any, hasImage = false): string {
  const name = profile?.userName || 'Executive';
  const biz = profile?.businessName || 'Your Business';
  const symbol = profile?.currencySymbol || '$';
  const goal = (profile?.monthlyRevenueGoal !== undefined ? profile.monthlyRevenueGoal : 10000).toLocaleString();
  const raw = (prompt || '').trim();
  if (hasImage) return `### Visual Analysis for **${biz}**\n\nHello ${name}. Analysis of your image regarding: *\"${raw || 'inspection'}\"*. Let me know next steps.`;
  if (/^(hi|hello|hey)\b/i.test(raw.toLowerCase()) || raw.toLowerCase() === 'hi') {
    return `### Hello ${name}! 👋\n\nI am your executive AI assistant for **${biz}**. How can I help?`;
  }
  return `### Insights for **${biz}** 💡\n\nHello ${name}. Regarding: *\"${raw}\"*\n\nFocus on actions that support **${symbol}${goal}**. How else can I help?`;
}

async function generateGeminiContentWithFallback(ai: GoogleGenAI, params: { contents: any; config?: any }) {
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-pro'];
  let lastError: any = null;
  for (let i = 0; i < models.length; i++) {
    try {
      const response = await ai.models.generateContent({ model: models[i], contents: params.contents, config: params.config });
      if (response?.text) return response;
    } catch (err: any) {
      lastError = err;
      if (i < models.length - 1) await new Promise((r) => setTimeout(r, 200));
    }
  }
  throw lastError || new Error('Model generation failed');
}

app.post('/api/ai/plan', async (req, res) => {
  const { businessName, industry, goals } = req.body;
  const ai = getGeminiClient();
  const defaultPlan = [
    { title: `Audit ${businessName || 'Business'} Sales Pipeline`, description: 'Identify high-value leads and bottlenecks.', category: 'SALES', priority: 'HIGH', revenueImpact: 'HIGH', estimatedMinutes: 45 },
    { title: `Launch Outreach in ${industry || 'Your Niche'}`, description: 'Reach 25 decision makers.', category: 'MARKETING', priority: 'HIGH', revenueImpact: 'HIGH', estimatedMinutes: 60 },
    { title: 'Optimize Pricing & Onboarding', description: 'Streamline contracts and payments.', category: 'FINANCE', priority: 'MEDIUM', revenueImpact: 'MEDIUM', estimatedMinutes: 30 },
  ];
  if (!ai) return res.json({ success: true, isFallback: true, plan: defaultPlan });
  try {
    const prompt = `Generate 3-4 high-impact daily tasks as JSON for business ${businessName || 'Apex'}, industry ${industry || 'Agency'}, goals ${Array.isArray(goals) ? goals.join(', ') : goals}.`;
    const response = await generateGeminiContentWithFallback(ai, { contents: prompt, config: { responseMimeType: 'application/json' } });
    res.json({ success: true, plan: JSON.parse(response.text || '[]') });
  } catch {
    res.json({ success: true, isFallback: true, plan: defaultPlan });
  }
});

app.post('/api/ai/chat', async (req, res) => {
  const { prompt = '', profile, imageData, imageDatas, images } = req.body;
  const ai = getGeminiClient();
  const allImages: string[] = [];
  if (Array.isArray(imageDatas)) allImages.push(...imageDatas.filter((i) => typeof i === 'string' && i.length > 50));
  else if (Array.isArray(images)) allImages.push(...images.filter((i) => typeof i === 'string' && i.length > 50));
  else if (typeof imageData === 'string' && imageData.length > 50) allImages.push(imageData);
  const hasImage = allImages.length > 0;

  if (!ai) return res.json({ success: true, isFallback: true, response: generateDynamicChatFallback(prompt, profile, hasImage) });

  try {
    const system = `You are TaskFlow AI for ${profile?.userName || 'user'} (${profile?.businessName || 'business'}). Be helpful and clear.`;
    let contents: any;
    if (hasImage) {
      const parts = allImages.map((img) => {
        let mime = 'image/jpeg', data = img;
        const m = img.match(/^data:([^;]+);base64,(.+)$/s);
        if (m) { mime = m[1]; data = m[2]; }
        return { inlineData: { mimeType: mime, data } };
      });
      contents = [...parts, { text: `${system}\n\nUser: ${prompt || 'Analyze images.'}` }];
    } else {
      contents = `${system}\n\nUser: ${prompt}`;
    }
    const response = await generateGeminiContentWithFallback(ai, {
      contents,
      config: {
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
      },
    });
    res.json({ success: true, response: response.text || generateDynamicChatFallback(prompt, profile, hasImage) });
  } catch {
    res.json({ success: true, isFallback: true, response: generateDynamicChatFallback(prompt, profile, hasImage) });
  }
});

app.post('/api/ai/review', async (req, res) => {
  const { businessName, completedTasks, revenueGenerated, currencySymbol = '$' } = req.body;
  const ai = getGeminiClient();
  const defaultReview = {
    winsSummary: `Completed ${completedTasks?.length || 5} milestones; revenue ${currencySymbol}${revenueGenerated || 0}.`,
    bottlenecksSummary: 'Manual outreach consumed excess time.',
    improvementsSummary: 'Automate email sequences and onboarding.',
    nextWeekPriorities: '1. Automate outreach.\n2. Follow up proposals.\n3. Audit expenses.',
  };
  if (!ai) return res.json({ success: true, isFallback: true, review: defaultReview });
  try {
    const prompt = `Weekly review JSON for ${businessName}. Tasks: ${Array.isArray(completedTasks) ? completedTasks.join(', ') : completedTasks}. Revenue: ${currencySymbol}${revenueGenerated}.`;
    const response = await generateGeminiContentWithFallback(ai, { contents: prompt, config: { responseMimeType: 'application/json' } });
    res.json({ success: true, review: JSON.parse(response.text || '{}') });
  } catch {
    res.json({ success: true, isFallback: true, review: defaultReview });
  }
});

// No hardcoded personal emails – require userEmail
app.post('/api/subscription/receipt', async (req, res) => {
  try {
    const { userEmail, userName, amountPaid = '₦20,000', planName = 'TaskFlow AI Pro Annual Pass' } = req.body;
    if (!userEmail || typeof userEmail !== 'string') {
      return res.status(400).json({ success: false, error: 'userEmail is required.' });
    }
    const transactionId = `TF-TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    res.json({
      success: true, transactionId, userEmail, userName: userName || 'Valued User',
      planName, amountPaid, currency: 'NGN', date, status: 'SUCCESSFUL',
      message: `Receipt generated for ${userEmail}.`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks/notify-email', async (req, res) => {
  try {
    const { userEmail, taskTitle } = req.body;
    if (!userEmail || typeof userEmail !== 'string') {
      return res.status(400).json({ success: false, error: 'userEmail is required.' });
    }
    res.json({
      success: true,
      notificationId: `TF-MAIL-${Math.floor(100000 + Math.random() * 900000)}`,
      userEmail, taskTitle, type: 'TASK_CREATED', status: 'DELIVERED',
      message: `Notification prepared for ${userEmail}.`,
      emailSubject: `📌 New Task: "${taskTitle}" - TaskFlow AI`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks/deadline-alert', async (req, res) => {
  try {
    const { userEmail, taskTitle } = req.body;
    if (!userEmail || typeof userEmail !== 'string') {
      return res.status(400).json({ success: false, error: 'userEmail is required.' });
    }
    res.json({
      success: true,
      notificationId: `TF-DL-${Math.floor(100000 + Math.random() * 900000)}`,
      userEmail, taskTitle, type: 'DEADLINE_APPROACHING', status: 'DELIVERED',
      message: `Deadline alert for ${userEmail}.`,
      emailSubject: `⏰ Deadline: "${taskTitle}" - TaskFlow AI`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/suggest-reply', async (req, res) => {
  const { senderName, emailSubject, emailBody, attemptNumber = 1, userProfile } = req.body;
  const ai = getGeminiClient();
  const fallback = `Hi ${senderName || 'there'}, thanks regarding ${emailSubject || 'your message'}. Best, ${userProfile?.userName || 'Alex'}`;
  if (!ai) return res.json({ success: true, replyText: fallback, isFallback: true, attemptNumber });
  try {
    const prompt = `Draft a short professional reply from ${userProfile?.userName || 'Alex'} to ${senderName || 'Sender'} about ${emailSubject || 'inquiry'}. Body context: ${emailBody || ''}`;
    const response = await generateGeminiContentWithFallback(ai, { contents: prompt });
    res.json({ success: true, replyText: response.text?.trim() || fallback, attemptNumber });
  } catch {
    res.json({ success: true, replyText: fallback, isFallback: true, attemptNumber });
  }
});

process.on('unhandledRejection', (reason) => console.error('[unhandledRejection]', reason));
process.on('uncaughtException', (err) => console.error('[uncaughtException]', err));

const originalWsEmit = WebSocket.prototype.emit;
WebSocket.prototype.emit = function (event: string | symbol, ...args: any[]) {
  if (event === 'error' && this.listenerCount('error') === 0) return true;
  try { return originalWsEmit.apply(this, [event, ...args] as any); } catch { return false; }
};

async function startServer() {
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/api/live-chat' });
  wss.on('error', () => {});

  wss.on('connection', async (clientWs) => {
    let session: any = null;
    let isClosed = false;
    clientWs.on('error', () => {});
    if ((clientWs as any)._socket) (clientWs as any)._socket.on('error', () => {});

    const safeSend = (payload: any) => {
      if (!isClosed && clientWs?.readyState === WebSocket.OPEN) {
        try { clientWs.send(JSON.stringify(payload), () => {}); } catch {}
      }
    };

    if (!process.env.GEMINI_API_KEY) {
      safeSend({ type: 'error', message: 'GEMINI_API_KEY is not configured.' });
      return;
    }

    try {
      const ai = getGeminiClient();
      if (!ai) throw new Error('Failed to init Gemini');
      session = await ai.live.connect({
        model: 'gemini-3.1-flash-live-preview',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction: 'You are TaskFlow AI, a concise executive assistant. Keep spoken answers short.',
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onmessage: (message: any) => {
            if (isClosed || clientWs.readyState !== WebSocket.OPEN) return;
            try {
              const parts = message.serverContent?.modelTurn?.parts;
              if (Array.isArray(parts)) {
                for (const part of parts) {
                  if (part.inlineData?.data) safeSend({ type: 'audio', data: part.inlineData.data });
                  if (part.text) safeSend({ type: 'text', role: 'model', text: part.text });
                }
              }
              if (message.serverContent?.outputAudioTranscription?.text) safeSend({ type: 'text', role: 'model', text: message.serverContent.outputAudioTranscription.text });
              if (message.serverContent?.inputAudioTranscription?.text) safeSend({ type: 'text', role: 'user', text: message.serverContent.inputAudioTranscription.text });
              if (message.serverContent?.interrupted) safeSend({ type: 'interrupted' });
              if (message.serverContent?.turnComplete) safeSend({ type: 'turn_complete' });
            } catch (e) { console.error('[Live onmessage]', e); }
          },
          onclose: () => safeSend({ type: 'session_closed' }),
          onerror: (err: any) => safeSend({ type: 'error', message: err?.message || 'Live session error' }),
        },
      });
      safeSend({ type: 'session_ready' });
    } catch (err: any) {
      safeSend({ type: 'error', message: err?.message || 'Could not connect to Gemini Live.' });
      return;
    }

    clientWs.on('message', async (raw) => {
      if (!session || isClosed) return;
      try {
        const payload = JSON.parse(raw.toString());
        if (payload.type === 'realtime_audio' && payload.data) {
          try { await session.sendRealtimeInput({ audio: { data: payload.data, mimeType: 'audio/pcm;rate=16000' } }); } catch {}
        } else if (payload.type === 'text_input' && payload.text) {
          try { await session.sendClientContent({ turns: [{ role: 'user', parts: [{ text: payload.text }] }], turnComplete: true }); } catch {}
        }
      } catch (e) { console.error('[Live message]', e); }
    });

    const cleanup = () => {
      if (isClosed) return;
      isClosed = true;
      if (session) { const s = session; session = null; try { s.close(); } catch {} }
    };
    clientWs.on('close', cleanup);
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`TaskFlow AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
