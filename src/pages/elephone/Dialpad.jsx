import React, { useState } from 'react';
import { Phone, Delete } from 'lucide-react';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { useTwilioNumbers, hasTwilioCreds } from '@/lib/useTwilioData';
import ConnectCard from '@/components/shared/ConnectCard';
import { Badge } from '@/components/ui/badge';

const KEYS = [
  ['1', ''], ['2', 'ABC'], ['3', 'DEF'],
  ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'],
  ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'],
  ['*', ''], ['0', '+'], ['#', ''],
];

export default function Dialpad() {
  const { canView } = useRBAC();
  const [display, setDisplay] = useState('');
  const [calling, setCalling] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState('');
  const { data: numbers = {} } = useTwilioNumbers();
  const hasCreds = hasTwilioCreds();

  if (!canView('telecom')) return <AccessDenied section="Dialpad" />;

  const numberList = numbers.incoming_phone_numbers || [];
  const press = (digit) => setDisplay(d => d + digit);
  const backspace = () => setDisplay(d => d.slice(0, -1));
  const call = () => {
    if (!display || !selectedNumber) return;
    setCalling(true);
    setTimeout(() => setCalling(false), 3000);
  };

  return (
    <div className="max-w-xs mx-auto space-y-6 pt-4">
      <div>
        <h1 className="text-2xl font-bold">Dialpad</h1>
        <p className="text-xs text-muted-foreground mt-1">elePhone · Sovereign Telecom</p>
      </div>

      {!hasCreds && <ConnectCard service="Twilio" instructions="Configure Twilio credentials" />}

      {hasCreds && numberList.length === 0 && (
        <div className="rounded-xl border border-dashed border-muted-foreground/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">No Twilio numbers found</p>
        </div>
      )}

      {hasCreds && numberList.length > 0 && (
        <div>
          <label className="text-xs font-semibold block mb-2">From Number</label>
          <select value={selectedNumber} onChange={e => setSelectedNumber(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground mb-4">
            <option value="">Select number...</option>
            {numberList.map(n => (
              <option key={n.sid} value={n.phone_number}>{n.phone_number} ({n.friendly_name})</option>
            ))}
          </select>
        </div>
      )}

      {/* Display */}
      <div className="bg-card border border-border rounded-2xl px-6 py-5 text-center">
        <div className="text-3xl font-mono font-light tracking-widest min-h-[2.5rem] text-foreground">
          {display || <span className="text-muted-foreground/40">Enter number</span>}
        </div>
        {calling && (
          <div className="text-xs text-accent mt-2 animate-pulse">Calling...</div>
        )}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3">
        {KEYS.map(([digit, sub]) => (
          <button
            key={digit}
            onClick={() => press(digit)}
            className="bg-card border border-border rounded-xl py-4 flex flex-col items-center hover:bg-secondary/60 active:scale-95 transition-all"
          >
            <span className="text-xl font-semibold text-foreground">{digit}</span>
            {sub && <span className="text-[9px] text-muted-foreground tracking-widest mt-0.5">{sub}</span>}
          </button>
        ))}
      </div>

      {/* Action Row */}
      <div className="flex items-center gap-3">
        <button
          onClick={call}
          className="flex-1 bg-accent text-accent-foreground rounded-xl py-4 flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all font-semibold"
        >
          <Phone className="w-5 h-5" />
          Call
        </button>
        <button
          onClick={backspace}
          className="w-14 h-14 bg-card border border-border rounded-xl flex items-center justify-center hover:bg-secondary/60 active:scale-95 transition-all"
        >
          <Delete className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}