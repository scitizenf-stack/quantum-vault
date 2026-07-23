import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRBAC } from '@/hooks/useRBAC';
import AccessDenied from '@/components/shared/AccessDenied';
import { toast } from 'sonner';
import CommandTopBar from '@/components/hft/CommandTopBar';
import StrategyManager from '@/components/hft/StrategyManager';
import NewStrategyModal from '@/components/hft/NewStrategyModal';
import LiveTradeFeed from '@/components/hft/LiveTradeFeed';
import RiskAnalytics from '@/components/hft/RiskAnalytics';
import ElePhoneIntegration from '@/components/hft/ElePhoneIntegration';

export default function HFT() {
  const { canView } = useRBAC();
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const { data: strategies = [], isLoading } = useQuery({
    queryKey: ['hft-strategies'],
    queryFn: () => base44.entities.Strategy.list(),
    refetchInterval: 10000,
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Strategy.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hft-strategies'] }),
  });

  const createMut = useMutation({
    mutationFn: data => base44.entities.Strategy.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['hft-strategies'] }); setShowNew(false); toast.success('Strategy created'); },
  });

  const stopAllMut = useMutation({
    mutationFn: () => Promise.all(
      strategies.filter(s => s.status !== 'STOPPED').map(s => base44.entities.Strategy.update(s.id, { status: 'STOPPED' }))
    ).then(() => base44.entities.AccessLog.create({ action: 'EMERGENCY_STOP_ALL', status: 'success', device: 'Command Center' })),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['hft-strategies'] }); toast.error('EMERGENCY STOP — all strategies halted'); },
  });

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') { e.preventDefault(); setShowNew(true); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!canView('hft')) return <AccessDenied section="HFT Engine" />;

  const handleToggle = (s) => {
    const next = s.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    toggleMut.mutate({ id: s.id, status: next });
    toast.info(`${s.name} → ${next}`);
  };

  return (
    <div className="p-4 space-y-4">
      <CommandTopBar strategies={strategies} onEmergencyStop={() => stopAllMut.mutate()} stopping={stopAllMut.isPending} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div><StrategyManager strategies={strategies} isLoading={isLoading} selectedId={selectedId} onSelect={setSelectedId} onToggle={handleToggle} onNew={() => setShowNew(true)} /></div>
        <div><LiveTradeFeed /></div>
        <div><RiskAnalytics strategies={strategies} onKillStrategy={(s) => { toggleMut.mutate({ id: s.id, status: 'STOPPED' }); toast.error(`Killed ${s.name}`); }} /></div>
      </div>

      <ElePhoneIntegration />

      <NewStrategyModal open={showNew} onClose={() => setShowNew(false)} onSave={(data) => createMut.mutate(data)} />
    </div>
  );
}