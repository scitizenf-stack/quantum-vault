import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, Copy, KeyRound } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function APIKeys() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const { data: keys = [], isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => base44.entities.ApiKey.list(),
  });

  const revokeMut = useMutation({
    mutationFn: (id) => base44.entities.ApiKey.update(id, { active: false }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['api-keys'] }),
  });

  const createMut = useMutation({
    mutationFn: (name) => base44.entities.ApiKey.create({ name, prefix: 'qv_live_****', active: true, scopes: ['read'] }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['api-keys'] }); setNewName(''); setCreating(false); },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-xs text-muted-foreground mt-1">{keys.length} keys — Keep these secret</p>
        </div>
        {creating ? (
          <div className="flex gap-2">
            <input
              className="text-xs bg-input border border-border rounded-lg px-3 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="Key name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && newName.trim() && createMut.mutate(newName.trim())}
            />
            <Button size="sm" onClick={() => newName.trim() && createMut.mutate(newName.trim())}>Create</Button>
            <Button size="sm" variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
          </div>
        ) : (
          <Button size="sm" onClick={() => setCreating(true)}>+ New Key</Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : keys.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted-foreground/30 p-10 flex flex-col items-center gap-3 text-center">
          <KeyRound className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm font-medium">No API keys yet</p>
          <p className="text-xs text-muted-foreground">Create your first API key to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((k) => (
            <div key={k.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold">{k.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs font-mono bg-secondary px-2 py-0.5 rounded text-muted-foreground">{k.prefix}{'x'.repeat(20)}</code>
                    <button onClick={() => { navigator.clipboard.writeText(k.prefix); toast({ title: 'Copied' }); }} className="text-muted-foreground hover:text-primary">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <Badge variant={k.active ? 'default' : 'secondary'} className="text-[10px]">{k.active ? 'Active' : 'Revoked'}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground mb-3">
                <span>Created: {k.created_date ? new Date(k.created_date).toLocaleDateString() : '—'}</span>
                {k.last_used && <span>Last used: {k.last_used}</span>}
                {(k.scopes || []).length > 0 && (
                  <span>Scopes: {k.scopes.map(s => <Badge key={s} variant="outline" className="text-[9px] ml-1">{s}</Badge>)}</span>
                )}
              </div>
              {k.active && (
                <Button variant="destructive" size="sm" className="h-7 text-xs gap-1" onClick={() => revokeMut.mutate(k.id)}>
                  <Trash2 className="w-3 h-3" /> Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}