import React from 'react';
import { useLocation } from 'react-router-dom';
import ComingSoonPage from '@/components/shared/ComingSoonPage';
import { Zap } from 'lucide-react';

const titles = {
  '/hft/strategies': 'Strategies',
  '/hft/orderbook': 'Order Book',
  '/hft/executions': 'Live Executions',
  '/hft/risk': 'Risk Controls',
  '/hft/metrics': 'Metrics',
};

export default function HFTSub() {
  const { pathname } = useLocation();
  return <ComingSoonPage title={titles[pathname] || 'HFT Engine'} icon={Zap} />;
}