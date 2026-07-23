import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { meshApi } from '@/lib/meshClient';
import { useQueryClient } from '@tanstack/react-query';

const emptyForm = {
  asset_name: '', symbol: '', type: 'buy', quantity: '',
  price_per_unit: '', total_amount: '', fee: '', status: 'completed', notes: '',
};

export default function AddTransactionDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await meshApi.addTransaction({
      ...form,
      quantity:       form.quantity       ? parseFloat(form.quantity)       : undefined,
      price_per_unit: form.price_per_unit ? parseFloat(form.price_per_unit) : undefined,
      total_amount:   parseFloat(form.total_amount),
      fee:            form.fee            ? parseFloat(form.fee)            : undefined,
    });
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    setOpen(false);
    setForm(emptyForm);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> New Transaction</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Record Transaction</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Asset Name</Label>
              <Input placeholder="Bitcoin" value={form.asset_name} onChange={e => setForm({...form, asset_name: e.target.value})} required />
            </div>
            <div className="space-y-1.5">
              <Label>Symbol</Label>
              <Input placeholder="BTC" value={form.symbol} onChange={e => setForm({...form, symbol: e.target.value.toUpperCase()})} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                  <SelectItem value="transfer_in">Transfer In</SelectItem>
                  <SelectItem value="transfer_out">Transfer Out</SelectItem>
                  <SelectItem value="dividend">Dividend</SelectItem>
                  <SelectItem value="interest">Interest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Quantity</Label>
              <Input type="number" step="any" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <Label>Price/Unit</Label>
              <Input type="number" step="any" value={form.price_per_unit} onChange={e => setForm({...form, price_per_unit: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <Label>Total $</Label>
              <Input type="number" step="any" value={form.total_amount} onChange={e => setForm({...form, total_amount: e.target.value})} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Textarea placeholder="Additional details..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="h-16" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Recording...' : 'Record Transaction'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}