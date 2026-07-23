import React from 'react';
import { useLocation } from 'react-router-dom';
import ComingSoonPage from '@/components/shared/ComingSoonPage';
import { Briefcase } from 'lucide-react';

const titles = {
  '/treasury/balance': 'Balance',
  '/treasury/allocation': 'Allocation',
  '/treasury/proof': 'Proof of Capital',
  '/treasury/yield': 'Yield',
};

export default function TreasurySub() {
  const { pathname } = useLocation();
  return <ComingSoonPage title={titles[pathname] || 'Treasury'} icon={Briefcase} />;
}