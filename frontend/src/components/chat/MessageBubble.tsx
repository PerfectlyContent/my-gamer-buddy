import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../../types';
import { Gamepad2, Bot, Copy, Check } from 'lucide-react';

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

  return (
    <div className={`group flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
          isUser
            ? 'bg-gradient-to-br from-gaming-blue to-gaming-purple ring-1 ring-gaming-blue/30'
            : 'bg-gradient-to-br from-gaming-green/80 to-gaming-blue/80 ring-1 ring-gaming-green/30'
        }`}
      >
        {isUser ? (
          <Gamepad2 className="w-3.5 h-3.5 text-white" />
        ) : (
          <Bot className="w-3.5 h-3.5 text-white" />
        )}
      </div>

      {/* Message content */}
      <div
        className={`max-w-[85%] lg:max-w-[75%] rounded-2xl px-3 py-2.5 ${
          isUser
            ? 'bg-gaming-blue/[0.12] backdrop-blur-sm border border-gaming-blue/25 shadow-[0_0_10px_rgba(0,212,255,0.05)]'
            : 'glass-card'
        }`}
      >
        {message.image_url && (
          <img
            src={message.image_url.startsWith('http') ? message.image_url : `${import.meta.env.VITE_API_URL || ''}${message.image_url}`}
            alt="Uploaded screenshot"
            className="rounded-lg mb-2 max-h-48 lg:max-h-64 object-contain"
          />
        )}
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="markdown-content text-sm">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
        {/* Copy button for AI messages */}
        {!isUser && (
          <button
            onClick={handleCopy}
            className="mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-gaming-muted hover:text-gaming-blue"
            title="Copy message"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-gaming-green" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
