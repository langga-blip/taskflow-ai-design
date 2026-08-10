import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';
import { Bot, Sparkles, Send, User, RefreshCw, Copy, Check, Zap, Cpu } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiAssistantScreen: React.FC = () => {
  const { userProfile, aiProvider, setAiProvider, tasks, formatRevenue, askAssistant } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: `Hello ${userProfile.userName}! 👋 I am your 24/7 Executive AI Business Assistant. How can I assist you with scaling **${userProfile.businessName}** today? I can draft high-converting proposals, optimize your $${userProfile.monthlyRevenueGoal?.toLocaleString()} monthly revenue goal, or audit your workflow processes.`,
      timestamp: 'Just now',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const quickPrompts = [
    'Draft cold email pitch for a $3,000/mo retainer client',
    'How do I scale my agency revenue from $3.5k to $10k/mo?',
    'Create a 5-step automated onboarding workflow for new clients',
    'Audit my current active tasks & suggest top priorities',
  ];

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const aiReply = await askAssistant(textToSend);

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
        text: 'I encountered an issue processing your request. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-4 pb-24 max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] animate-fade-in">
      {/* Header Banner */}
      <GlassCard className="border-[#06B6D4]/40 bg-gradient-to-r from-[#131726] via-[#1E2338] to-[#131726] p-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#06B6D4]/20 border border-[#06B6D4]/40 rounded-xl text-[#06B6D4] shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-white">24/7 AI Business Executive Assistant</h1>
              <p className="text-xs text-slate-400">
                Contextual AI advisor tuned to {userProfile.businessName}
              </p>
            </div>
          </div>

          {/* AI Model Selector */}
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#A78BFA]" />
            <select
              value={aiProvider}
              onChange={(e) => setAiProvider(e.target.value as any)}
              className="bg-[#0A0C14] border border-[#2E3552] rounded-xl px-3 py-1.5 text-xs text-[#06B6D4] font-bold focus:outline-none focus:border-[#06B6D4] cursor-pointer"
            >
              <option value="GEMINI">Gemini 3.5 Flash (Default)</option>
              <option value="OPENAI">OpenAI GPT-4o</option>
              <option value="DEEPSEEK">DeepSeek R1</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Chat Messages Container */}
      <GlassCard className="flex-1 overflow-y-auto space-y-4 p-4 border-[#2E3552] bg-[#0A0C14]/80 flex flex-col">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${
              m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white'
                  : 'bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/40'
              }`}
            >
              {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-[#7C3AED] text-white rounded-tr-none'
                  : 'bg-[#131726] text-slate-200 border border-[#2E3552] rounded-tl-none space-y-2'
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>
              <div className="text-[10px] text-slate-400 text-right opacity-70 mt-1">
                {m.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-[#06B6D4] p-3 bg-[#131726] border border-[#2E3552] rounded-xl w-fit animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin" /> Gemini is strategizing your answer...
          </div>
        )}

        <div ref={messagesEndRef} />
      </GlassCard>

      {/* Quick Prompt Shortcuts */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs flex-shrink-0">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            className="px-3 py-1.5 rounded-xl bg-[#131726] hover:bg-[#1E2338] border border-[#2E3552] hover:border-[#06B6D4] text-slate-300 whitespace-nowrap transition-colors cursor-pointer text-xs"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask AI anything about your business, proposals, or tasks..."
          className="flex-1 bg-[#131726] border border-[#2E3552] rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#06B6D4]"
        />
        <NeonButton onClick={() => handleSendMessage()} disabled={isTyping} size="md">
          <Send className="w-4 h-4" />
        </NeonButton>
      </div>
    </div>
  );
};
