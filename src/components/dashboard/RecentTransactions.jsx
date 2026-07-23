import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const statusIcons = {
  completed: CheckCircle2,
  pending: Clock,
  failed: XCircle,
};

const typeConfig = {
  buy: { icon: ArrowDownLeft, color: 'text-accent', bg: 'bg-accent/10', label: 'Buy' },
  sell: { icon: ArrowUpRight, color: 'text-chart-5', bg: 'bg-chart-5/10', label: 'Sell' },
  transfer_in: { icon: ArrowDownLeft, color: 'text-primary', bg: 'bg-primary/10', label: 'Transfer In' },
  transfer_out: { icon: ArrowUpRight, color: 'text-chart-4', bg: 'bg-chart-4/10', label: 'Transfer Out' },
  dividend: { icon: ArrowDownLeft, color: 'text-accent', bg: 'bg-accent/10', label: 'Dividend' },
  interest: { icon: ArrowDownLeft, color: 'text-accent', bg: 'bg-accent/10', label: 'Interest' },
};

export default function RecentTransactions({ transactions = [], limit = 5 }) {
  const display = transactions.slice(0, limit);

  return (
    <div className="rounded-xl bg-card border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
        <Link to="/transactions" className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
          View all
        </Link>
      </div>
      
      {display.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No transactions yet</p>
      ) : (
        <div className="space-y-3">
          {display.map((tx) => {
            const config = typeConfig[tx.type] || typeConfig.buy;
            const TypeIcon = config.icon;
            const StatusIcon = statusIcons[tx.status] || Clock;

            return (
              <div key={tx.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className={cn("p-2 rounded-lg", config.bg)}>
                  <TypeIcon className={cn("w-4 h-4", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tx.asset_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {config.label} · {tx.created_date ? format(new Date(tx.created_date), 'MMM d, h:mm a') : '—'}
                  </p>
                </div>
                <div className="text-right">
                  <p className={cn("text-sm font-semibold font-mono",
                    ['buy', 'transfer_out'].includes(tx.type) ? "text-destructive" : "text-accent"
                  )}>
                    {['buy', 'transfer_out'].includes(tx.type) ? '-' : '+'}${tx.total_amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <StatusIcon className={cn("w-3 h-3 ml-auto mt-0.5",
                    tx.status === 'completed' ? "text-accent" : tx.status === 'failed' ? "text-destructive" : "text-chart-4"
                  )} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}