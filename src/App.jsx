import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AccessDenied from '@/components/shared/AccessDenied';
import { useRBAC } from '@/hooks/useRBAC';
import AppLayout from './components/layout/AppLayout';
import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// Main pages
import CommandCenter from './pages/CommandCenter';
import TelecomConsole from './pages/telecom/TelecomConsole';
import Portfolio from './pages/Portfolio';
import Transactions from './pages/Transactions';
import Watchlist from './pages/Watchlist';
import Settings from './pages/Settings';
import Marketplace from './pages/Marketplace';
import Admin from './pages/Admin';
import Wallet from './pages/Wallet';
import ElePhone from './pages/ElePhone';
import Telecom from './pages/Telecom';
import Identity from './pages/Identity';
import Hosting from './pages/Hosting';
import Developer from './pages/Developer';
import Treasury from './pages/Treasury';
import Yield from './pages/Yield';
import AI from './pages/AI';
import Platform from './pages/Platform';
import HFT from './pages/HFT';
import AIInsights from './pages/AIInsights';
import AIChat from './pages/AIChat';

// elePhone sub-pages
import Dialpad from './pages/elephone/Dialpad';
import Contacts from './pages/elephone/Contacts';
import CallHistory from './pages/elephone/CallHistory';
import SMS from './pages/elephone/SMS';
import DataMinutes from './pages/elephone/DataMinutes';
import TopUps from './pages/elephone/TopUps';
import SIMeSIM from './pages/elephone/SIMeSIM';

// Telecom sub-pages
import TelecomUsage from './pages/telecom/TelecomUsage';
import TelecomPlans from './pages/telecom/TelecomPlans';
import TelecomDevices from './pages/telecom/TelecomDevices';
import TelecomRegions from './pages/telecom/TelecomRegions';

// Identity sub-pages
import DigitalID from './pages/identity/DigitalID';
import KYC from './pages/identity/KYC';
import DocumentVault from './pages/identity/DocumentVault';
import AccessLogs from './pages/identity/AccessLogs';

// Hosting sub-pages
import Domains from './pages/hosting/Domains';
import DNS from './pages/hosting/DNS';
import Cloudflare from './pages/hosting/Cloudflare';
import Workers from './pages/hosting/Workers';
import SSL from './pages/hosting/SSL';

// Developer sub-pages
import APIKeys from './pages/developer/APIKeys';
import Webhooks from './pages/developer/Webhooks';
import Console from './pages/developer/Console';
import Logs from './pages/developer/Logs';
import SDKs from './pages/developer/SDKs';
import Blockchain from './pages/developer/Blockchain';

// Treasury sub-pages
import TreasuryBalance from './pages/treasury/TreasuryBalance';
import TreasuryAllocation from './pages/treasury/TreasuryAllocation';
import ProofOfCapital from './pages/treasury/ProofOfCapital';
import StripeConfig from './pages/treasury/StripeConfig';

// Yield sub-pages
import Staking from './pages/yield/Staking';
import Vaults from './pages/yield/Vaults';
import Rewards from './pages/yield/Rewards';

// AI sub-pages
import AICredits from './pages/ai/AICredits';
import AIModels from './pages/ai/AIModels';

// Platform sub-pages
import PlatformHealth from './pages/platform/PlatformHealth';
import FeatureFlags from './pages/platform/FeatureFlags';
import BaseIdentity from './pages/platform/BaseIdentity';

// HFT sub-pages
import HFTStrategies from './pages/hft/HFTStrategies';
import OrderBook from './pages/hft/OrderBook';
import LiveExecutions from './pages/hft/LiveExecutions';
import RiskControls from './pages/hft/RiskControls';
import HFTMetrics from './pages/hft/HFTMetrics';
import P2P from './pages/hft/P2P';
import HFTAnalytics from './pages/hft/Analytics';
import Applications from './pages/Applications';
import ProfitEngine from './pages/ProfitEngine';
import Clients from './pages/Clients';

// AI Insights sub-pages
import AIInsightsOverview from './pages/ai-insights/Overview';
import Signals from './pages/ai-insights/Signals';
import Sentiment from './pages/ai-insights/Sentiment';
import RiskScore from './pages/ai-insights/RiskScore';
import Anomalies from './pages/ai-insights/Anomalies';
import AIAdvisor from './pages/ai-insights/AIAdvisor';

// Platform sub-pages (overriding stubs)
import PlatformOS from './pages/platform/PlatformOS';

// Admin sub-pages
import AdminProductManagement from './pages/admin/AdminProductManagement';
import AdminOverview from './pages/admin/AdminOverview';
import UserManagement from './pages/admin/UserManagement';
import AdminSystemLogs from './pages/admin/AdminSystemLogs';
import Deployments from './pages/admin/Deployments';
import MarketplaceControls from './pages/admin/MarketplaceControls';
import RiskControlsAdmin from './pages/admin/RiskControlsAdmin';
import AdminTreasuryControls from './pages/admin/AdminTreasuryControls';
import AdminTelecomControls from './pages/admin/AdminTelecomControls';

