import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const ROLES = ['admin', 'user', 'founder', 'analyst', 'developer'];

export default function UserManagement() {
  const { canView, user: currentUser } = useRBAC();
  const qc = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, role }) => base44.entities.User.update(id, { role }),
    onSuccess: () => qc.invalidateQueries(['users']),
  });

  const isFounder = currentUser?.role === 'founder' || currentUser?.role === 'admin';
  if (!canView('admin')) return <AccessDenied section="Admin" />;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground text-sm">{users.length} registered users</p>
      </div>

      {!isFounder && (
        <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-3 text-yellow-400 text-xs">
          Role editing is restricted to FOUNDER/ADMIN accounts.
        </div>
      )}

      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="grid grid-cols-4 text-xs text-muted-foreground px-4 py-2 border-b border-border">
          {['User', 'Email', 'Role', 'Joined'].map(h => <span key={h}>{h}</span>)}
        </div>
        {isLoading ? Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 m-2 rounded" />) :
          users.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No users found.</div>
          ) : users.map(u => (
            <div key={u.id} className="grid grid-cols-4 items-center text-sm px-4 py-3 border-b border-border/50 hover:bg-muted/20">
              <span className="font-medium">{u.full_name || '—'}</span>
              <span className="text-muted-foreground text-xs">{u.email}</span>
              {isFounder ? (
                <select
                  className="bg-input border border-border rounded px-2 py-1 text-xs w-28"
                  value={u.role || 'user'}
                  onChange={e => updateMut.mutate({ id: u.id, role: e.target.value })}
                >
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              ) : (
                <Badge variant="outline" className="text-xs w-fit">{u.role || 'user'}</Badge>
              )}
              <span className="text-xs text-muted-foreground">{u.created_date ? format(new Date(u.created_date), 'MMM d, yyyy') : '—'}</span>
            </div>
          ))}
      </div>
    </div>
  );
}