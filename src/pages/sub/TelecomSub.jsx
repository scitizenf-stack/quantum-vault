import React from 'react';
import { useLocation } from 'react-router-dom';
import ComingSoonPage from '@/components/shared/ComingSoonPage';
import { Radio } from 'lucide-react';

const titles = {
  '/telecom/usage': 'Usage',
  '/telecom/plans': 'Plans',
  '/telecom/topups': 'Top-Ups',
  '/telecom/devices': 'Devices',
  '/telecom/regions': 'Regions',
};

export default function TelecomSub() {
  const { pathname } = useLocation();
  return <ComingSoonPage title={titles[pathname] || 'Telecom'} icon={Radio} />;
}