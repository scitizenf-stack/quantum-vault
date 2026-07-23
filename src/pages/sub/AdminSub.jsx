import React from 'react';
import { useLocation } from 'react-router-dom';
import ComingSoonPage from '@/components/shared/ComingSoonPage';
import { ShieldCheck } from 'lucide-react';

const titles = {
  '/admin/products': 'Product Management',
  '/admin/users': 'User Management',
  '/admin/logs': 'System Logs',
  '/admin/marketplace': 'Marketplace Controls',
  '/admin/telecom': 'Telecom Controls',
  '/admin/treasury': 'Treasury Controls',
  '/admin/risk': 'Risk Controls',
  '/admin/deployments': 'Deployments',
};

export default function AdminSub() {
  const { pathname } = useLocation();
  return <ComingSoonPage title={titles[pathname] || 'Admin'} icon={ShieldCheck} />;
}