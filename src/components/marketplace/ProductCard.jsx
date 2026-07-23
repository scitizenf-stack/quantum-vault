import React from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const categoryColors = {
  'Precious Metals': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  'Telecom': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'Identity': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'Hosting': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  'Developer': 'bg-green-500/15 text-green-400 border-green-500/30',
  'Treasury': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'Yield': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  'AI/LLM': 'bg-pink-500/15 text-pink-400 border-pink-500/30',
  'Platform': 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
};

export default function ProductCard({ product, onAddToCart, inCart }) {
  return (
    <div className="rounded-xl bg-card border border-border hover:border-primary/40 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 flex flex-col group">
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="text-3xl">{product.icon || '📦'}</div>
          <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', categoryColors[product.category] || 'bg-muted text-muted-foreground border-border')}>
            {product.category}
          </span>
        </div>

        <div className="mb-1 flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground leading-tight">{product.name}</h3>
        </div>
        <p className="text-[10px] font-mono text-primary/70 mb-2 tracking-wider">{product.code}</p>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{product.description}</p>
      </div>

      <div className="px-5 pb-5 flex items-center justify-between">
        <div>
          <span className="text-base font-bold text-foreground font-mono">
            ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-muted-foreground ml-1">{product.price_unit}</span>
        </div>
        <Button
          size="sm"
          onClick={() => onAddToCart(product)}
          disabled={inCart}
          className={cn(
            'text-xs gap-1.5 transition-all',
            inCart ? 'bg-accent/20 text-accent border border-accent/40 hover:bg-accent/20' : ''
          )}
          variant={inCart ? 'outline' : 'default'}
        >
          {inCart ? <><Check className="w-3 h-3" /> Added</> : <><ShoppingCart className="w-3 h-3" /> Add to Cart</>}
        </Button>
      </div>
    </div>
  );
}