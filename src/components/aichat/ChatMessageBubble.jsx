import React from 'react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { User, Bot } from 'lucide-react';

const MODEL_LABELS = {
  gpt_5_4:          'GPT-4',
  gpt_5_5:          'GPT-4o',
  claude_sonnet_4_6: 'Claude Sonnet',
  claude_opus_4_6:   'Claude Opus',
  gpt_5_mini:        'GPT-4 Mini',
  gemini_3_flash:    'Quantum-7B',
  gemini_3_1_pro:    'Quantum-7B Pro',
};

export default function ChatMessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3 items-start', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
        isUser ? 'bg-primary/20' : 'bg-secondary'
      )}>
        {isUser
          ? <User className="w-4 h-4 text-primary" />
          : <Bot className="w-4 h-4 text-muted-foreground" />
        }
      </div>

      <div className={cn('max-w-[80%] space-y-1', isUser && 'items-end flex flex-col')}>
        {/* Bubble */}
        <div className={cn(
          'rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-sm'
            : 'bg-card border border-border rounded-tl-sm'
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown
              className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              components={{
                code: ({ inline, children, ...props }) =>
                  inline ? (
                    <code className="px-1 py-0.5 rounded bg-secondary text-primary text-xs font-mono" {...props}>{children}</code>
                  ) : (
                    <pre className="bg-background rounded-lg p-3 overflow-x-auto my-2 border border-border">
                      <code className="text-xs font-mono text-foreground">{children}</code>
                    </pre>
                  ),
                p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="my-1 ml-4 list-disc space-y-0.5">{children}</ul>,
                ol: ({ children }) => <ol className="my-1 ml-4 list-decimal space-y-0.5">{children}</ol>,
                li: ({ children }) => <li className="text-sm">{children}</li>,
                h1: ({ children }) => <h1 className="text-base font-bold my-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-sm font-bold my-1.5">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-semibold my-1">{children}</h3>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-primary/40 pl-3 my-2 text-muted-foreground italic">{children}</blockquote>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Meta */}
        <div className={cn('flex items-center gap-2 px-1', isUser && 'flex-row-reverse')}>
          {!isUser && message.model && (
            <span className="text-[9px] font-mono text-primary/60 bg-primary/5 px-1.5 py-0.5 rounded">
              {MODEL_LABELS[message.model] || message.model}
            </span>
          )}
          <span className="text-[9px] text-muted-foreground/50 font-mono">
            {message.ts ? format(new Date(message.ts), 'HH:mm') : ''}
          </span>
        </div>
      </div>
    </div>
  );
}