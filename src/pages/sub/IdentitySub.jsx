import React from 'react';
import { useLocation } from 'react-router-dom';
import ComingSoonPage from '@/components/shared/ComingSoonPage';
import { Shield } from 'lucide-react';

const titles = {
  '/identity/digital-id': 'Digital ID',
  '/identity/kyc': 'KYC Verification',
  '/identity/documents': 'Document Vault',
  '/identity/access-logs': 'Access Logs',
};

export default function IdentitySub() {
  const { pathname } = useLocation();
  return <ComingSoonPage title={titles[pathname] || 'Identity'} icon={Shield} />;
}