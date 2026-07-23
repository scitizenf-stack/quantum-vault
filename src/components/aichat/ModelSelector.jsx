import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Cpu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const MODELS = [
  { id: 'gpt_5_4',           label: 'GPT-4',           tag: 'OpenAI',    speed: 'Fast'   },
  { id: 'gpt_5_5',           label: 'GPT-4o',          tag: 'OpenAI',    speed: 'Fast'   },
  { id: 'gpt_5_mini',        label: 'GPT-4 Mini',      tag: 'OpenAI',    speed: 'Turbo'  },
  { id: 'claude_sonnet_4_6', label: 'Claude Sonnet',   tag: 'Anthropic', speed: 'Smart'  },
  { id: 'claude_opus_4_6',   label: 'Claude Opus',     tag: 'Anthropic', speed: 'Power'  },
  { id: 'gemini_3_flash',    label: 'Quantum-7B',      tag: 'Quantum',   speed: 'Turbo'  },
  { id: 'gemini_3_1_pro',    label: 'Quantum-7B Pro',  tag: 'Quantum',   speed: 'Power'  },
];

const SPEED_COLORS = {
  Fast:  'text-accent',
  Turbo: 'text-primary',
  Smart: 'text-purple-400',
  Power: 'text-yellow-400',
};

export default function ModelSelector({ model, onChange }) {
  const current = MODELS.find(m => m.id === model) || MODELS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 text-xs bg-secondary/60 border border-border rounded-lg px-3 py-1.5 hover:border-primary/40 transition-colors">
          <Cpu className="w-3 h-3 text-primary" />
          <span className="font-medium">{current.label}</span>
          <span className={cn('text-[9px] font-mono', SPEED_COLORS[current.speed])}>{current.speed}</span>
          <ChevronDown className="w-3 h-3 text-muted-foreground ml-0.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider">Select Model</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {MODELS.map(m => (
          <DropdownMenuItem
            key={m.id}
            onClick={() => onChange(m.id)}
            className="flex items-center justify-between gap-2 cursor-pointer"
          >
            <div>
              <p className={cn('text-xs font-medium', model === m.id && 'text-primary')}>{m.label}</p>
              <p className="text-[10px] text-muted-foreground">{m.tag}</p>
            </div>
            <span className={cn('text-[9px] font-mono', SPEED_COLORS[m.speed])}>{m.speed}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}