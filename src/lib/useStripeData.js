import { useQuery } from '@tanstack/react-query';

const API_KEY = import.meta.env.VITE_STRIPE_SECRET_KEY;

export const hasStripeCreds = () => !!API_KEY;

async function stripeFetch(path) {
  if (!API_KEY) throw new Error('STRIPE_MISSING');
  const res = await fetch(`https://quantumvaultsolutions.com/api${path}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Stripe ${res.status}`);
  return res.json();
}

export function useStripeBalance() {
  return useQuery({
    queryKey: ['stripe-balance'],
    queryFn: () => stripeFetch('/stripe/balance'),
    enabled: !!API_KEY,
    refetchInterval: 30000,
    retry: 1,
  });
}