// Marketplace sub-pages
import MarketplaceSub from './pages/sub/MarketplaceSub';
import MarketplacePreciousMetals from './pages/sub/MarketplacePreciousMetals';
import MarketplaceTelecom from './pages/sub/MarketplaceTelecom';
import MarketplaceIdentity from './pages/sub/MarketplaceIdentity';
import MarketplaceHosting from './pages/sub/MarketplaceHosting';
import MarketplaceDeveloper from './pages/sub/MarketplaceDeveloper';
import MarketplaceTreasury from './pages/sub/MarketplaceTreasury';
// Remaining placeholders
import TelecomSub from './pages/sub/TelecomSub';
import AISub from './pages/sub/AISub';
import PlatformSub from './pages/sub/PlatformSub';
import HFTSub from './pages/sub/HFTSub';
import AIInsightsSub from './pages/sub/AIInsightsSub';
import AdminSub from './pages/sub/AdminSub';

const REAL_HOLDINGS = [
  { symbol: 'BTC',   name: 'Bitcoin',  type: 'crypto',    quantity: 0.85,     avg_buy_price: 61000, current_price: 67200, change_24h: 2.4 },
  { symbol: 'ETH',   name: 'Ethereum', type: 'crypto',    quantity: 12.5,     avg_buy_price: 3100,  current_price: 3450,  change_24h: 3.1 },
  { symbol: 'SOL',   name: 'Solana',   type: 'crypto',    quantity: 1.285134, avg_buy_price: 95,    current_price: 142.5, change_24h: 5.2, walletAddress: 'Eida3teSJATMJW7BBqFZUKdrNXbr5ek7kGGftegBsxmp' },
  { symbol: 'BNB',   name: 'BNB',      type: 'crypto',    quantity: 8.2,      avg_buy_price: 580,   current_price: 612,   change_24h: 1.8 },
  { symbol: 'MATIC', name: 'Polygon',  type: 'crypto',    quantity: 15000,    avg_buy_price: 0.48,  current_price: 0.52,  change_24h: 4.5 },
  { symbol: 'PAXG',  name: 'PAX Gold', type: 'commodity', quantity: 0.008248, avg_buy_price: 1950,  current_price: 2380,  change_24h: 0.3, walletAddress: 'Eida3teSJATMJW7BBqFZUKdrNXbr5ek7kGGftegBsxmp' },
];

function useAssetSeeder() {
  useEffect(() => {
    if (localStorage.getItem('qv_seeded_v4')) return;
    const run = async () => {
      try {
        const existing = await base44.entities.Asset.list();
        await Promise.allSettled(existing.map(a => base44.entities.Asset.delete(a.id)));
        await Promise.all(REAL_HOLDINGS.map(h => base44.entities.Asset.create(h)));
      } catch (e) {
        console.error('Asset seed failed:', e);
      } finally {
        localStorage.setItem('qv_seeded_v4', '1');
      }
    };
    run();
  }, []);
}

function useUserHoldingsSeeder() {
  const { user, checkUserAuth } = useAuth();
  useEffect(() => {
    if (!user || localStorage.getItem('qv_user_holdings_v1')) return;
    const run = async () => {
      try {
        await base44.auth.updateMe({
          solana_wallet_address: 'Eida3teSJATMJW7BBqFZUKdrNXbr5ek7kGGftegBsxmp',
          tokens_balance: 1.285134,
          btc_balance: 0.85,
          paxg_balance: 0.008248,
          xrp_balance: 0,
        });
        await checkUserAuth();
      } catch (e) {
        console.error('User holdings seed failed:', e);
      } finally {
        localStorage.setItem('qv_user_holdings_v1', '1');
      }
    };
    run();
  }, [user]);
}

