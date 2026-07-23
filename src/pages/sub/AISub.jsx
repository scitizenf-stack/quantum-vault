import React from 'react';
import { useLocation } from 'react-router-dom';
import ComingSoonPage from '@/components/shared/ComingSoonPage';
import { Cpu } from 'lucide-react';

const titles = {
  '/ai/credits': 'AI Credits',
  '/ai/usage': 'Usage Analytics',
  '/ai/models': 'Models',
  '/ai/logs': 'AI Logs',
};

export default function AISub() {
  const { pathname } = useLocation();
  return <ComingSoonPage title={titles[pathname] || 'AI / LLM'} icon={Cpu} />;
}