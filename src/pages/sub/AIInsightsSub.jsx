import React from 'react';
import { useLocation } from 'react-router-dom';
import ComingSoonPage from '@/components/shared/ComingSoonPage';
import { Brain } from 'lucide-react';

const titles = {
  '/ai-insights/signals': 'Signals',
  '/ai-insights/sentiment': 'Sentiment',
  '/ai-insights/risk': 'Risk Score',
  '/ai-insights/anomalies': 'Anomalies',
  '/ai-insights/advisor': 'AI Advisor',
};

export default function AIInsightsSub() {
  const { pathname } = useLocation();
  return <ComingSoonPage title={titles[pathname] || 'AI Insights'} icon={Brain} />;
}