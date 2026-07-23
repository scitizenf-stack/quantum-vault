import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Webhook, Plus } from 'lucide-react';

export default function Webhooks() {
  const qc = useQueryClient();
  const [newUrl, setNewUrl] = useState('');
  const [adding, setAdding] = useState(false);

  const { data: hooks = [], isLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: () => base44.entities.Webhook.list(),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, active }) => base44.entities.Webhook.update(id, { active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['webhooks'] }),
  });

  const createMut = useMutation({
    mutationFn: (url) => base44.entities.Webhook.create({ url, active: true, events: [] }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['webhooks'] }); setNewUrl(''); setAdding(false); },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Webhooks</h1>
          <p className="text-xs text-muted-foreground mt-1">{hooks.filter(h => h.active).length} active endpoints</p>
        </div>
        {adding ? (
          <div className="flex gap-2">
            <input
              className="text-xs bg-input border border-border rounded-lg px-3 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-64"
              placeholder="https://your-endpoint.com/hook"
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && newUrl.trim() && createMut.mutate(newUrl.trim())}
            />
            <Button size="sm" onClick={() => newUrl.trim() && createMut.mutate(newUrl.trim())}>Add</Button>
            <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        ) : (
          <Button size="sm" onClick={() => setAdding(true)}><Plus className="w-3.5 h-3.5 mr-1" /> Add Webhook</Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : hooks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted-foreground/30 p-10 flex flex-col items-center gap-3 text-center">
          <Webhook className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm font-medium">No webhooks configured</p>
          <p className="text-xs text-muted-foreground">Add an endpoint URL to start receiving event notifications.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {hooks.map((h) => (
            <div key={h.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <code className="text-xs font-mono text-primary break-all">{h.url}</code>
                <button
                  onClick={() => toggleMut.mutate({ id: h.id, active: !h.active })}
                  className={`relative flex-shrink-0 w-9 h-5 rounded-full transition-colors ${h.active ? 'bg-accent' : 'bg-secondary'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${h.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
              {(h.events || []).length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {h.events.map(e => <Badge key={e} variant="secondary" className="text-[9px]">{e}</Badge>)}
                </div>
              )}
              <div className="flex justify-between text-[10px] text-muted-foreground">
                {h.last_triggered && <span>Last triggered: <span className="text-foreground">{h.last_triggered}</span></span>}
                {h.success_rate != null && (
                  <span>Success rate: <span className={`font-bold ${h.success_rate > 95 ? 'text-accent' : 'text-yellow-500'}`}>{h.success_rate}%</span></span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}