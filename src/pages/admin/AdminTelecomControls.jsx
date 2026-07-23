import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminTelecomControls() {
  const { canAdmin } = useRBAC();
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ key: '', value: '' });

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['telecom-settings'],
    queryFn: () => base44.entities.Settings.filter({ key: { $regex: '^telecom_' } }),
    refetchInterval: 30000,
  });

  const createMut = useMutation({
    mutationFn: data => base44.entities.Settings.create({ ...data, key: data.key.startsWith('telecom_') ? data.key : `telecom_${data.key}`, updatedAt: new Date().toISOString() }),
    onSuccess: () => { qc.invalidateQueries(['telecom-settings']); setAdding(false); setForm({ key: '', value: '' }); toast.success('Setting created'); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, value }) => base44.entities.Settings.update(id, { value, updatedAt: new Date().toISOString() }),
    onSuccess: () => { qc.invalidateQueries(['telecom-settings']); setEditing(null); toast.success('Setting updated'); },
  });

  const deleteMut = useMutation({
    mutationFn: id => base44.entities.Settings.delete(id),
    onSuccess: () => { qc.invalidateQueries(['telecom-settings']); toast.success('Setting deleted'); },
  });

  if (!canAdmin()) return <AccessDenied section="Telecom Controls" />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Telecom Controls</h1>
          <p className="text-xs text-muted-foreground mt-1">{settings.length} telecom settings</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setAdding(a => !a)}>
          <Plus className="w-4 h-4" /> Add Setting
        </Button>
      </div>

      {adding && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold">New Telecom Setting</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Key (will be prefixed telecom_)</label>
              <input value={form.key} onChange={e => setForm(p => ({ ...p, key: e.target.value }))} placeholder="e.g. twilio_sid"
                className="w-full mt-1 text-xs bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Value</label>
              <input value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} placeholder="Value"
                className="w-full mt-1 text-xs bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => createMut.mutate(form)} disabled={!form.key || createMut.isPending}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
      ) : settings.length === 0 ? (
        <div className="bg-card border border-dashed border-muted-foreground/30 rounded-xl p-10 text-center text-muted-foreground text-sm">
          No telecom settings configured yet.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {settings.map((s, i) => (
            <div key={s.id} className={`flex items-center gap-3 px-4 py-3 ${i < settings.length - 1 ? 'border-b border-border/50' : ''}`}>
              {editing?.id === s.id ? (
                <>
                  <code className="text-xs font-mono text-primary flex-shrink-0 w-48">{s.key}</code>
                  <input defaultValue={s.value} onBlur={e => updateMut.mutate({ id: s.id, value: e.target.value })}
                    className="flex-1 text-xs bg-input border border-border rounded px-2 py-1 text-foreground outline-none" />
                  <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Done</Button>
                </>
              ) : (
                <>
                  <code className="text-xs font-mono text-primary flex-shrink-0 w-48 truncate">{s.key}</code>
                  <span className="flex-1 text-xs text-muted-foreground truncate">{s.value}</span>
                  <button onClick={() => setEditing(s)} className="p-1 hover:bg-secondary rounded">
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button onClick={() => deleteMut.mutate(s.id)} className="p-1 hover:bg-destructive/10 rounded">
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}