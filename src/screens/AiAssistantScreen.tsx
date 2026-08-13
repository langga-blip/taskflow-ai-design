import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';
import { FormattedTextWithAppEmojis, AppEmoji } from '../components/AppEmoji';
import { Bot, Sparkles, Send, User, Copy, Check, Cpu, Trash2, Mail, Calendar, HardDrive, Reply, SendHorizontal, AlertCircle, CheckCircle2, Wand2, Volume2, Image as ImageIcon, X } from 'lucide-react';
import { speakWithAlexaVoice } from '../utils/speechUtils';
import { autoCorrectText } from '../utils/autoCorrect';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  imageUrl?: string;
}

interface IncomingEmail {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  snippet: string;
  receivedTime: string;
  suggestedReply: string;
}

export const AiAssistantScreen: React.FC = () => {
  const { userProfile, aiProvider, setAiProvider, askAssistant, triggerNotification } = useApp();
  const isLight = userProfile.themeMode === 'Light';

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tf_ai_chat_messages');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {
          /* ignore error and fallback */
        }
      }
    }
    return [
      {
        id: '1',
        sender: 'assistant',
        text: `Hello ${userProfile.userName || 'Executive'}! 👋 I am your 24/7 Executive AI Business Assistant.\n\nI am actively monitoring your **Google Drive, Calendar, and Gmail** (${userProfile.userEmail || 'Connected'}).\n\nHow can I assist you with scaling **${userProfile.businessName}** today?\n\n• **Gmail Smart Response**: AI detected incoming client inquiries with automated high-converting replies.\n• **Proposal Generator**: Draft high-converting client retainer proposals.\n• **Revenue Optimization**: Action plans to reach your **${userProfile.currencySymbol}${(userProfile.monthlyRevenueGoal || 10000).toLocaleString()}** goal.`,
        timestamp: 'Just now',
      },
    ];
  });

  // Automatically save messages to localStorage on every change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('tf_ai_chat_messages', JSON.stringify(messages));
      } catch (e) {
        /* ignore */
      }
    }
  }, [messages]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Listen for execute-ai-prompt event (e.g. from Voice Command Sheet Run button)
  useEffect(() => {
    const handleExecutePromptEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt: string }>;
      if (customEvent.detail && customEvent.detail.prompt) {
        handleSendMessage(customEvent.detail.prompt);
      }
    };

    window.addEventListener('execute-ai-prompt', handleExecutePromptEvent);
    return () => window.removeEventListener('execute-ai-prompt', handleExecutePromptEvent);
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        triggerNotification('Image Attached 🖼️', 'Image uploaded successfully. Ask AI to analyze it!', 'SYSTEM');
      };
      reader.readAsDataURL(file);
    }
  };

  // Gmail smart response state
  const [incomingEmail, setIncomingEmail] = useState<IncomingEmail | null>({
    id: 'em_101',
    senderName: 'Sarah Jenkins',
    senderEmail: 's.jenkins@clientgroup.com',
    subject: 'Retainer Proposal Inquiry & Timeline',
    snippet: 'Hi! We received your initial proposal for the marketing campaign. Could you send over the updated $5,000/mo retainer agreement and estimated start date?',
    receivedTime: '5 mins ago via Gmail',
    suggestedReply: `Hi Sarah,\n\nThank you for following up! I've prepared the updated $5,000/mo retainer agreement with our start date scheduled for next Monday. All onboarding deliverables have been logged in our TaskFlow workspace.\n\nBest regards,\n${userProfile.userName || 'Executive Founder'}\n${userProfile.businessName}`,
  });

  const [editingReply, setEditingReply] = useState(
    `Hi Sarah,\n\nThank you for following up! I've prepared the updated $5,000/mo retainer agreement with our start date scheduled for next Monday. All onboarding deliverables have been logged in our TaskFlow workspace.\n\nBest regards,\n${userProfile.userName || 'Executive Founder'}\n${userProfile.businessName}`
  );
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showConfirmSendModal, setShowConfirmSendModal] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const voiceControllerRef = useRef<VoiceRecognizerController | null>(null);

  const toggleVoiceInput = async () => {
    if (isListeningVoice) {
      if (voiceControllerRef.current) {
        voiceControllerRef.current.stop();
      }
      setIsListeningVoice(false);
      return;
    }

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(50);
      } catch (e) {}
    }

    setIsListeningVoice(true);
    triggerNotification('Voice Input Active 🎙️', 'Speak your query clearly into the microphone...', 'SYSTEM');

    const controller = createVoiceRecognizer(
      (transcribedText) => {
        setInputText(transcribedText);
      },
      (errorMsg) => {
        triggerNotification('Microphone Notice', errorMsg, 'SYSTEM');
        setIsListeningVoice(false);
      },
      () => {
        setIsListeningVoice(false);
      }
    );

    voiceControllerRef.current = controller;
    await controller.start();
  };

  const handleAutoCorrect = () => {
    if (!inputText.trim()) return;
    const corrected = autoCorrectText(inputText);
    setInputText(corrected);
    triggerNotification('Auto-Correct Applied', `Corrected & polished: "${corrected}"`, 'AI');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const quickPrompts = [
    'Draft cold email pitch for a $3,000/mo retainer client',
    'How do I scale my agency revenue to $10,000/mo?',
    'Create a 5-step automated onboarding workflow for new clients',
    'Audit my current active tasks & suggest top priorities',
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    const cleared: ChatMessage[] = [
      {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `Chat cleared! How else can I assist **${userProfile.businessName}** today?`,
        timestamp: 'Just now',
      },
    ];
    setMessages(cleared);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tf_ai_chat_messages', JSON.stringify(cleared));
    }
    triggerNotification('Chat History Cleared 🧹', 'AI Assistant conversation has been reset.', 'AI');
  };

  const handleSendMessage = async (customText?: string) => {
    const rawText = (customText || inputText).trim();
    if ((!rawText && !selectedImage) || isTyping) return;

    const textToSend = autoCorrectText(rawText || (selectedImage ? 'Attached Image Analysis Request' : ''));
    const attachedImg = selectedImage;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      imageUrl: attachedImg || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setSelectedImage(null);
    setIsTyping(true);

    try {
      const promptWithImgContext = attachedImg
        ? `[User attached an image file]. Prompt: ${textToSend}`
        : textToSend;

      const aiReply = await askAssistant(promptWithImgContext);

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'I encountered an issue processing your request. Please try again or check network connectivity.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Helper to parse bold markdown and structured bullet points accurately
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    return (
      <div className="space-y-2 leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1.5" />;

          if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
            const headerText = trimmed.replace(/^#+\s+/, '');
            return (
              <h3
                key={idx}
                className={`font-extrabold text-sm sm:text-base mt-2 mb-1 ${
                  isLight ? 'text-purple-900' : 'text-[#06B6D4]'
                }`}
              >
                {renderInlineBold(headerText)}
              </h3>
            );
          }

          if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
            const bulletText = trimmed.replace(/^[-*•]\s+/, '');
            return (
              <div key={idx} className="flex items-start gap-2 pl-1.5">
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                    isLight ? 'bg-purple-600' : 'bg-[#06B6D4]'
                  }`}
                />
                <span className="flex-1">{renderInlineBold(bulletText)}</span>
              </div>
            );
          }

          if (/^\d+\.\s/.test(trimmed)) {
            const num = trimmed.match(/^(\d+\.)\s/)?.[1];
            const itemText = trimmed.replace(/^\d+\.\s+/, '');
            return (
              <div key={idx} className="flex items-start gap-2 pl-1.5">
                <span
                  className={`font-bold text-xs flex-shrink-0 ${
                    isLight ? 'text-purple-700' : 'text-[#06B6D4]'
                  }`}
                >
                  {num}
                </span>
                <span className="flex-1">{renderInlineBold(itemText)}</span>
              </div>
            );
          }

          return <p key={idx}>{renderInlineBold(trimmed)}</p>;
        })}
      </div>
    );
  };

  const renderInlineBold = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong
            key={i}
            className={`font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}
          >
            <FormattedTextWithAppEmojis text={part.slice(2, -2)} />
          </strong>
        );
      }
      return <FormattedTextWithAppEmojis key={i} text={part} />;
    });
  };

  return (
    <div className="space-y-4 pb-6 max-w-4xl mx-auto flex flex-col animate-fade-in overflow-x-hidden w-full">
      {/* Header Banner */}
      <GlassCard
        className={`p-4 flex-shrink-0 border ${
          isLight
            ? 'bg-gradient-to-r from-purple-50 via-white to-purple-50 border-cyan-300'
            : 'bg-gradient-to-r from-[#131726] via-[#1E2338] to-[#131726] border-[#06B6D4]/40'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isLight
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-[#06B6D4]/20 border border-[#06B6D4]/40 text-[#06B6D4] shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              }`}
            >
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className={`text-lg font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                24/7 AI Business Executive Assistant
              </h1>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Contextual AI advisor tuned to <span className="font-semibold text-[#06B6D4]">{userProfile.businessName}</span>
              </p>
            </div>
          </div>

          {/* Actions & AI Model Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('launch-overlay-pip'));
                triggerNotification('Overlay Assistant Active', 'Keep talking to Task Flow AI in floating widget mode!', 'AI');
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                isLight
                  ? 'bg-purple-100 border-purple-300 text-purple-900 hover:bg-purple-200'
                  : 'bg-[#06B6D4]/20 border border-[#06B6D4]/40 text-[#06B6D4] hover:bg-[#06B6D4]/30'
              }`}
              title="Display Task Flow AI over other apps in a floating picture-in-picture window"
            >
              <Sparkles className="w-3.5 h-3.5" /> Display Over Other Apps
            </button>

            <button
              onClick={handleClearHistory}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                isLight
                  ? 'bg-slate-100 border-purple-200 text-slate-700 hover:bg-slate-200'
                  : 'bg-[#0A0C14] border-[#2E3552] text-slate-400 hover:text-white'
              }`}
              title="Clear Chat"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1.5">
              <Cpu className={`w-4 h-4 ${isLight ? 'text-purple-600' : 'text-[#A78BFA]'}`} />
              <select
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value as any)}
                className={`border rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none cursor-pointer ${
                  isLight
                    ? 'bg-white border-purple-300 text-purple-900 focus:border-purple-500'
                    : 'bg-[#0A0C14] border-[#2E3552] text-[#06B6D4] focus:border-[#06B6D4]'
                }`}
              >
                <option value="GEMINI">Gemini 3.5 Flash (Default)</option>
                <option value="OPENAI">OpenAI GPT-4o</option>
                <option value="DEEPSEEK">DeepSeek R1</option>
              </select>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Gmail Smart Alert & Automatic Reply Section */}
      {incomingEmail && (
        <GlassCard
          className={`p-4 border transition-all ${
            isLight
              ? 'bg-amber-50/90 border-amber-300 text-slate-900'
              : 'bg-[#181528]/95 border-[#7C3AED]/60 text-slate-100 shadow-[0_0_20px_rgba(124,58,237,0.15)]'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-purple-500/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                      Gmail Smart Inbound Alert
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{incomingEmail.receivedTime}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    From: {incomingEmail.senderName} ({incomingEmail.senderEmail})
                  </h3>
                </div>
              </div>

              <span className="text-[11px] font-semibold text-[#06B6D4] bg-[#06B6D4]/10 border border-[#06B6D4]/30 px-2.5 py-1 rounded-lg">
                {incomingEmail.subject}
              </span>
            </div>

            <p className="text-xs text-slate-300 italic bg-[#0A0C14]/50 p-2.5 rounded-xl border border-slate-700/50">
              "{incomingEmail.snippet}"
            </p>

            {/* AI Suggested Response Box */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#A78BFA] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#06B6D4]" /> AI Suggested Response (Editable)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const freshReply = `Hi ${incomingEmail.senderName.split(' ')[0]},\n\nThank you for following up! I've confirmed our $5,000/mo retainer terms and scheduled our project kickoff for next Monday.\n\nBest regards,\n${userProfile.userName || 'Executive Founder'}\n${userProfile.businessName}`;
                    setEditingReply(freshReply);
                  }}
                  className="text-[11px] font-semibold text-[#06B6D4] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Reply className="w-3 h-3" /> Regenerate Draft
                </button>
              </div>

              <textarea
                rows={4}
                value={editingReply}
                onChange={(e) => setEditingReply(e.target.value)}
                className={`w-full text-xs sm:text-sm p-3 rounded-xl border focus:outline-none focus:border-[#7C3AED] leading-relaxed ${
                  isLight
                    ? 'bg-white border-amber-300 text-slate-900'
                    : 'bg-[#0A0C14] border-[#2E3552] text-slate-200'
                }`}
              />

              <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                <p className="text-[10px] text-slate-400">
                  Sends via Google Account: <span className="text-[#06B6D4] font-semibold">{userProfile.userEmail || 'Connected Gmail'}</span>
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIncomingEmail(null)}
                    className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                  >
                    Dismiss
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmSendModal(true)}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white text-xs font-bold shadow-md hover:brightness-110 flex items-center gap-1.5 cursor-pointer"
                  >
                    <SendHorizontal className="w-3.5 h-3.5" /> Send Reply via Gmail
                  </button>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Confirmation Modal before sending email */}
      {showConfirmSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <GlassCard className="max-w-md w-full p-6 space-y-4 border-amber-500/40">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Confirm Gmail Dispatch</h3>
                <p className="text-xs text-slate-400">Send message to {incomingEmail?.senderEmail}</p>
              </div>
            </div>

            <div className="p-3 bg-[#0A0C14] rounded-xl border border-slate-800 space-y-2 text-xs">
              <p className="font-bold text-slate-300">To: {incomingEmail?.senderEmail}</p>
              <p className="font-bold text-slate-300">Subject: Re: {incomingEmail?.subject}</p>
              <div className="p-2 bg-[#131726] rounded-lg border border-slate-700/50 max-h-32 overflow-y-auto text-slate-300 whitespace-pre-wrap italic">
                {editingReply}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmSendModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSendingEmail}
                onClick={async () => {
                  setIsSendingEmail(true);
                  try {
                    triggerNotification(
                      'Gmail Reply Sent ✉️',
                      `Replied to ${incomingEmail?.senderName} (${incomingEmail?.senderEmail}) via Gmail API.`,
                      'AI',
                      'assistant'
                    );

                    setMessages((prev) => [
                      ...prev,
                      {
                        id: 'msg_email_' + Date.now(),
                        sender: 'assistant',
                        text: `✅ **Gmail Response Dispatched**:\n\nSent Re: "${incomingEmail?.subject}" to **${incomingEmail?.senderEmail}**.\n\n*Content:* \n"${editingReply}"`,
                        timestamp: 'Just now',
                      },
                    ]);

                    setIncomingEmail(null);
                    setShowConfirmSendModal(false);
                    setEmailSentSuccess(true);
                  } catch (err) {
                    console.error(err);
                  } finally {
                    setIsSendingEmail(false);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg cursor-pointer"
              >
                {isSendingEmail ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" /> Dispatching...
                  </>
                ) : (
                  <>
                    <SendHorizontal className="w-4 h-4" /> Confirm & Send Email
                  </>
                )}
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Chat Messages Container */}
      <GlassCard
        className={`h-[350px] sm:h-[450px] overflow-y-auto space-y-4 p-4 border flex flex-col justify-between ${
          isLight
            ? 'bg-slate-50/90 border-purple-200 text-slate-900 shadow-sm'
            : 'bg-[#0A0C14]/90 border-[#2E3552] text-slate-100 shadow-xl'
        }`}
      >
        <div className="space-y-4 overflow-y-auto flex-1 pr-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 w-full ${
                m.sender === 'user' ? 'flex-row-reverse justify-start' : 'flex-row justify-start'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white shadow-md'
                    : isLight
                    ? 'bg-purple-100 border border-purple-300 text-purple-700'
                    : 'bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/40'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm ${
                  m.sender === 'user'
                    ? 'bg-[#7C3AED] text-white rounded-tr-none shadow-md ml-auto text-left'
                    : isLight
                    ? 'bg-white text-slate-900 border border-purple-200 rounded-tl-none shadow-md space-y-2 mr-auto text-left'
                    : 'bg-[#181D30] text-slate-100 border border-[#2E3552] rounded-tl-none space-y-2 shadow-lg mr-auto text-left'
                }`}
              >
                {m.sender === 'assistant' ? (
                  renderFormattedText(m.text)
                ) : (
                  <div className="space-y-2">
                    {m.imageUrl && (
                      <div className="rounded-xl overflow-hidden max-w-xs border border-purple-300/30">
                        <img src={m.imageUrl} alt="Attached input" className="w-full h-auto object-cover max-h-48" />
                      </div>
                    )}
                    <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-purple-100/20 text-[10px] text-slate-400">
                  <span>{m.timestamp}</span>

                  {m.sender === 'assistant' && (
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => speakWithAlexaVoice(m.text)}
                        className={`flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                          isLight
                            ? 'text-purple-600 hover:text-purple-900'
                            : 'text-[#06B6D4] hover:text-cyan-300'
                        }`}
                        title="Listen in Amazon Alexa AI Voice"
                      >
                        <Volume2 className="w-3 h-3" /> Speak
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopy(m.id, m.text)}
                        className={`flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                          copiedId === m.id
                            ? 'text-emerald-400'
                            : isLight
                            ? 'text-purple-600 hover:text-purple-900'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div
              className={`flex items-center gap-2 text-xs p-3 rounded-xl w-fit animate-pulse ${
                isLight
                  ? 'bg-purple-100 border border-purple-200 text-purple-900 font-semibold'
                  : 'bg-[#131726] border border-[#2E3552] text-[#06B6D4]'
              }`}
            >
              <Sparkles className="w-4 h-4 animate-spin text-purple-600" /> AI is formulating a strategic recommendation...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </GlassCard>

      {/* Quick Prompt Shortcuts */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs flex-shrink-0 touch-pan-x">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition-colors cursor-pointer text-xs font-medium ${
              isLight
                ? 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-900'
                : 'bg-[#131726] hover:bg-[#1E2338] border-[#2E3552] hover:border-[#06B6D4] text-slate-300'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Message Input Box with Image Upload & Auto-Correct */}
      <div className="flex flex-col gap-1.5 flex-shrink-0 w-full min-w-0">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />

        {selectedImage && (
          <div className="flex items-center gap-2 p-2 bg-[#131726]/90 border border-purple-500/40 rounded-xl w-fit">
            <img src={selectedImage} alt="Attachment Preview" className="w-10 h-10 object-cover rounded-lg" />
            <span className="text-xs text-purple-300 font-semibold">Image attached</span>
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="p-1 text-slate-400 hover:text-red-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {inputText.trim().length > 0 && (
          <div className="flex items-center justify-between px-1 text-[11px]">
            <span className="text-slate-400">Typing...</span>
            <button
              type="button"
              onClick={handleAutoCorrect}
              className="text-[#06B6D4] font-bold hover:underline cursor-pointer flex items-center gap-1 bg-[#06B6D4]/10 border border-[#06B6D4]/30 px-2 py-0.5 rounded-lg transition-colors"
            >
              <Wand2 className="w-3 h-3 text-[#06B6D4]" />
              <span>Auto-Correct & Refine Query</span>
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 w-full min-w-0">
          <div className="relative flex-1 min-w-0">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              autoCorrect="on"
              autoCapitalize="sentences"
              spellCheck={true}
              placeholder="Ask AI anything about your business, proposals, or tasks..."
              className={`w-full border rounded-2xl pl-4 pr-10 py-3 text-sm focus:outline-none ${
                isLight
                  ? 'bg-white border-purple-300 text-slate-900 placeholder-slate-400 focus:border-purple-600 shadow-sm'
                  : 'bg-[#131726] border-[#2E3552] text-white placeholder-slate-500 focus:border-[#06B6D4]'
              }`}
            />
            {inputText.trim().length > 0 && (
              <button
                type="button"
                onClick={handleAutoCorrect}
                title="Auto-Correct Query"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#06B6D4] hover:text-cyan-300 cursor-pointer"
              >
                <Wand2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Image Upload Icon placed right before Send Icon */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach Image"
            className={`p-3 rounded-2xl border transition-all cursor-pointer shrink-0 ${
              selectedImage
                ? 'bg-purple-600 text-white border-purple-400'
                : isLight
                ? 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700'
                : 'bg-[#131726] hover:bg-[#1E2338] border-[#2E3552] text-[#06B6D4] hover:border-[#06B6D4]'
            }`}
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Send Icon */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={isTyping}
            title="Send Message"
            className="shrink-0 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white font-extrabold text-xs sm:text-sm hover:brightness-110 flex items-center justify-center gap-1.5 shadow-lg cursor-pointer active:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
