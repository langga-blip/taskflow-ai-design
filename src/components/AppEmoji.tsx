import React from 'react';
import {
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Hand,
  Pin,
  Rocket,
  Zap,
  Clock,
  Mail,
  DollarSign,
  Bot,
  Sparkles,
  Trophy,
  MessageSquare,
  ShieldAlert,
  Flame,
  Star,
  CheckCircle2,
} from 'lucide-react';

export type AppEmojiName =
  | '👋' | 'hand' | 'wave'
  | '🌅' | 'morning' | 'sunrise'
  | '☀️' | '🌤️' | 'afternoon' | 'sun'
  | '🌆' | 'evening' | 'sunset'
  | '🌙' | '🌌' | '😴' | 'night' | 'moon'
  | '📌' | 'pin'
  | '🚀' | 'rocket'
  | '⚡' | 'zap' | 'lightning'
  | '⏰' | 'clock' | 'alert'
  | '📧' | '✉️' | 'email' | 'mail'
  | '💰' | '💵' | 'money' | 'revenue'
  | '🤖' | 'bot' | 'ai'
  | '✨' | 'sparkles'
  | '🏆' | 'trophy'
  | '💬' | 'chat'
  | '🔥' | 'flame'
  | '⭐' | 'star';

interface AppEmojiProps {
  symbolOrName: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AppEmoji: React.FC<AppEmojiProps> = ({
  symbolOrName,
  className = '',
  size = 'md',
}) => {
  const norm = symbolOrName.trim();

  const sizeClasses = {
    sm: 'p-1 text-xs gap-1',
    md: 'p-1.5 text-sm gap-1.5',
    lg: 'p-2 text-base gap-2',
  }[size];

  const iconSize = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  // 1) 👋 Hand Wave
  if (norm === '👋' || norm === 'hand' || norm === 'wave') {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 shadow-[0_0_12px_rgba(124,58,237,0.3)] transition-transform hover:scale-110 ${sizeClasses} ${className}`}
        title="Greetings"
      >
        <Hand className={`${iconSize} animate-wave text-purple-400`} />
      </span>
    );
  }

  // 2) 🌅 Morning / Sunrise
  if (norm === '🌅' || norm === 'morning' || norm === 'sunrise') {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.4)] ${sizeClasses} ${className}`}
        title="Good Morning"
      >
        <Sunrise className={`${iconSize} text-amber-400`} />
      </span>
    );
  }

  // 3) ☀️ Afternoon / Sun
  if (norm === '☀️' || norm === '🌤️' || norm === 'afternoon' || norm === 'sun') {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-xl bg-amber-400/15 border border-amber-400/35 text-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.4)] ${sizeClasses} ${className}`}
        title="Good Afternoon"
      >
        <Sun className={`${iconSize} text-amber-300 animate-spin-slow`} />
      </span>
    );
  }

  // 4) 🌆 Evening / Sunset
  if (norm === '🌆' || norm === 'evening' || norm === 'sunset') {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-xl bg-orange-500/15 border border-orange-500/35 text-orange-400 shadow-[0_0_14px_rgba(249,115,22,0.4)] ${sizeClasses} ${className}`}
        title="Good Evening"
      >
        <Sunset className={`${iconSize} text-orange-400`} />
      </span>
    );
  }

  // 5) 🌙 Night / Moon
  if (norm === '🌙' || norm === '🌌' || norm === '😴' || norm === 'night' || norm === 'moon') {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/35 text-cyan-300 shadow-[0_0_14px_rgba(6,182,212,0.4)] ${sizeClasses} ${className}`}
        title="Good Night"
      >
        <Moon className={`${iconSize} text-cyan-300`} />
      </span>
    );
  }

  // 6) 📌 Pin
  if (norm === '📌' || norm === 'pin') {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 ${sizeClasses} ${className}`}
      >
        <Pin className={`${iconSize} text-cyan-400`} />
      </span>
    );
  }

  // 7) 🚀 Rocket
  if (norm === '🚀' || norm === 'rocket') {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 ${sizeClasses} ${className}`}
      >
        <Rocket className={`${iconSize} text-purple-400`} />
      </span>
    );
  }

  // 8) ⚡ Lightning / Zap
  if (norm === '⚡' || norm === 'zap' || norm === 'lightning') {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 ${sizeClasses} ${className}`}
      >
        <Zap className={`${iconSize} text-amber-400`} />
      </span>
    );
  }

  // 9) ⏰ Clock
  if (norm === '⏰' || norm === 'clock') {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 ${sizeClasses} ${className}`}
      >
        <Clock className={`${iconSize} text-red-400`} />
      </span>
    );
  }

  // 10) 📧 Email
  if (norm === '📧' || norm === '✉️' || norm === 'email' || norm === 'mail') {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 ${sizeClasses} ${className}`}
      >
        <Mail className={`${iconSize} text-cyan-400`} />
      </span>
    );
  }

  // 11) 💰 Money
  if (norm === '💰' || norm === '💵' || norm === 'money' || norm === 'revenue') {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 ${sizeClasses} ${className}`}
      >
        <DollarSign className={`${iconSize} text-emerald-400`} />
      </span>
    );
  }

  // 12) 🤖 Bot
  if (norm === '🤖' || norm === 'bot' || norm === 'ai') {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 ${sizeClasses} ${className}`}
      >
        <Bot className={`${iconSize} text-purple-400`} />
      </span>
    );
  }

  // 13) ✨ Sparkles
  if (norm === '✨' || norm === 'sparkles') {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 ${sizeClasses} ${className}`}
      >
        <Sparkles className={`${iconSize} text-cyan-400`} />
      </span>
    );
  }

  // 14) 🏆 Trophy
  if (norm === '🏆' || norm === 'trophy') {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 ${sizeClasses} ${className}`}
      >
        <Trophy className={`${iconSize} text-amber-400`} />
      </span>
    );
  }

  // 15) 💬 Chat
  if (norm === '💬' || norm === 'chat') {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 ${sizeClasses} ${className}`}
      >
        <MessageSquare className={`${iconSize} text-purple-400`} />
      </span>
    );
  }

  // Default fallback badge for any other emoji symbol
  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold px-1.5 py-0.5 text-xs ${className}`}
    >
      {symbolOrName}
    </span>
  );
};

/**
 * Custom Rich Text Renderer that replaces emojis with TaskFlow AI theme badges
 */
export const FormattedTextWithAppEmojis: React.FC<{ text: string; className?: string }> = ({
  text,
  className = '',
}) => {
  // Regex matching common emojis
  const emojiRegex = /(👋|🌅|☀️|🌤️|🌆|🌙|🌌|😴|📌|🚀|⚡|⏰|📧|✉️|💰|💵|🤖|✨|🏆|💬|🔥|⭐)/g;

  if (!emojiRegex.test(text)) {
    return <span className={className}>{text}</span>;
  }

  const parts = text.split(emojiRegex);

  return (
    <span className={`inline-wrap items-center gap-1.5 ${className}`}>
      {parts.map((part, idx) => {
        if (emojiRegex.test(part)) {
          return <AppEmoji key={idx} symbolOrName={part} size="sm" />;
        }
        return <span key={idx} className="whitespace-pre-wrap">{part}</span>;
      })}
    </span>
  );
};
