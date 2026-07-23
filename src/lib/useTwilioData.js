import { useQuery } from '@tanstack/react-query';

const SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
const TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN;

export const hasTwilioCreds = () => !!(SID && TOKEN);

function twilioAuth() {
  return 'Basic ' + btoa(`${SID}:${TOKEN}`);
}

async function twilioFetch(path) {
  if (!SID || !TOKEN) throw new Error('TWILIO_MISSING');
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${SID}${path}`, {
    headers: { Authorization: twilioAuth() },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Twilio ${res.status}`);
  return res.json();
}

export function useTwilioUsage() {
  return useQuery({
    queryKey: ['twilio-usage'],
    queryFn: () => twilioFetch('/Usage/Records/ThisMonth.json?PageSize=100'),
    refetchInterval: 30000,
    retry: 1,
  });
}

export function useTwilioCalls() {
  return useQuery({
    queryKey: ['twilio-calls'],
    queryFn: () => twilioFetch('/Calls.json?PageSize=50'),
    refetchInterval: 30000,
    retry: 1,
  });
}

export function useTwilioMessages() {
  return useQuery({
    queryKey: ['twilio-messages'],
    queryFn: () => twilioFetch('/Messages.json?PageSize=50'),
    refetchInterval: 30000,
    retry: 1,
  });
}

export function useTwilioNumbers() {
  return useQuery({
    queryKey: ['twilio-numbers'],
    queryFn: () => twilioFetch('/IncomingPhoneNumbers.json'),
    refetchInterval: 30000,
    retry: 1,
  });
}

export function useTwilioAccount() {
  return useQuery({
    queryKey: ['twilio-account'],
    queryFn: () => twilioFetch('.json'),
    refetchInterval: 30000,
    retry: 1,
  });
}