import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';

export default function BaseIdentity() {
  const { canView, user } = useRBAC();
  if (!canView('platform')) return <AccessDenied section="Platform" />;

  const fields = [
    { label: 'Email', value: user?.email || '—' },
    { label: 'Role', value: user?.role?.toUpperCase() || 'FOUNDER' },
    { label: 'Workspace', value: 'Omega Protocol' },
    { label: 'Plan', value: 'Starter' },
    { label: 'App ID', value: '69f4fd2e2cbf5488116db6f0' },
    { label: 'Full Name', value: user?.full_name || '—' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Base44 Identity</h1>
          <p className="text-muted-foreground text-sm">Current authenticated session context</p>
        </div>
      </div>
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        {fields.map((f, i) => (
          <div key={f.label} className={`flex items-center justify-between px-5 py-3 ${i < fields.length - 1 ? 'border-b border-border' : ''}`}>
            <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{f.label}</span>
            <span className="text-sm font-medium font-mono">{f.value}</span>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-card border border-border p-4">
        <p className="text-xs text-muted-foreground mb-2">Session metadata</p>
        <pre className="text-xs font-mono text-foreground">{JSON.stringify({ authenticated: true, provider: 'base44', timestamp: new Date().toISOString() }, null, 2)}</pre>
      </div>
    </div>
  );
}