import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { meshApi } from '@/lib/meshClient';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const CATEGORIES = ['Precious Metals', 'Telecom', 'Identity', 'Hosting', 'Developer', 'Treasury', 'Yield', 'AI/LLM', 'Platform'];
const emptyForm = { name: '', code: '', category: '', price: '', price_unit: '', description: '', icon: '' };

export default function ProductFormDialog({ open, onClose, product }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const isEdit = !!product;

  useEffect(() => {
    if (product) setForm({ ...emptyForm, ...product, price: product.price?.toString() || '' });
    else setForm(emptyForm);
  }, [product, open]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = { ...form, price: parseFloat(form.price) || 0 };
    if (isEdit) {
      await meshApi.adminUpdateProduct(product.id, data);
      toast.success('Product updated');
    } else {
      await meshApi.adminCreateProduct(data);
      toast.success('Product created');
    }
    queryClient.invalidateQueries({ queryKey: ['products'] });
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Product' : 'Add Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Name *</Label>
              <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Product name" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Code *</Label>
              <Input value={form.code} onChange={e => set('code', e.target.value)} placeholder="XAU-SPOT" required className="font-mono" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Category *</Label>
              <Select value={form.category} onValueChange={v => set('category', v)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Icon (emoji)</Label>
              <Input value={form.icon} onChange={e => set('icon', e.target.value)} placeholder="💰" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Price *</Label>
              <Input type="number" step="any" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Price Unit</Label>
              <Input value={form.price_unit} onChange={e => set('price_unit', e.target.value)} placeholder="/oz, /month" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <textarea
              className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Short product description..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}