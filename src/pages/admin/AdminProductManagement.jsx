import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Plus } from 'lucide-react';

const statusVariant = (s) => ({ active: 'default', inactive: 'secondary', coming_soon: 'outline', deprecated: 'destructive' })[s] || 'outline';

export default function AdminProductManagement() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products-admin'],
    queryFn: () => base44.entities.Product.list('-created_date', 50),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Product Management</h1>
          <p className="text-xs text-muted-foreground mt-1">{products.length} products</p>
        </div>
        <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" />Add Product</Button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[540px]">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              {['Name', 'Code', 'Category', 'Price', 'Status', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-xs text-muted-foreground">Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-xs text-muted-foreground">No products yet</td></tr>
            ) : (
              products.map((p, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="px-4 py-3 text-xs font-medium">{p.icon} {p.name}</td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{p.code}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3 text-xs font-mono">${p.price}{p.unit}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant(p.status)} className="text-[10px]">{p.status}</Badge></td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Edit2 className="w-3.5 h-3.5" /></Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}