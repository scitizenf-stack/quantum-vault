import React from 'react';
import { useLocation } from 'react-router-dom';
import ComingSoonPage from '@/components/shared/ComingSoonPage';
import { Server } from 'lucide-react';

const titles = {
  '/hosting/domains': 'Domains',
  '/hosting/dns': 'DNS Management',
  '/hosting/cloudflare': 'Cloudflare',
  '/hosting/workers': 'Workers',
  '/hosting/ssl': 'SSL Certificates',
};

export default function HostingSub() {
  const { pathname } = useLocation();
  return <ComingSoonPage title={titles[pathname] || 'Hosting'} icon={Server} />;
}