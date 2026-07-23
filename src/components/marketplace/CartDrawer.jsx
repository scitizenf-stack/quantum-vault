import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingCart } from 'lucide-react';
import { meshApi } from '@/lib/meshClient';
import { useQueryClient } from '@tanstack/react-query';

export default function CartDrawer({ open, onClose, cartItems }) {
  const queryClient = useQueryClient();
  const total = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

  const handleRemove = async (item) => {
    await meshApi.removeFromCart(item.id);
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  };

  const handleClearAll = async () => {
    await meshApi.clearCart();
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-96 bg-card border-border flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-primary" />
            Cart ({cartItems.length})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {cartItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">Your cart is empty</p>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                <div>
                  <p className="text-xs font-semibold">{item.product_name}</p>
                  <p className="text-[10px] font-mono text-primary/70">{item.product_code}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ${item.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })} {item.price_unit}
                  </p>
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleRemove(item)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex justify-between text-sm font-semibold">
              <span>Total</span>
              <span className="font-mono">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <Button className="w-full" size="sm">Proceed to Checkout</Button>
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground text-xs" onClick={handleClearAll}>
              Clear All
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}