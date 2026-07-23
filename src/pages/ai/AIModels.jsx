import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Brain, Plus } from 'lucide-react';

const BUILTIN_MODELS = [
  { name: 'llama3:70b', size: '40GB', quantization: 'Q4_K_M', status: 'available' },
  { name: 'llama3:8b', size: '4.7GB', quantization: 'Q4_0', status: 'available' },
  { name: 'mistral:7b', size: '4.1GB', quantization: 'Q4_0', status: 'available' },
  { name: 'codellama:34b', size: '19GB', quantization: 'Q4_K_M', status: 'available' },
  { name: 'phi3:medium', size: '7.9GB', quantization: 'Q4_0', status: 'available' },
  { name: 'gemma2:27b', size: '16GB', quantization: 'Q4_K_M', status: 'available' },
  { name: 'qwen2.5:72b', size: '41GB', quantization: 'Q4_K_M', status: 'available' },
  { name: 'deepseek-r1:70b', size: '43GB', quantization: 'Q4_K_M', status: 'available' },
  { name: 'nomic-embed-text', size: '274MB', quantization: 'F16', status: 'available' },
  { name: 'llava:34b', size: '20GB', quantization: 'Q4_K_M', status: 'available' },
  { name: 'mixtral:8x7b', size: '26GB', quantization: 'Q4_0', status: 'available' },
];

export default function AIModels() {
  const { canView } = useRBAC();
  const qc = useQueryClient();
  const [requesting, setRequesting] = useState(false);
  const [reqName, setReqName] = useState('');

  const { data: dbModels = [], isLoading } = useQuery({
    queryKey: ['ollama-models'],
    queryFn: () => base44.entities.OllamaModel.list(),
    refetchInterval: 30000,
  });

  const requestMut = useMutation({
    mutationFn: (model_name) => base44.entities.ModelRequest.create({ model_name, status: 'pending' }),
    onSuccess: () => { setRequesting(false); setReqName(''); },
  });

  if (!canView('ai')) return <AccessDenied section="AI Models" />;

  const hasDbModels = dbModels.length > 0;
  const models = hasDbModels ? dbModels : BUILTIN_MODELS;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Models</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {hasDbModels ? `${dbModels.length} models on VPS Ollama` : 'VPS models not yet registered'}
          </p>
        </div>
        <div className="flex gap-2">
          {requesting ? (
            <>
              <input value={reqName} onChange={e => setReqName(e.target.value)}
                placeholder="Model name (e.g. llama3:70b)"
                className="text-xs bg-input border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring w-48" />
              <Button size="sm" onClick={() => reqName.trim() && requestMut.mutate(reqName.trim())}>Request</Button>
              <Button size="sm" variant="outline" onClick={() => setRequesting(false)}>Cancel</Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setRequesting(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Request Model
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : !hasDbModels ? (
        <div className="rounded-xl border border-dashed border-muted-foreground/30 p-8 text-center">
          <p className="text-sm text-muted-foreground">No AI models registered yet.</p>
          <p className="text-xs text-muted-foreground/70 mt-1">This populates once AI routing/fallback decisions register models from the VPS Ollama instance.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {models.map((m, i) => (
            <div key={m.id || m.name || i} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 text-chart-3" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono font-semibold truncate">{m.name}</p>
                <div className="flex gap-3 text-[10px] text-muted-foreground mt-0.5">
                  {m.size && <span>Size: <span className="text-foreground">{m.size}</span></span>}
                  {m.quantization && <span>Quant: <span className="text-foreground">{m.quantization}</span></span>}
                </div>
              </div>
              <Badge className="bg-accent/10 text-accent border-accent/20 text-[10px]">{m.status || 'available'}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}