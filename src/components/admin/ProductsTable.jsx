import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { meshApi } from '@/lib/meshClient';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const categoryColors = {
  'Precious Metals': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  'Telecom':         'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'Identity':        'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'Hosting':         'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  'Developer':       'bg-green-500/15 text-green-400 border-green-500/30',
  'Treasury':        'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'Yield':           'bg-orange-500/15 text-orange-400 border-orange-500/30',
  'AI/LLM':          'bg-pink-500/15 text-pink-400 border-pink-500/30',
  'Platform':        'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
};

function SortIcon({ col, sortCol, sortDir }) {
  if (sortCol !== col) return <ChevronsUpDown className="w-3 h-3 opacity-40" />;
  return sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
}

export default function ProductsTable({ products, onEdit }) {
  const [sortCol, setSortCol] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [deletingId, setDeletingId] = useState(null);
  const queryClient = useQueryClient();

  const toggleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const sorted = [...products].sort((a, b) => {
    let av = a[sortCol], bv = b[sortCol];
    if (typeof av === 'string') { av = av.toLowerCase(); bv = bv?.toLowerCase() ?? ''; }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    setDeletingId(id);
    await meshApi.adminDeleteProduct(id);
    queryClient.invalidateQueries({ queryKey: ['products'] });
    toast.success('Product deleted');
    setDeletingId(null);
  };

  const cols = [
    { key: 'icon',       label: '',         sortable: false, w: 'w-8'  },
    { key: 'name',       label: 'Name',     sortable: true         },
    { key: 'code',       label: 'Code',     sortable: true         },
    { key: 'category',   label: 'Category', sortable: true         },
    { key: 'price',      label: 'Price',    sortable: true         },
    { key: 'price_unit', label: 'Unit',     sortable: false        },
    { key: 'actions',    label: '',         sortable: false, w: 'w-20' },
  ];

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/20">
              {cols.map(col => (
                <th key={col.key}
                  className={cn('text-left px-4 py-3 text-xs font-semibold text-muted-foreground', col.sortable && 'cursor-pointer hover:text-foreground select-none', col.w)}
                  onClick={() => col.sortable && toggleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && <SortIcon col={col.key} sortCol={sortCol} sortDir={sortDir} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, i) => (
              <tr key={p.id} className={cn('border-b border-border/50 hover:bg-secondary/20 transition-colors', i % 2 !== 0 && 'bg-secondary/5')}>
                <td className="px-4 py-3 text-lg">{p.icon || '📦'}</td>
                <td className="px-4 py-3 font-medium text-foreground max-w-[180px] truncate">{p.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-primary/80">{p.code}</td>
                <td className="px-4 py-3">
                  <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', categoryColors[p.category] || 'bg-muted text-muted-foreground border-border')}>
                    {p.category}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono font-semibold">${p.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{p.price_unit}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => onEdit(p)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-xs text-muted-foreground">No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}