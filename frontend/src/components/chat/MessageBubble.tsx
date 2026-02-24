import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../../types';
import { Copy, Check, Bot, User } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-1.5 max-w-[85%] lg:max-w-[75%] self-end">
        {/* Name + avatar row */}
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-display text-gaming-purple tracking-widest uppercase">
            Gamer
          </span>
          <div className="w-6 h-6 rounded-lg bg-gaming-purple/20 flex items-center justify-center border border-gaming-purple/30">
            <User className="w-3 h-3 text-gaming-purple" />
          </div>
        </div>

        {/* Bubble */}
        <div className="p-3 px-4 rounded-2xl rounded-tr-none border border-gaming-purple/30 bg-gaming-purple/[0.07] text-sm text-slate-200 shadow-[0_0_15px_rgba(99,102,241,0.08)]">
          {message.image_url && (
            <img
              src={
                message.image_url.startsWith('http')
                  ? message.image_url
                  : `${import.meta.env.VITE_API_URL || ''}${message.image_url}`
              }
              alt="Uploaded screenshot"
              className="rounded-lg mb-2 max-h-48 lg:max-h-64 object-contain"
            />
          )}
          <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1.5 max-w-[85%] lg:max-w-[75%] self-start">
      {/* Avatar + name row */}
      <div className="flex items-center gap-2 mb-0.5">
        <div className="w-6 h-6 rounded-lg bg-gaming-green/20 flex items-center justify-center border border-gaming-green/30">
          <Bot className="w-3 h-3 text-gaming-green" />
        </div>
        <span className="text-[10px] font-display text-gaming-green tracking-widest uppercase">
          Buddy AI
        </span>
      </div>

      {/* Bubble */}
      <div className="group p-4 rounded-2xl rounded-tl-none glass-card border-l-2 border-l-gaming-green/50 text-sm text-slate-300 leading-relaxed shadow-[0_0_15px_rgba(16,185,129,0.04)]">
        {message.image_url && (
          <img
            src={
              message.image_url.startsWith('http')
                ? message.image_url
                : `${import.meta.env.VITE_API_URL || ''}${message.image_url}`
            }
            alt="Uploaded screenshot"
            className="rounded-lg mb-2 max-h-48 lg:max-h-64 object-contain"
          />
        )}
        <div className="markdown-content">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-gaming-muted hover:text-gaming-blue"
          title="Copy message"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-gaming-green" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
