import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meshApi } from '@/lib/meshClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Search, Store } from 'lucide-react';
import ProductCard from '@/components/marketplace/ProductCard';
import CartDrawer from '@/components/marketplace/CartDrawer';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const CATEGORIES = ['All', 'Precious Metals', 'Telecom', 'Identity', 'Hosting', 'Developer', 'Treasury', 'Yield', 'AI/LLM', 'Platform'];

export default function Marketplace() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sort, setSort] = useState('name-asc');
  const [cartOpen, setCartOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => meshApi.getProducts(),
  });

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cart'],
    queryFn:  () => meshApi.getCart(),
  });

  const addToCartMutation = useMutation({
    mutationFn: (product) => meshApi.addToCart({
      product_id:   product.id,
      product_name: product.name,
      product_code: product.code,
      category:     product.category,
      price:        product.price,
      price_unit:   product.price_unit,
      quantity:     1,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart');
    },
  });

  const cartProductIds = useMemo(() => new Set(cartItems.map(c => c.product_id)), [cartItems]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (activeCategory !== 'All') list = list.filter(p => p.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    if (sort === 'name-asc') list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'name-desc') list.sort((a, b) => b.name.localeCompare(a.name));
    else if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, activeCategory, search, sort]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Store className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Marketplace</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{products.length} products across {CATEGORIES.length - 1} categories</p>
          </div>
        </div>
        <Button variant="outline" className="relative gap-2" onClick={() => setCartOpen(true)}>
          <ShoppingCart className="w-4 h-4" />
          Cart
          {cartItems.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartItems.length}
            </span>
          )}
        </Button>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products, codes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name A→Z</SelectItem>
            <SelectItem value="name-desc">Name Z→A</SelectItem>
            <SelectItem value="price-asc">Price: Low → High</SelectItem>
            <SelectItem value="price-desc">Price: High → Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
              activeCategory === cat
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-secondary/50 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
            }`}
          >
            {cat}
            {cat !== 'All' && (
              <span className="ml-1.5 opacity-60">
                {products.filter(p => p.category === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">Showing {filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground text-sm">No products found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCartMutation.mutate}
              inCart={cartProductIds.has(product.id)}
            />
          ))}
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cartItems={cartItems} />
    </div>
  );
}