const WORKER = 'https://quantum-vault-api-production.securecitizenfoundation.workers.dev';
const API_KEY = 'qv_live_d54cf7079c6c809ba2d0378839559e2d';

async function request(method, path, body) {
  const res = await fetch(`${WORKER}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
  return data;
}

export const simApi = {
  list: () => request('GET', '/api/sim/list'),
  activate: (deviceId) => request('POST', '/api/sim/activate', { device_id: deviceId }),
  deactivate: (deviceId) => request('POST', '/api/sim/deactivate', { device_id: deviceId }),
  suspend: (deviceId) => request('POST', '/api/sim/suspend', { device_id: deviceId }),
};

export const kycApi = {
  forceApprove: (clientId) => request('POST', '/api/client/force-approve-kyc', { client_id: clientId }),
};

export const walletApi = {
  issueCard: (clientId) => request('POST', '/api/client/issue-card', { client_id: clientId }),
  splitTrade: (grossPnl) => request('POST', '/api/trades/split', { gross_pnl: grossPnl }),
  listSplits: () => request('GET', '/api/trades/splits'),
};

export const rpcApi = {
  spawn: (clientId, chain) => request('POST', '/api/rpc/spawn', { client_id: clientId, chain }),
};

export const engineApi = {
  health: () => request('GET', '/api/brain/health'),
};