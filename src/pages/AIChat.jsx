import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRBAC } from '@/hooks/useRBAC';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User } from 'lucide-react';
import { useOracleDashboard } from '@/lib/useOracleData';

const FAQ = [
  { keywords: ['portfolio value', 'total value', 'worth', 'holdings value'], answer: (assets, prices) => {
    const total = assets.reduce((s, a) => s + (a.quantity || 0) * (prices?.[a.symbol] || a.current_price || 0), 0);
    return `Your portfolio is currently valued at $${total.toFixed(2)} based on live Oracle prices and your ${assets.length} holdings.`;
  }},
  { keywords: ['sol price', 'solana price', 'sol cost'], answer: (assets, prices) => `SOL current price: $${prices?.SOL?.toFixed(2) || 'fetching...'} (from Oracle API at app.youthballot.org).` },
  { keywords: ['paxg', 'pax gold', 'gold token'], answer: () => 'PAXG (PAX Gold) is a gold-backed ERC-20 token. Each token represents one troy ounce of physical gold stored in Brinks vaults. It provides digital exposure to gold price movements.' },
  { keywords: ['qgg', 'qsg', 'qob', 'qow', 'omega'], answer: () => 'QGG = Quantum Gold Guard (gold-backed reserve), QSG = Quantum Sovereign Guard (protocol governance), QOB = Quantum Oracle Bond (yield-bearing), QOW = Quantum Oracle Warrant (options-like). These are the core Omega Protocol instruments.' },
  { keywords: ['add holding', 'add asset', 'track asset', 'new holding'], answer: () => 'To add a holding: Go to Wallet (sidebar) → click "Add Holding" → enter the asset symbol, quantity, and purchase price. Holdings are stored in the Asset entity and reflected across Portfolio, Wallet, and AI Insights.' },
  { keywords: ['real', 'real money', 'real funds', 'my money'], answer: () => 'The portfolio tracks real asset balances from your connected wallet (Solana RPC) and manually added holdings. Oracle prices are fetched live. HFT Engine is PAPER TRADING ONLY — no real orders are placed.' },
  { keywords: ['oracle', 'how does oracle', 'price feed', 'oracle work'], answer: () => 'The Oracle API (https://app.youthballot.org/api/prices) provides live price feeds for SOL, PAXG, and other assets. It also provides system health and VPS telemetry. Prices refresh every 30s.' },
  { keywords: ['hft', 'high frequency', 'trading engine', 'strategies'], answer: () => 'The HFT Engine is a paper trading simulation module. It lets you create and backtest strategies (Arbitrage, Market Making, etc.) without placing real orders. All trades are labeled PAPER and no real capital is deployed.' },
];

function matchFAQ(input, assets, prices) {
  const lower = input.toLowerCase();
  for (const faq of FAQ) {
    if (faq.keywords.some(kw => lower.includes(kw))) {
      return typeof faq.answer === 'function' ? faq.answer(assets, prices) : faq.answer;
    }
  }
  return null;
}

export default function AIChat() {
  const { user } = useRBAC();
  const { data: oracleData, isLoading: pricesLoading } = useOracleDashboard();
  const prices = oracleData ? { SOL: oracleData.sol_usd, BTC: oracleData.btc_usd, ETH: oracleData.eth_usd, PAXG: oracleData.gold_usd } : {};
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I\'m your Omega Protocol assistant. I can answer questions about your portfolio, Oracle prices, PAXG, QGG/QSG/QOB/QOW, and the HFT Engine. Ask me anything!' }
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef();

  const { data: assets = [] } = useQuery({
    queryKey: ['assets'],
    queryFn: () => base44.entities.Asset.list(),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    const matched = matchFAQ(input, assets, prices);
    const totalValue = assets.reduce((s, a) => s + (a.quantity || 0) * (prices?.[a.symbol] || a.current_price || 0), 0);
    const reply = matched || `I don't have a specific answer for that. Visit the relevant page for live data. Current portfolio total: $${totalValue.toFixed(2)} (${assets.length} assets). Oracle: ${pricesLoading ? 'fetching...' : 'connected'}. Note: AI responses are data-driven insights, not live AI generation.`;
    setMessages(prev => [...prev, userMsg, { role: 'assistant', text: reply }]);
    setInput('');
  };

  const totalValue = assets.reduce((s, a) => s + (a.quantity || 0) * (prices?.[a.symbol] || a.current_price || 0), 0);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-56 shrink-0 border-r border-border bg-card p-4 space-y-4 hidden lg:block">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Context</p>
        <div className="space-y-2">
          <div className="rounded-lg bg-background border border-border p-3">
            <p className="text-xs text-muted-foreground">Portfolio</p>
            <p className="text-sm font-bold">${totalValue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{assets.length} assets</p>
          </div>
          <div className="rounded-lg bg-background border border-border p-3">
            <p className="text-xs text-muted-foreground">Oracle</p>
            <Badge className={pricesLoading ? 'bg-yellow-500/20 text-yellow-400' : 'bg-accent/20 text-accent'} style={{ fontSize: '10px' }}>
              {pricesLoading ? 'Fetching...' : 'Connected'}
            </Badge>
          </div>
          {prices?.SOL && <div className="rounded-lg bg-background border border-border p-3">
            <p className="text-xs text-muted-foreground">SOL</p>
            <p className="text-sm font-bold">${prices.SOL.toFixed(2)}</p>
          </div>}
        </div>
        <p className="text-[10px] text-muted-foreground">AI responses are data-driven insights, not live AI generation.</p>
      </div>

      {/* Chat */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Bot className="w-5 h-5 text-primary" />
          <p className="font-medium text-sm">Omega Assistant</p>
          <Badge variant="outline" className="text-xs ml-auto">Data-driven · Not live AI</Badge>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-primary" /></div>}
              <div className={`rounded-2xl px-4 py-2.5 max-w-[80%] text-sm leading-relaxed ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'}`}>
                {m.text}
              </div>
              {m.role === 'user' && <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0"><User className="w-4 h-4" /></div>}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t border-border flex gap-2">
          <input
            className="flex-1 bg-input border border-border rounded-xl px-4 py-2.5 text-sm"
            placeholder="Ask about your portfolio, SOL price, PAXG, HFT engine..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
          />
          <Button size="icon" onClick={send} disabled={!input.trim()}><Send className="w-4 h-4" /></Button>
        </div>
      </div>
    </div>
  );
}