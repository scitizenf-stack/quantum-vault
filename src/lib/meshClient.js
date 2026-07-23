/**
 * Omega Protocol v4 — Sovereign Mesh API Client
 * API_BASE: https://mesh.quantumvaultsolutions.com
 * All fetch calls are bound to the same Sovereign Root Identity.
 */

const API_BASE       = 'https://api.quantumvaultsolutions.com';
const V1_BASE        = 'https://api.quantumvaultsolutions.com/v1';
const API_KEY        = import.meta.env.VITE_OMEGA_API_KEY;

export const SOVEREIGN_WALLET = {
  address:  'Eida3teSJATMJW7BBqFZUKdrNXbr5ek7kGGftegBsxmp',
  balances: {
    SOL:  { amount: 121.75, symbol: 'SOL',  label: 'Solana' },
    PAXG: { amount:  38.53, symbol: 'PAXG', label: 'PAX Gold' },
  },
};

async function v1Fetch(path, options = {}) {
  const res = await fetch(`${V1_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type':     'application/json',
      'Authorization':    `Bearer ${API_KEY}`,
      'X-Sovereign-Root': 'quantum-vault-v4',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`QV API ${res.status}: ${res.statusText} [${path}]`);
  return res.json();
}

async function meshFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type':    'application/json',
      'Authorization':   `Bearer ${API_KEY}`,
      'X-Sovereign-Root': 'quantum-vault-v4',
      'X-Wallet-Address': SOVEREIGN_WALLET.address,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`Mesh API ${res.status}: ${res.statusText} [${path}]`);
  return res.json();
}

export const meshApi = {

  // ── Sovereign Dashboard ────────────────────────────────────────────────────
  getDashboard:     () => meshFetch('/api/dashboard'),

  // ── Economy & Proof-of-Capital ─────────────────────────────────────────────
  getEconomy:        () => meshFetch('/system/economy'),
  getProofOfCapital: () => meshFetch('/mesh/proof-of-capital'),

  // ── Briefings ─────────────────────────────────────────────────────────────
  getBriefHistory: () => meshFetch('/api/briefs/history'),

  // ── Portfolio / Wallet ─────────────────────────────────────────────────────
  getPortfolio: () => meshFetch('/api/portfolio'),
  getWallet:    () => meshFetch('/api/wallet'),

  // ── Transactions ──────────────────────────────────────────────────────────
  getTransactions: ()     => meshFetch('/api/transactions'),
  addTransaction:  (data) => meshFetch('/api/transactions', { method: 'POST', body: JSON.stringify(data) }),

  // ── Marketplace ───────────────────────────────────────────────────────────
  getProducts:   () => meshFetch('/api/marketplace'),
  getCategories: () => meshFetch('/api/marketplace/categories'),

  // ── Telecom / elePhone ────────────────────────────────────────────────────
  getTelecom:  () => meshFetch('/api/telecom'),
  getElePhone: () => meshFetch('/api/elephone'),

  // ── Admin CRUD ────────────────────────────────────────────────────────────
  adminGetProducts:   ()         => meshFetch('/api/admin/products'),
  adminCreateProduct: (data)     => meshFetch('/api/admin/products',       { method: 'POST',   body: JSON.stringify(data) }),
  adminUpdateProduct: (id, data) => meshFetch(`/api/admin/products/${id}`, { method: 'PUT',    body: JSON.stringify(data) }),
  adminDeleteProduct: (id)       => meshFetch(`/api/admin/products/${id}`, { method: 'DELETE' }),
  adminGetUsers:      ()         => meshFetch('/api/admin/users'),
  adminGetLogs:       ()         => meshFetch('/api/admin/logs'),

  // ── System ────────────────────────────────────────────────────────────────
  getSystemHealth: () => meshFetch('/system/health'),

  // ── Mesh Internals ─────────────────────────────────────────────────────────
  getMeshRpc:        () => meshFetch('/mesh/rpc'),
  getMeshMpc:        () => meshFetch('/mesh/mpc'),
  getMeshJito:       () => meshFetch('/mesh/jito'),
  getMeshScanners:   () => meshFetch('/mesh/scanners'),
  getMeshRebalancer: () => meshFetch('/mesh/rebalancer'),

  // ── HFT Control Layer ─────────────────────────────────────────────────────
  hftGetStatus:      ()           => meshFetch('/api/hft/status'),
  hftGetStrategies:  ()           => meshFetch('/api/hft/strategies'),
  hftToggleStrategy: (id, active) => meshFetch(`/api/hft/strategies/${id}/toggle`, { method: 'POST', body: JSON.stringify({ active }) }),
  hftUpdateParams:   (id, params) => meshFetch(`/api/hft/strategies/${id}/params`, { method: 'PUT',  body: JSON.stringify(params) }),
  hftGetMetrics:     ()           => meshFetch('/api/hft/metrics'),
  hftEmergencyStop:  ()           => meshFetch('/api/hft/emergency-stop', { method: 'POST' }),
  hftResumeAll:      ()           => meshFetch('/api/hft/resume',         { method: 'POST' }),
  hftGetExecutions:  ()           => meshFetch('/api/hft/executions'),

  // ── AI Insights ───────────────────────────────────────────────────────────
  aiGetInsights:  ()       => meshFetch('/api/ai/insights'),
  aiGetSignals:   ()       => meshFetch('/api/ai/signals'),
  aiGetRiskScore: ()       => meshFetch('/api/ai/risk-score'),
  aiGetForecast:  (symbol) => meshFetch(`/api/ai/forecast/${symbol}`),
  aiGetSentiment: ()       => meshFetch('/api/ai/sentiment'),
  aiGetAnomalies: ()       => meshFetch('/api/ai/anomalies'),
  aiChat:         (msg)    => meshFetch('/api/ai/chat', { method: 'POST', body: JSON.stringify({ message: msg }) }),

  // ── Settings ──────────────────────────────────────────────────────────────
  getToggles:  ()     => meshFetch('/api/settings/toggles'),
  saveToggles: (data) => meshFetch('/api/settings/toggles', { method: 'POST', body: JSON.stringify(data) }),

  // ── Notifications ─────────────────────────────────────────────────────────
  getNotifications:  ()     => meshFetch('/api/settings/notifications'),
  saveNotifications: (data) => meshFetch('/api/settings/notifications', { method: 'POST', body: JSON.stringify(data) }),

  // ── Watchlist ─────────────────────────────────────────────────────────────
  getWatchlist:        ()         => meshFetch('/api/watchlist'),
  addWatchlistItem:    (data)     => meshFetch('/api/watchlist',       { method: 'POST',   body: JSON.stringify(data) }),
  deleteWatchlistItem: (id)       => meshFetch(`/api/watchlist/${id}`, { method: 'DELETE' }),
  updateWatchlistItem: (id, data) => meshFetch(`/api/watchlist/${id}`, { method: 'PUT',    body: JSON.stringify(data) }),

  // ── Portfolio mutations ────────────────────────────────────────────────────
  addAsset:    (data) => meshFetch('/api/portfolio',       { method: 'POST',   body: JSON.stringify(data) }),
  deleteAsset: (id)   => meshFetch(`/api/portfolio/${id}`, { method: 'DELETE' }),

  // ── Cart ──────────────────────────────────────────────────────────────────
  getCart:        ()     => meshFetch('/api/cart'),
  addToCart:      (data) => meshFetch('/api/cart',       { method: 'POST',   body: JSON.stringify(data) }),
  removeFromCart: (id)   => meshFetch(`/api/cart/${id}`, { method: 'DELETE' }),
  clearCart:      ()     => meshFetch('/api/cart',       { method: 'DELETE' }),

  // ── Analytics ─────────────────────────────────────────────────────────────
  getAnalytics:           () => meshFetch('/api/analytics'),
  getAnalyticsPortfolio:  () => meshFetch('/api/analytics/portfolio'),
  getAnalyticsMarketplace:() => meshFetch('/api/analytics/marketplace'),
  getAnalyticsTelecom:    () => meshFetch('/api/analytics/telecom'),
  getAnalyticsAI:         () => meshFetch('/api/analytics/ai'),
  getAnalyticsTreasury:   () => meshFetch('/api/analytics/treasury'),
  getAnalyticsGrowth:     () => meshFetch('/api/analytics/growth'),
  getAnalyticsGeo:        () => meshFetch('/api/analytics/geo'),

  // ── Security ──────────────────────────────────────────────────────────────
  getSecurityLogs:   ()   => meshFetch('/api/security/logs'),
  getSecurityEvents: ()   => meshFetch('/api/security/events'),
  getSecurityFlags:  ()   => meshFetch('/api/security/flags'),
  getSessions:       ()   => meshFetch('/api/auth/sessions'),
  revokeSession:     (id) => meshFetch(`/api/auth/sessions/${id}`, { method: 'DELETE' }),

  // ── QV v1 Endpoints (live KPI data) ──────────────────────────────────────
  v1PortfolioSummary: () => v1Fetch('/portfolio/summary'),
  v1HftStatus:        () => v1Fetch('/hft/status'),
  v1TelecomUsage:     () => v1Fetch('/telecom/usage'),
  v1TreasuryBalance:  () => v1Fetch('/treasury/balance'),
  v1SystemHealth:     () => v1Fetch('/system/health'),

  // ── System Logs ───────────────────────────────────────────────────────────
  getLogsSystem:   () => meshFetch('/api/logs/system'),
  getLogsTrading:  () => meshFetch('/api/logs/trading'),
  getLogsSecurity: () => meshFetch('/api/logs/security'),
  getLogsApi:      () => meshFetch('/api/logs/api'),

  // ── Social ────────────────────────────────────────────────────────────────
  getSocialPosts:      () => meshFetch('/api/social/posts'),
  getSocialEngagement: () => meshFetch('/api/social/engagement'),

  // ── Automations ───────────────────────────────────────────────────────────
  getAutomations: ()   => meshFetch('/api/automations'),
  runAutomation:  (id) => meshFetch(`/api/automations/${id}/run`, { method: 'POST' }),

  // ── Identity / KYC ────────────────────────────────────────────────────────
  getIdentity:   () => meshFetch('/api/identity'),
  getKyc:        () => meshFetch('/api/identity/kyc'),
  getDocuments:  () => meshFetch('/api/identity/documents'),
  getAccessLogs: () => meshFetch('/api/identity/access-logs'),

  // ── Developer / API Keys ──────────────────────────────────────────────────
  getApiKeys:    () => meshFetch('/api/developer/keys'),
  getWebhooks:   () => meshFetch('/api/developer/webhooks'),
  getConsoleLogs:() => meshFetch('/api/developer/console'),
  getSdkInfo:    () => meshFetch('/api/developer/sdk'),

  // ── Hosting / Infrastructure ──────────────────────────────────────────────
  getDomains:      () => meshFetch('/api/hosting/domains'),
  getDnsRecords:   () => meshFetch('/api/hosting/dns'),
  getCloudflare:   () => meshFetch('/api/hosting/cloudflare'),
  getWorkers:      () => meshFetch('/api/hosting/workers'),
  getSslCerts:     () => meshFetch('/api/hosting/ssl'),

  // ── Platform / Feature Flags ──────────────────────────────────────────────
  getFeatureFlags:   ()         => meshFetch('/api/platform/flags'),
  toggleFeatureFlag: (id, val)  => meshFetch(`/api/platform/flags/${id}`, { method: 'PUT', body: JSON.stringify({ enabled: val }) }),
  getPlatformInfo:   ()         => meshFetch('/api/platform/info'),
};

/**
 * Sovereign WebSocket stream
 */
export function meshStream(onMessage, onStatusChange) {
  const ws = new WebSocket(
    `wss://mesh.quantumvaultsolutions.com/api/ws/stream?token=${API_KEY}`
  );
  ws.onopen    = () => onStatusChange?.('live');
  ws.onmessage = (e) => { try { onMessage(JSON.parse(e.data)); } catch {} };
  ws.onerror   = () => onStatusChange?.('error');
  ws.onclose   = () => onStatusChange?.('reconnecting');
  return ws;
}