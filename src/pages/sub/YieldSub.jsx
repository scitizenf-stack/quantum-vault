import React from 'react';
import { useLocation } from 'react-router-dom';
import ComingSoonPage from '@/components/shared/ComingSoonPage';
import { TrendingUp } from 'lucide-react';

const titles = {
  '/yield/staking': 'Staking',
  '/yield/vaults': 'Vaults',
  '/yield/rewards': 'Rewards',
};

export default function YieldSub() {
  const { pathname } = useLocation();
  return <ComingSoonPage title={titles[pathname] || 'Yield'} icon={TrendingUp} />;
}