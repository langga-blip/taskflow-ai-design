import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';
import { FormattedTextWithAppEmojis, AppEmoji } from '../components/AppEmoji';
import { Bot, Sparkles, Send, User, Copy, Check, Cpu, Trash2, Mail, Calendar, HardDrive, Reply, SendHorizontal, AlertCircle, CheckCircle2, Wand2, Volume2, Image as ImageIcon, X, Eye, ChevronDown, Plus, Play, Square, Mic, MicOff, Radio, Zap } from 'lucide-react';
import { speakWithGeminiVoice, speakWithTaskFlowAiVoice, stopAllSpeech } from '../utils/speechUtils';
import { GeminiLiveSessionController, GeminiLiveState } from '../utils/geminiLiveAudio';
import { autoCorrectText } from '../utils/autoCorrect';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  imageUrl?: string;
  imageUrls?: string[];
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
        text: `Hello ${userProfile.userName || 'Executive'}! 👋 I am your Task Flow AI Assistant.\n\nI can chat with you, reply to any inquiry, analyze multiple images, and optimize your business operations.\n\n• **Multi-Image Vision**: Attach multiple images, charts, documents, or photos for instant visual analysis.\n• **Executive Strategy & Workflows**: Customized insights tailored for **${userProfile.businessName}** and your **${userProfile.currencySymbol}${(userProfile.monthlyRevenueGoal !== undefined ? userProfile.monthlyRevenueGoal : 0).toLocaleString()}** revenue goal.`,
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
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Gemini Live Two-Way Voice State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [liveState, setLiveState] = useState<GeminiLiveState>('idle');
  const [liveUserTranscript, setLiveUserTranscript] = useState('');
  const [liveModelTranscript, setLiveModelTranscript] = useState('');
  const [inputVolume, setInputVolume] = useState(0);
  const [outputVolume, setOutputVolume] = useState(0);
  const liveSessionRef = useRef<GeminiLiveSessionController | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup Live Voice on component unmount
  useEffect(() => {
    return () => {
      if (liveSessionRef.current) {
        liveSessionRef.current.stop();
      }
    };
  }, []);

  // Toggle Gemini Live Two-Way Voice Session (Natural Female Voice - Aoede)
  const toggleGeminiLive = async () => {
    if (isLiveActive) {
      if (liveSessionRef.current) {
        liveSessionRef.current.stop();
        liveSessionRef.current = null;
      }
      setIsLiveActive(false);
      setLiveState('idle');
      setLiveUserTranscript('');
      setLiveModelTranscript('');
      setInputVolume(0);
      setOutputVolume(0);
      triggerNotification('Gemini Live Voice Ended 🎙️', 'Two-way voice session concluded.', 'AI');
      return;
    }

    stopAllSpeech();
    setIsLiveActive(true);
    setLiveState('connecting');
    setLiveUserTranscript('');
    setLiveModelTranscript('');

    const session = new GeminiLiveSessionController({
      onStateChange: (newState) => {
        setLiveState(newState);
        if (newState === 'closed' || newState === 'error') {
          setIsLiveActive(false);
        }
      },
      onUserTranscript: (accumulated) => {
        setLiveUserTranscript(accumulated);
      },
      onModelTranscript: (accumulated) => {
        setLiveModelTranscript(accumulated);
      },
      onTurnComplete: (userText, modelText) => {
        if (userText || modelText) {
          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const newEntries: ChatMessage[] = [];
          if (userText) {
            newEntries.push({
              id: Date.now().toString(),
              sender: 'user',
              text: userText,
              timestamp,
            });
          }
          if (modelText) {
            newEntries.push({
              id: (Date.now() + 1).toString(),
              sender: 'assistant',
              text: modelText,
              timestamp,
            });
          }
          setMessages((prev) => [...prev, ...newEntries]);
          setLiveUserTranscript('');
          setLiveModelTranscript('');
        }
      },
      onInputVolume: (vol) => {
        setInputVolume(vol);
      },
      onOutputVolume: (vol) => {
        setOutputVolume(vol);
      },
      onError: (errMsg) => {
        triggerNotification('Gemini Live Voice Notice', errMsg, 'AI');
        setIsLiveActive(false);
      },
    });

    liveSessionRef.current = session;
    const success = await session.start();
    if (!success) {
      setIsLiveActive(false);
      liveSessionRef.current = null;
    } else {
      triggerNotification('Gemini Live Voice Active 🎙️', 'Connected with Natural Female Voice (Kore). Speak freely!', 'AI');
    }
  };

  // User Interruption Trigger
  const handleInterruptLive = () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.interrupt();
      setLiveModelTranscript('');
    }
  };

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

  // Handle multiple image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    let loadedCount = 0;
    const newImages: string[] = [];

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const img = new Image();
        img.onload = () => {
          const maxDim = 2048;
          if (img.width > maxDim || img.height > maxDim) {
            let width = img.width;
            let height = img.height;
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, width, height);
              newImages.push(canvas.toDataURL('image/jpeg', 0.92));
            } else {
              newImages.push(result);
            }
          } else {
            newImages.push(result);
          }

          loadedCount++;
          if (loadedCount === fileArray.length) {
            setSelectedImages((prev) => [...prev, ...newImages]);
            triggerNotification(
              'Images Attached 🖼️',
              `${newImages.length} image${newImages.length > 1 ? 's' : ''} added. AI is ready to inspect!`,
              'SYSTEM'
            );
          }
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    });

    // Reset input value so user can re-select if needed
    e.target.value = '';
  };

  const removeSelectedImage = (indexToRemove: number) => {
    setSelectedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Speak AI reply in Task Flow AI voice
  const handleSpeakText = (msgId: string, text: string) => {
    if (speakingMessageId === msgId) {
      stopAllSpeech();
      setSpeakingMessageId(null);
      return;
    }

    stopAllSpeech();
    setSpeakingMessageId(msgId);
    speakWithTaskFlowAiVoice(text, {
      onEnd: () => setSpeakingMessageId(null),
    });
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

  const handleSendMessage = async (customText?: string, fromVoice = false) => {
    const rawText = (customText || inputText).trim();
    if ((!rawText && selectedImages.length === 0) || isTyping) return;

    const textToSend = autoCorrectText(
      rawText || (selectedImages.length > 0 ? `Analysis Request for ${selectedImages.length} attached image${selectedImages.length > 1 ? 's' : ''}` : '')
    );
    const attachedImgs = [...selectedImages];

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      imageUrl: attachedImgs[0] || undefined,
      imageUrls: attachedImgs.length > 0 ? attachedImgs : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setSelectedImages([]);
    setIsTyping(true);

    try {
      const promptWithImgContext = attachedImgs.length > 0
        ? (textToSend && !textToSend.startsWith('Analysis Request')
            ? textToSend
            : `Please thoroughly analyze and inspect all ${attachedImgs.length} attached images in detail. Transcribe all text, numbers, layout structures, diagrams, patterns, and provide an executive strategic breakdown.`)
        : textToSend;

      const aiReply = await askAssistant(promptWithImgContext, attachedImgs.length > 0 ? attachedImgs : undefined);

      const assistantMsgId = (Date.now() + 1).toString();
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        sender: 'assistant',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Automatically speak the reply in Task Flow AI voice if requested
      if (fromVoice) {
        setSpeakingMessageId(assistantMsgId);
        speakWithTaskFlowAiVoice(aiReply, {
          onEnd: () => setSpeakingMessageId(null),
        });
      }
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

            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider hidden sm:inline ${
                isLight ? 'text-purple-900' : 'text-slate-400'
              }`}>
                AI Engine:
              </span>
              <div className="relative inline-flex items-center">
                <Cpu className={`w-3.5 h-3.5 absolute left-2.5 pointer-events-none ${isLight ? 'text-purple-600' : 'text-[#A78BFA]'}`} />
                <select
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value as any)}
                  className={`appearance-none border rounded-xl pl-8 pr-7 py-1.5 text-xs font-bold focus:outline-none cursor-pointer shadow-sm transition-all ${
                    isLight
                      ? 'bg-white border-purple-300 text-purple-900 focus:border-purple-500'
                      : 'bg-[#0A0C14] border-[#2E3552] text-[#06B6D4] focus:border-[#06B6D4]'
                  }`}
                >
                  <option value="GEMINI">Gemini 3.7 Flash (Default)</option>
                  <option value="OPENAI">OpenAI GPT-4o (Active)</option>
                  <option value="DEEPSEEK">DeepSeek R1 (Active)</option>
                </select>
                <ChevronDown className={`w-3.5 h-3.5 absolute right-2 pointer-events-none ${isLight ? 'text-purple-700' : 'text-slate-400'}`} />
              </div>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
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
                  <div className="space-y-2.5">
                    {/* Multiple Image Display on Top of Message */}
                    {m.imageUrls && m.imageUrls.length > 0 ? (
                      <div className={`grid gap-2 ${m.imageUrls.length === 1 ? 'grid-cols-1' : m.imageUrls.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
                        {m.imageUrls.map((imgUrl, imgIdx) => (
                          <div key={imgIdx} className="rounded-xl overflow-hidden border border-white/25 bg-black/20 shadow-md group relative">
                            <img
                              src={imgUrl}
                              alt={`Attached asset ${imgIdx + 1}`}
                              onClick={() => setPreviewModalImage(imgUrl)}
                              className="w-full h-28 sm:h-36 object-cover cursor-zoom-in transition-transform duration-200 group-hover:scale-[1.02]"
                            />
                            <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] text-white flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              <Eye className="w-2.5 h-2.5" /> Zoom
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : m.imageUrl ? (
                      <div className="rounded-xl overflow-hidden border border-white/25 bg-black/20 shadow-md group relative">
                        <img
                          src={m.imageUrl}
                          alt="Attached input"
                          onClick={() => setPreviewModalImage(m.imageUrl || null)}
                          className="w-full h-auto object-cover max-h-56 cursor-zoom-in transition-transform duration-200 group-hover:scale-[1.02]"
                        />
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] text-white/90 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <Eye className="w-3 h-3" /> Tap to zoom
                        </div>
                      </div>
                    ) : null}
                    {m.text && (
                      <p className="whitespace-pre-line leading-relaxed font-medium">{m.text}</p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-purple-100/20 text-[10px] text-slate-400">
                  <span>{m.timestamp}</span>

                  {m.sender === 'assistant' && (
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleSpeakText(m.id, m.text)}
                        className={`flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                          speakingMessageId === m.id
                            ? 'text-pink-400 animate-pulse'
                            : isLight
                            ? 'text-purple-600 hover:text-purple-900'
                            : 'text-[#06B6D4] hover:text-cyan-300'
                        }`}
                        title={speakingMessageId === m.id ? 'Stop Speech' : 'Listen in Gemini Voice'}
                      >
                        {speakingMessageId === m.id ? (
                          <>
                            <Square className="w-3 h-3 fill-pink-400" /> Stop Voice
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" /> Speak (Gemini)
                          </>
                        )}
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
            <div className="flex items-start gap-2.5 max-w-[85%] animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#06B6D4] flex items-center justify-center text-white flex-shrink-0 shadow-[0_0_14px_rgba(124,58,237,0.5)]">
                <Bot className="w-4 h-4" />
              </div>
              <div
                className={`p-3.5 rounded-2xl rounded-tl-sm border shadow-md space-y-1.5 ${
                  isLight
                    ? 'bg-purple-50/95 border-purple-200 text-purple-950 shadow-purple-100/50'
                    : 'bg-[#131726]/95 border-[#2E3552] text-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-1 py-1">
                    <span className="w-2 h-2 rounded-full bg-[#06B6D4] ai-typing-dot-1" />
                    <span className="w-2 h-2 rounded-full bg-[#7C3AED] ai-typing-dot-2" />
                    <span className="w-2 h-2 rounded-full bg-[#06B6D4] ai-typing-dot-3" />
                  </div>
                  <span className={`text-[11px] font-semibold tracking-wide ${isLight ? 'text-purple-800' : 'text-cyan-300'}`}>
                    AI is thinking...
                  </span>
                </div>
              </div>
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

      {/* Gemini Live Two-Way Voice HUD Banner */}
      {isLiveActive && (
        <div
          className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-2.5 shadow-xl animate-fade-in ${
            isLight
              ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300 text-slate-800 shadow-purple-200/50'
              : 'bg-gradient-to-r from-[#1E1338]/95 via-[#131726]/95 to-[#0F2236]/95 border-purple-500/40 text-white shadow-[0_0_25px_rgba(124,58,237,0.25)]'
          }`}
        >
          {/* Header with state badges */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
              </span>
              <span className="text-xs font-extrabold tracking-wide uppercase bg-gradient-to-r from-pink-400 to-cyan-300 bg-clip-text text-transparent flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                Gemini Live Voice (Female • Kore)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Interruption Button */}
              {liveState === 'speaking' && (
                <button
                  type="button"
                  onClick={handleInterruptLive}
                  className="px-2.5 py-1 rounded-xl bg-pink-600/20 border border-pink-500/50 text-pink-300 hover:bg-pink-600/40 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Interrupt Gemini's response"
                >
                  <Zap className="w-3 h-3 text-pink-400" />
                  Interrupt
                </button>
              )}

              {/* Status Pill */}
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  liveState === 'speaking'
                    ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 animate-pulse'
                    : liveState === 'listening'
                    ? 'bg-pink-500/20 border-pink-400/50 text-pink-300 animate-pulse'
                    : liveState === 'connecting'
                    ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                    : liveState === 'interrupted'
                    ? 'bg-orange-500/20 border-orange-400/50 text-orange-300'
                    : 'bg-slate-500/20 border-slate-400/50 text-slate-300'
                }`}
              >
                {liveState === 'speaking'
                  ? 'Gemini Speaking'
                  : liveState === 'listening'
                  ? 'Listening to You...'
                  : liveState === 'connecting'
                  ? 'Connecting...'
                  : liveState === 'interrupted'
                  ? 'Interrupted'
                  : 'Ready'}
              </span>

              {/* End Voice Call */}
              <button
                type="button"
                onClick={toggleGeminiLive}
                className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="End Gemini Live Voice Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dynamic Audio Equalizer Waveform */}
          <div className="flex items-center justify-center gap-1.5 py-1">
            {[40, 70, 100, 60, 90, 45, 80, 55, 95, 65, 85, 50, 75, 40].map((baseHeight, i) => {
              const activeVolume = liveState === 'speaking' ? outputVolume : liveState === 'listening' ? inputVolume : 10;
              const scaledHeight = Math.max(6, Math.min(32, Math.round((baseHeight * (activeVolume + 15)) / 100)));
              const isCyan = i % 2 === 0;
              return (
                <div
                  key={i}
                  style={{ height: `${scaledHeight}px` }}
                  className={`w-1 rounded-full transition-all duration-75 ${
                    liveState === 'speaking'
                      ? isCyan
                        ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                        : 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]'
                      : liveState === 'listening'
                      ? 'bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.6)]'
                      : 'bg-slate-600'
                  }`}
                />
              );
            })}
          </div>

          {/* Live transcripts display */}
          {(liveUserTranscript || liveModelTranscript) && (
            <div className="flex flex-col gap-1 text-xs max-h-24 overflow-y-auto px-2 py-1 rounded-xl bg-black/20 border border-white/5">
              {liveUserTranscript && (
                <div className="text-slate-300">
                  <span className="font-bold text-pink-400">You:</span> {liveUserTranscript}
                </div>
              )}
              {liveModelTranscript && (
                <div className="text-slate-200">
                  <span className="font-bold text-cyan-400">Gemini:</span> {liveModelTranscript}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Message Input Box with Multi-Image Upload & Gemini Live Microphone */}
      <div className="flex flex-col gap-1.5 flex-shrink-0 w-full min-w-0">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageSelect}
        />

        {/* Selected Images Strip */}
        {selectedImages.length > 0 && (
          <div className="flex items-center gap-2 p-2 bg-[#131726]/90 border border-purple-500/40 rounded-xl overflow-x-auto scrollbar-none">
            <span className="text-[11px] text-purple-300 font-bold whitespace-nowrap pl-1">
              {selectedImages.length} Image{selectedImages.length > 1 ? 's' : ''} Attached:
            </span>
            <div className="flex items-center gap-2">
              {selectedImages.map((img, idx) => (
                <div key={idx} className="relative group shrink-0">
                  <img
                    src={img}
                    alt={`Selected attachment ${idx + 1}`}
                    onClick={() => setPreviewModalImage(img)}
                    className="w-10 h-10 object-cover rounded-lg border border-purple-400/50 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => removeSelectedImage(idx)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] hover:bg-red-500 shadow cursor-pointer"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2 py-1 rounded-lg border border-dashed border-purple-400/60 text-purple-300 text-[11px] font-semibold hover:bg-purple-500/20 whitespace-nowrap flex items-center gap-1 cursor-pointer ml-1"
            >
              <Plus className="w-3 h-3" /> Add More
            </button>
            <button
              type="button"
              onClick={() => setSelectedImages([])}
              className="p-1 text-slate-400 hover:text-red-400 cursor-pointer text-xs ml-auto"
              title="Clear all attached images"
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
              placeholder="Ask AI anything, brainstorm, draft, or upload images..."
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

          {/* Gemini Live Microphone Button */}
          <button
            type="button"
            onClick={toggleGeminiLive}
            title={isLiveActive ? 'End Gemini Live Voice' : 'Gemini Live Voice Chat (Natural Female Voice)'}
            className={`relative p-3 rounded-2xl border transition-all cursor-pointer shrink-0 ${
              isLiveActive
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.5)] animate-pulse'
                : isLight
                ? 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700'
                : 'bg-[#131726] hover:bg-[#1E2338] border-[#2E3552] text-pink-400 hover:border-pink-400 hover:text-pink-300'
            }`}
          >
            {isLiveActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Multiple Image Upload Icon */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach Multiple Images"
            className={`relative p-3 rounded-2xl border transition-all cursor-pointer shrink-0 ${
              selectedImages.length > 0
                ? 'bg-purple-600 text-white border-purple-400'
                : isLight
                ? 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700'
                : 'bg-[#131726] hover:bg-[#1E2338] border-[#2E3552] text-[#06B6D4] hover:border-[#06B6D4]'
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            {selectedImages.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center shadow">
                {selectedImages.length}
              </span>
            )}
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

      {/* Full-Detail Image Inspection Lightbox Modal */}
      {previewModalImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewModalImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-[#131726] border border-purple-500/40 rounded-2xl overflow-hidden shadow-2xl p-2 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between px-3 py-2 border-b border-purple-500/20 text-xs text-purple-300 font-semibold">
              <span>Full Resolution Image Inspector</span>
              <button
                type="button"
                onClick={() => setPreviewModalImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-auto max-h-[75vh] w-full flex items-center justify-center p-2">
              <img
                src={previewModalImage}
                alt="Enlarged inspection"
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              />
            </div>
            <div className="w-full text-center py-2 text-[11px] text-slate-400 border-t border-purple-500/10">
              AI Vision Engine is analyzing every detail, line, text, and structure of this asset.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
