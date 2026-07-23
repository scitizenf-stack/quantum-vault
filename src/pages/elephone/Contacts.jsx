import React, { useState } from 'react';
import { Search, Phone, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';

const DEMO_CONTACTS = [
  { name: 'Nehemie Destine', number: '+1 (305) 847-2291', last: '2 hours ago', initials: 'ND', color: 'bg-primary' },
  { name: 'Alex Mercer', number: '+1 (212) 555-0142', last: 'Yesterday', initials: 'AM', color: 'bg-purple-500' },
  { name: 'Sophia Laurent', number: '+33 6 12 34 56 78', last: '3 days ago', initials: 'SL', color: 'bg-pink-500' },
  { name: 'Carlos Vega', number: '+52 55 1234 5678', last: 'Last week', initials: 'CV', color: 'bg-orange-500' },
  { name: 'Kai Nakamura', number: '+81 90-1234-5678', last: '2 weeks ago', initials: 'KN', color: 'bg-cyan-500' },
  { name: 'Amara Osei', number: '+233 20 123 4567', last: 'May 14', initials: 'AO', color: 'bg-green-600' },
  { name: 'Ivan Petrov', number: '+7 495 123-45-67', last: 'May 10', initials: 'IP', color: 'bg-red-500' },
  { name: 'Leila Hassan', number: '+971 50 123 4567', last: 'May 7', initials: 'LH', color: 'bg-yellow-600' },
  { name: 'Marcus Webb', number: '+44 7911 123456', last: 'Apr 30', initials: 'MW', color: 'bg-indigo-500' },
  { name: 'Zara Kimani', number: '+254 712 345678', last: 'Apr 22', initials: 'ZK', color: 'bg-teal-500' },
];

export default function Contacts() {
  const { canView } = useRBAC();
  const [search, setSearch] = useState('');
  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact?.list?.() || Promise.resolve([]),
  });

  if (!canView('telecom')) return <AccessDenied section="Contacts" />;

  const list = contacts.length > 0 ? contacts : DEMO_CONTACTS;
  const filtered = list.filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || c.number || '').includes(search)
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Contacts</h1>
        <p className="text-xs text-muted-foreground mt-1">{list.length} contacts</p>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>
      <div className="space-y-1">
        {filtered.map(c => (
          <div key={c.name} className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-card border border-transparent hover:border-border transition-all group">
            <div className={`w-10 h-10 rounded-full ${c.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
              {c.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.number}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">{c.last}</p>
              <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                <button className="p-1 rounded-md hover:bg-primary/10 text-primary"><Phone className="w-3.5 h-3.5" /></button>
                <button className="p-1 rounded-md hover:bg-primary/10 text-primary"><MessageSquare className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}