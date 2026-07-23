import { useState, useEffect, useRef } from 'react';

const ENDPOINT = 'https://app.youthballot.org/api/omega/status';
const API_KEY = 'qv_live_d54cf7079c6c809ba2d0378839559e2d';
const POLL_MS = 10000;

// Simulate realistic scan data based on OMEGA runbook specs
let _simScans = [];
let _simStrikes = 0;
let _simScansTotal = 0;
let _lastStrikeTs = null;
let _simInterval = null;

function generateScan() {
  const r = Math.random();
  const ts = new Date();
  _simScansTotal++;
  if (r > 0.92) {
    // STRIKE — profitable
    const spread = +(1.0 + Math.random() * 1.0).toFixed(3);
    _simStrikes++;
    _lastStrikeTs = ts;
    return { ts, pair: 'SOL/USDC', spread, status: 'STRIKE' };
  } else if (r > 0.55) {
    // GATE PASS — above gate but not profitable enough for atomic bundle
    const spread = +(0.560 + Math.random() * 0.3).toFixed(3);
    return { ts, pair: 'SOL/USDC', spread, status: 'GATE PASS' };
  } else {
    // BELOW GATE
    const spread = +(-0.5 + Math.random() * 0.45).toFixed(3);
    return { ts, pair: 'SOL/USDC', spread, status: 'BELOW GATE' };
  }
}

function startSimulation(onScan) {
  if (_simInterval) return;
  _simInterval = setInterval(() => {
    const scan = generateScan();
    _simScans = [scan, ..._simScans].slice(0, 20);
    onScan([..._simScans], _simStrikes, _simScansTotal, _lastStrikeTs);
  }, 250);
}

function stopSimulation() {
  if (_simInterval) { clearInterval(_simInterval); _simInterval = null; }
}

export function useOmegaStatus() {
  const [status, setStatus] = useState(null);
  const [scans, setScans] = useState([]);
  const [strikes, setStrikes] = useState(0);
  const [scanCount, setScanCount] = useState(0);
  const [lastStrikeTs, setLastStrikeTs] = useState(null);
  const [liveStatus, setLiveStatus] = useState('connecting'); // 'live' | 'simulated' | 'connecting'
  const pollRef = useRef(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch(ENDPOINT, {
        headers: { 'X-API-Key': API_KEY },
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStatus(data);
      setLiveStatus('live');
      stopSimulation();
    } catch {
      setStatus(null);
      setLiveStatus('simulated');
      // fallback to simulation
      startSimulation((s, str, total, lastStrike) => {
        setScans(s);
        setStrikes(str);
        setScanCount(total);
        setLastStrikeTs(lastStrike);
      });
    }
  };

  useEffect(() => {
    fetchStatus();
    pollRef.current = setInterval(fetchStatus, POLL_MS);
    return () => {
      clearInterval(pollRef.current);
      stopSimulation();
    };
  }, []);

  return { status, scans, strikes, scanCount, lastStrikeTs, liveStatus };
}