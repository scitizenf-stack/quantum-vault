import React, { useState, useRef, useEffect } from 'react';
import { meshApi } from '@/lib/meshClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

const SUGGESTIONS = [
  'What are the top signals right now?',
  'Summarize today\'s portfolio risk',
  'Any anomalies detected in the last hour?',
  'What\'s the AI forecast for BTC?',
];

export default function AiChatPanel() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello. I\'m your Omega Mesh AI advisor. Ask me about market signals, risk analysis, portfolio insights, or anomaly detection.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    const reply = await meshApi.aiChat(msg);
    setMessages(prev => [...prev, { role: 'assistant', content: reply.message || reply.response || String(reply) }]);
    setLoading(false);
  };

  return (
    <div className="rounded-xl bg-card border border-border flex flex-col h-full min-h-[400px]">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2 flex-shrink-0">
        <Bot className="w-4 h-4 text-primary" />
        <h3 className="text-xs font-semibold">Omega AI Advisor</h3>
        <span className="ml-auto text-[10px] text-emerald-400 font-medium">● Online</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={cn('flex gap-2', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            {m.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
            )}
            <div className={cn(
              'max-w-[85%] rounded-xl px-3 py-2 text-xs',
              m.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/50 text-foreground'
            )}>
              {m.role === 'assistant'
                ? <ReactMarkdown className="prose prose-xs prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{m.content}</ReactMarkdown>
                : m.content
              }
            </div>
            {m.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="bg-secondary/50 rounded-xl px-3 py-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div className="px-4 pb-2 flex gap-1.5 flex-wrap border-t border-border pt-2">
        {SUGGESTIONS.map((s, i) => (
          <button key={i} onClick={() => send(s)}
            className="text-[10px] px-2 py-1 rounded-full bg-secondary/50 text-muted-foreground border border-border hover:text-foreground hover:border-primary/40 transition-all">
            {s}
          </button>
        ))}
      </div>

      <div className="px-4 pb-4 pt-2 flex gap-2 flex-shrink-0">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask the AI advisor..."
          className="text-xs"
        />
        <Button size="icon" onClick={() => send()} disabled={!input.trim() || loading}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}