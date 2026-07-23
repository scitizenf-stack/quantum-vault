import React from 'react';
import { cn } from '@/lib/utils';
import { Plus, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function ConversationSidebar({ conversations, activeId, onSelect, onNew, onDelete }) {
  return (
    <div className="w-64 flex-shrink-0 flex flex-col bg-card/60 border-r border-border hidden md:flex">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Conversations</p>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onNew} title="New chat">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
        {conversations.map(conv => (
          <div
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              'group flex items-start gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all',
              activeId === conv.id
                ? 'bg-primary/10 text-foreground'
                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
            )}
          >
            <MessageSquare className={cn('w-3.5 h-3.5 flex-shrink-0 mt-0.5', activeId === conv.id ? 'text-primary' : '')} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate leading-tight">{conv.title}</p>
              <div className="flex items-center justify-between mt-0.5 gap-1">
                <p className="text-[10px] text-muted-foreground/60 truncate">
                  {conv.messages.length} msg{conv.messages.length !== 1 ? 's' : ''}
                </p>
                <p className="text-[9px] text-muted-foreground/50 flex-shrink-0">
                  {format(conv.createdAt, 'HH:mm')}
                </p>
              </div>
            </div>
            <button
              onClick={e => { e.stopPropagation(); onDelete(conv.id); }}
              className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-muted-foreground hover:text-destructive transition-all mt-0.5"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border">
        <Button variant="outline" size="sm" className="w-full gap-2 text-xs" onClick={onNew}>
          <Plus className="w-3.5 h-3.5" /> New Chat
        </Button>
      </div>
    </div>
  );
}