import React from 'react';
import { useLocation } from 'react-router-dom';
import ComingSoonPage from '@/components/shared/ComingSoonPage';
import { ShoppingBag } from 'lucide-react';

const titles = {
  '/marketplace/precious-metals': 'Precious Metals',
  '/marketplace/telecom': 'Telecom Products',
  '/marketplace/identity': 'Identity Products',
  '/marketplace/hosting': 'Hosting Products',
  '/marketplace/developer': 'Developer Products',
  '/marketplace/treasury': 'Treasury Products',
  '/marketplace/yield': 'Yield Products',
  '/marketplace/ai': 'AI / LLM Products',
  '/marketplace/platform': 'Platform Products',
};

export default function MarketplaceSub() {
  const { pathname } = useLocation();
  return <ComingSoonPage title={titles[pathname] || 'Marketplace'} icon={ShoppingBag} />;
}