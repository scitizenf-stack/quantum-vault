import React from 'react';
import { useLocation } from 'react-router-dom';
import ComingSoonPage from '@/components/shared/ComingSoonPage';
import { Smartphone } from 'lucide-react';

const titles = {
  '/elephone/dialpad': 'Dialpad',
  '/elephone/contacts': 'Contacts',
  '/elephone/call-history': 'Call History',
  '/elephone/sms': 'SMS',
  '/elephone/data': 'Data & Minutes',
  '/elephone/topups': 'Top-Ups',
  '/elephone/sim': 'SIM / eSIM',
};

export default function ElephoneSub() {
  const { pathname } = useLocation();
  return <ComingSoonPage title={titles[pathname] || 'elePhone'} icon={Smartphone} />;
}