const AuthenticatedApp = () => {
  useAssetSeeder();
  useUserHoldingsSeeder();
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const { canAdmin } = useRBAC();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    if (authError.type === 'auth_required') { navigateToLogin(); return null; }
  }

  if (!canAdmin()) return <AccessDenied section="Command Center" />;

  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Main */}
        <Route path="/" element={<CommandCenter />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/telecom-console" element={<TelecomConsole />} />

        {/* Marketplace */}
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/marketplace/precious-metals" element={<MarketplacePreciousMetals />} />
        <Route path="/marketplace/telecom" element={<MarketplaceTelecom />} />
        <Route path="/marketplace/identity" element={<MarketplaceIdentity />} />
        <Route path="/marketplace/hosting" element={<MarketplaceHosting />} />
        <Route path="/marketplace/developer" element={<MarketplaceDeveloper />} />
        <Route path="/marketplace/treasury" element={<MarketplaceTreasury />} />
        <Route path="/marketplace/yield" element={<MarketplaceSub />} />
        <Route path="/marketplace/ai" element={<MarketplaceSub />} />
        <Route path="/marketplace/platform" element={<MarketplaceSub />} />

        {/* elePhone */}
        <Route path="/elephone" element={<ElePhone />} />
        <Route path="/elephone/dialpad" element={<Dialpad />} />
        <Route path="/elephone/contacts" element={<Contacts />} />
        <Route path="/elephone/call-history" element={<CallHistory />} />
        <Route path="/elephone/sms" element={<SMS />} />
        <Route path="/elephone/data" element={<DataMinutes />} />
        <Route path="/elephone/topups" element={<TopUps />} />
        <Route path="/elephone/sim" element={<SIMeSIM />} />

        {/* Telecom */}
        <Route path="/telecom" element={<Telecom />} />
        <Route path="/telecom/usage" element={<TelecomUsage />} />
        <Route path="/telecom/plans" element={<TelecomPlans />} />
        <Route path="/telecom/topups" element={<TelecomSub />} />
        <Route path="/telecom/devices" element={<TelecomDevices />} />
        <Route path="/telecom/regions" element={<TelecomRegions />} />

        {/* Identity */}
        <Route path="/identity" element={<Identity />} />
        <Route path="/identity/digital-id" element={<DigitalID />} />
        <Route path="/identity/kyc" element={<KYC />} />
        <Route path="/identity/documents" element={<DocumentVault />} />
        <Route path="/identity/access-logs" element={<AccessLogs />} />

        {/* Hosting */}
        <Route path="/hosting" element={<Hosting />} />
        <Route path="/hosting/domains" element={<Domains />} />
        <Route path="/hosting/dns" element={<DNS />} />
        <Route path="/hosting/cloudflare" element={<Cloudflare />} />
        <Route path="/hosting/workers" element={<Workers />} />
        <Route path="/hosting/ssl" element={<SSL />} />

        {/* Developer */}
        <Route path="/developer" element={<Developer />} />
        <Route path="/developer/api-keys" element={<APIKeys />} />
        <Route path="/developer/webhooks" element={<Webhooks />} />
        <Route path="/developer/console" element={<Console />} />
        <Route path="/developer/logs" element={<Logs />} />
        <Route path="/developer/sdks" element={<SDKs />} />
        <Route path="/developer/blockchain" element={<Blockchain />} />

        {/* Treasury */}
        <Route path="/treasury" element={<Treasury />} />
        <Route path="/treasury/balance" element={<TreasuryBalance />} />
        <Route path="/treasury/allocation" element={<TreasuryAllocation />} />
        <Route path="/treasury/proof" element={<ProofOfCapital />} />
        <Route path="/treasury/stripe" element={<StripeConfig />} />
        <Route path="/treasury/yield" element={<TelecomSub />} />

        {/* Yield */}
        <Route path="/yield" element={<Yield />} />
        <Route path="/yield/staking" element={<Staking />} />
        <Route path="/yield/vaults" element={<Vaults />} />
        <Route path="/yield/rewards" element={<Rewards />} />

        {/* AI / LLM */}
        <Route path="/ai" element={<AI />} />
        <Route path="/ai/credits" element={<AICredits />} />
        <Route path="/ai/usage" element={<AISub />} />
        <Route path="/ai/models" element={<AIModels />} />
        <Route path="/ai/logs" element={<AISub />} />

        {/* Platform */}
        <Route path="/platform" element={<Platform />} />
        <Route path="/platform/os" element={<PlatformOS />} />
        <Route path="/platform/identity" element={<BaseIdentity />} />
        <Route path="/platform/health" element={<PlatformHealth />} />
        <Route path="/platform/flags" element={<FeatureFlags />} />

        {/* HFT */}
        <Route path="/hft" element={<HFT />} />
        <Route path="/hft/strategies" element={<HFTStrategies />} />
        <Route path="/hft/orderbook" element={<OrderBook />} />
        <Route path="/hft/executions" element={<LiveExecutions />} />
        <Route path="/hft/risk" element={<RiskControls />} />
        <Route path="/hft/metrics" element={<HFTMetrics />} />
        <Route path="/hft/p2p" element={<P2P />} />
        <Route path="/hft/analytics" element={<HFTAnalytics />} />

        {/* Command Center */}
        <Route path="/applications" element={<Applications />} />
        <Route path="/profit-engine" element={<ProfitEngine />} />
        <Route path="/clients" element={<Clients />} />

        {/* AI Insights */}
        <Route path="/ai-insights" element={<AIInsights />} />
        <Route path="/ai-insights/overview" element={<AIInsightsOverview />} />
        <Route path="/ai-insights/signals" element={<Signals />} />
        <Route path="/ai-insights/sentiment" element={<Sentiment />} />
        <Route path="/ai-insights/risk" element={<RiskScore />} />
        <Route path="/ai-insights/anomalies" element={<Anomalies />} />
        <Route path="/ai-insights/advisor" element={<AIAdvisor />} />

        {/* AI Chat */}
        <Route path="/ai-chat" element={<AIChat />} />

        {/* Admin */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/overview" element={<AdminOverview />} />
        <Route path="/admin/products" element={<AdminProductManagement />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/logs" element={<AdminSystemLogs />} />
        <Route path="/admin/marketplace" element={<MarketplaceControls />} />
        <Route path="/admin/telecom" element={<AdminTelecomControls />} />
        <Route path="/admin/treasury" element={<AdminTreasuryControls />} />
        <Route path="/admin/risk" element={<RiskControlsAdmin />} />
        <Route path="/admin/deployments" element={<Deployments />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;