import React from 'react';
import { useLocation } from 'react-router-dom';
import ComingSoonPage from '@/components/shared/ComingSoonPage';
import { Box } from 'lucide-react';

const titles = {
  '/platform/os': 'Quantum Vault OS',
  '/platform/identity': 'Base44 Identity',
  '/platform/health': 'System Health',
  '/platform/flags': 'Feature Flags',
};

export default function PlatformSub() {
  const { pathname } = useLocation();
  return <ComingSoonPage title={titles[pathname] || 'Platform'} icon={Box} />;
}