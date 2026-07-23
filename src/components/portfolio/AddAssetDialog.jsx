import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { meshApi } from '@/lib/meshClient';
import { useQueryClient } from '@tanstack/react-query';

const emptyForm = { name: '', symbol: '', type: 'stock', quantity: '', avg_buy_price: '', current_price: '', change_24h: '' };

export default function AddAssetDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await meshApi.addAsset({
      ...form,
      quantity:       parseFloat(form.quantity),
      avg_buy_price:  parseFloat(form.avg_buy_price),
      current_price:  parseFloat(form.current_price),
      change_24h:     parseFloat(form.change_24h || '0'),
    });
    queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    setOpen(false);
    setForm(emptyForm);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Add Asset</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Add New Asset</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input placeholder="Apple Inc." value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="space-y-1.5">
              <Label>Symbol</Label>
              <Input placeholder="AAPL" value={form.symbol} onChange={e => setForm({...form, symbol: e.target.value.toUpperCase()})} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="crypto">Crypto</SelectItem>
                <SelectItem value="etf">ETF</SelectItem>
                <SelectItem value="bond">Bond</SelectItem>
                <SelectItem value="commodity">Commodity</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Quantity</Label>
              <Input type="number" step="any" placeholder="10" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required />
            </div>
            <div className="space-y-1.5">
              <Label>Avg Price</Label>
              <Input type="number" step="any" placeholder="150" value={form.avg_buy_price} onChange={e => setForm({...form, avg_buy_price: e.target.value})} required />
            </div>
            <div className="space-y-1.5">
              <Label>Current</Label>
              <Input type="number" step="any" placeholder="175" value={form.current_price} onChange={e => setForm({...form, current_price: e.target.value})} required />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Adding...' : 'Add Asset'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}