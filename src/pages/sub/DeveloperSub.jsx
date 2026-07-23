import React from 'react';
import { useLocation } from 'react-router-dom';
import ComingSoonPage from '@/components/shared/ComingSoonPage';
import { Code2 } from 'lucide-react';

const titles = {
  '/developer/api-keys': 'API Keys',
  '/developer/webhooks': 'Webhooks',
  '/developer/console': 'Console',
  '/developer/logs': 'Logs',
  '/developer/sdks': 'SDKs',
};

export default function DeveloperSub() {
  const { pathname } = useLocation();
  return <ComingSoonPage title={titles[pathname] || 'Developer'} icon={Code2} />;
}