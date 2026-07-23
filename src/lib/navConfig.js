import {
  LayoutDashboard, Wallet, PieChart, ShoppingBag, Smartphone,
  Radio, Shield, Server, Code2, Briefcase, TrendingUp, Cpu,
  Box, ArrowLeftRight, Settings, ShieldCheck, Eye, Zap, Brain,
  MessageSquare
} from 'lucide-react';

export const NAV_SECTIONS = [
  // ── MAIN ──────────────────────────────────────────────────────────────────
  { id: 'dashboard',  label: 'Dashboard', path: '/',          icon: LayoutDashboard },
  { id: 'wallet',     label: 'Wallet',    path: '/wallet',    icon: Wallet },
  { id: 'portfolio',  label: 'Portfolio', path: '/portfolio', icon: PieChart },

  // ── MARKETPLACE ───────────────────────────────────────────────────────────
  {
    id: 'marketplace', label: 'Marketplace', path: '/marketplace', icon: ShoppingBag,
    children: [
      { label: 'Overview',        path: '/marketplace' },
      { label: 'Precious Metals', path: '/marketplace/precious-metals' },
      { label: 'Telecom',         path: '/marketplace/telecom' },
      { label: 'Identity',        path: '/marketplace/identity' },
      { label: 'Hosting',         path: '/marketplace/hosting' },
      { label: 'Developer',       path: '/marketplace/developer' },
      { label: 'Treasury',        path: '/marketplace/treasury' },
      { label: 'Yield',           path: '/marketplace/yield' },
      { label: 'AI / LLM',        path: '/marketplace/ai' },
      { label: 'Platform',        path: '/marketplace/platform' },
    ],
  },

  // ── ELEPHONE ──────────────────────────────────────────────────────────────
  {
    id: 'elephone', label: 'elePhone', path: '/elephone', icon: Smartphone,
    children: [
      { label: 'Overview',       path: '/elephone' },
      { label: 'Dialpad',        path: '/elephone/dialpad' },
      { label: 'Contacts',       path: '/elephone/contacts' },
      { label: 'Call History',   path: '/elephone/call-history' },
      { label: 'SMS',            path: '/elephone/sms' },
      { label: 'Data & Minutes', path: '/elephone/data' },
      { label: 'Top-Ups',        path: '/elephone/topups' },
      { label: 'SIM / eSIM',     path: '/elephone/sim' },
    ],
  },

  // ── TELECOM ───────────────────────────────────────────────────────────────
  {
    id: 'telecom', label: 'Telecom', path: '/telecom', icon: Radio,
    children: [
      { label: 'Overview', path: '/telecom' },
      { label: 'Usage',    path: '/telecom/usage' },
      { label: 'Plans',    path: '/telecom/plans' },
      { label: 'Top-Ups',  path: '/telecom/topups' },
      { label: 'Devices',  path: '/telecom/devices' },
      { label: 'Regions',  path: '/telecom/regions' },
    ],
  },

  // ── TELECOM CONSOLE ───────────────────────────────────────────────────────
  { id: 'telecom-console', label: 'Telecom Console', path: '/telecom-console', icon: Smartphone },

  // ── IDENTITY ──────────────────────────────────────────────────────────────
  {
    id: 'identity', label: 'Identity', path: '/identity', icon: Shield,
    children: [
      { label: 'Overview',       path: '/identity' },
      { label: 'Digital ID',     path: '/identity/digital-id' },
      { label: 'KYC',            path: '/identity/kyc' },
      { label: 'Document Vault', path: '/identity/documents' },
      { label: 'Access Logs',    path: '/identity/access-logs' },
    ],
  },

  // ── HOSTING ───────────────────────────────────────────────────────────────
  {
    id: 'hosting', label: 'Hosting', path: '/hosting', icon: Server,
    children: [
      { label: 'Overview',   path: '/hosting' },
      { label: 'Domains',    path: '/hosting/domains' },
      { label: 'DNS',        path: '/hosting/dns' },
      { label: 'Cloudflare', path: '/hosting/cloudflare' },
      { label: 'Workers',    path: '/hosting/workers' },
      { label: 'SSL',        path: '/hosting/ssl' },
    ],
  },

  // ── DEVELOPER ─────────────────────────────────────────────────────────────
  {
    id: 'developer', label: 'Developer', path: '/developer', icon: Code2,
    children: [
      { label: 'Overview', path: '/developer' },
      { label: 'API Keys', path: '/developer/api-keys' },
      { label: 'Webhooks', path: '/developer/webhooks' },
      { label: 'Console',  path: '/developer/console' },
      { label: 'Logs',     path: '/developer/logs' },
      { label: 'SDKs',     path: '/developer/sdks' },
    ],
  },

  // ── TREASURY ──────────────────────────────────────────────────────────────
  {
    id: 'treasury', label: 'Treasury', path: '/treasury', icon: Briefcase,
    children: [
      { label: 'Overview',         path: '/treasury' },
      { label: 'Balance',          path: '/treasury/balance' },
      { label: 'Allocation',       path: '/treasury/allocation' },
      { label: 'Proof of Capital', path: '/treasury/proof' },
      { label: 'Yield',            path: '/treasury/yield' },
    ],
  },

  // ── YIELD ─────────────────────────────────────────────────────────────────
  {
    id: 'yield', label: 'Yield', path: '/yield', icon: TrendingUp,
    children: [
      { label: 'Overview', path: '/yield' },
      { label: 'Staking',  path: '/yield/staking' },
      { label: 'Vaults',   path: '/yield/vaults' },
      { label: 'Rewards',  path: '/yield/rewards' },
    ],
  },

  // ── AI / LLM ──────────────────────────────────────────────────────────────
  {
    id: 'ai', label: 'AI / LLM', path: '/ai', icon: Cpu,
    children: [
      { label: 'Overview',   path: '/ai' },
      { label: 'AI Credits', path: '/ai/credits' },
      { label: 'Usage',      path: '/ai/usage' },
      { label: 'Models',     path: '/ai/models' },
      { label: 'AI Logs',    path: '/ai/logs' },
    ],
  },

  // ── PLATFORM ──────────────────────────────────────────────────────────────
  {
    id: 'platform', label: 'Platform', path: '/platform', icon: Box,
    children: [
      { label: 'Overview',         path: '/platform' },
      { label: 'Quantum Vault OS', path: '/platform/os' },
      { label: 'Base44 Identity',  path: '/platform/identity' },
      { label: 'System Health',    path: '/platform/health' },
      { label: 'Feature Flags',    path: '/platform/flags' },
    ],
  },

  // ── HFT ENGINE ────────────────────────────────────────────────────────────
  {
    id: 'hft', label: 'HFT Engine', path: '/hft', icon: Zap,
    children: [
      { label: 'Overview',        path: '/hft' },
      { label: 'Strategies',      path: '/hft/strategies' },
      { label: 'Order Book',      path: '/hft/orderbook' },
      { label: 'Live Executions', path: '/hft/executions' },
      { label: 'Risk Controls',   path: '/hft/risk' },
      { label: 'Metrics',         path: '/hft/metrics' },
      { label: 'P2P Trading',     path: '/hft/p2p' },
      { label: 'Analytics',       path: '/hft/analytics' },
    ],
  },

  // ── COMMAND CENTER ────────────────────────────────────────────────────────
  {
    id: 'command', label: 'Command', path: '/applications', icon: ShieldCheck, internal: true,
    children: [
      { label: 'Applications',  path: '/applications' },
      { label: 'Profit Engine', path: '/profit-engine' },
      { label: 'Clients',       path: '/clients' },
    ],
  },

  // ── AI INSIGHTS ───────────────────────────────────────────────────────────
  {
    id: 'ai-insights', label: 'AI Insights', path: '/ai-insights', icon: Brain,
    children: [
      { label: 'Overview',     path: '/ai-insights' },
      { label: 'Signals',      path: '/ai-insights/signals' },
      { label: 'Sentiment',    path: '/ai-insights/sentiment' },
      { label: 'Risk Score',   path: '/ai-insights/risk' },
      { label: 'Anomalies',    path: '/ai-insights/anomalies' },
      { label: 'AI Advisor',   path: '/ai-insights/advisor' },
      { label: 'Transactions', path: '/transactions' },
      { label: 'Watchlist',    path: '/watchlist' },
      { label: 'Settings',     path: '/settings' },
    ],
  },

  // ── AI CHAT ───────────────────────────────────────────────────────────────
  { id: 'ai-chat', label: 'AI Chat', path: '/ai-chat', icon: MessageSquare },

  // ── ADMIN ─────────────────────────────────────────────────────────────────
  {
    id: 'admin', label: 'Admin', path: '/admin', icon: ShieldCheck, internal: true,
    children: [
      { label: 'Overview',             path: '/admin' },
      { label: 'Product Management',   path: '/admin/products' },
      { label: 'User Management',      path: '/admin/users' },
      { label: 'System Logs',          path: '/admin/logs' },
      { label: 'Marketplace Controls', path: '/admin/marketplace' },
      { label: 'Telecom Controls',     path: '/admin/telecom' },
      { label: 'Treasury Controls',    path: '/admin/treasury' },
      { label: 'Risk Controls',        path: '/admin/risk' },
      { label: 'Deployments',          path: '/admin/deployments' },
    ],
  },
];