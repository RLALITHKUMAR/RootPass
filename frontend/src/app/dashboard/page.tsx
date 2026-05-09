'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from 'framer-motion';
import { BarChart3, Shield, XCircle, CheckCircle, RefreshCw, ExternalLink, Activity, Database, Globe, Layers, Search, Terminal } from 'lucide-react';
import { listCredentials, listIssuers, getLatestRoot } from '@/lib/api';
import Link from 'next/link';
import MiniCredential3DCard from '@/components/MiniCredential3DCard';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

// ── Spotlight Card Component ──
function StatCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: number | string; icon: any; color: string; sub?: string;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div 
      variants={fadeUpVariant} 
      onMouseMove={handleMouseMove}
      className="relative p-6 rounded-3xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-md overflow-hidden group hover:border-indigo-500/30 transition-all duration-500"
    >
      {/* Spotlight Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100 z-0"
        style={{
          background: useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, ${color}15, transparent 80%)`,
        }}
      />
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: color }}></div>
      <div className="flex items-center gap-5 relative z-10">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-slate-800/80 border border-slate-700/50 group-hover:scale-110 transition-transform duration-500 shadow-inner">
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div>
          <div className="text-3xl font-black text-white tracking-tight">{value}</div>
          <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold mt-1">{label}</div>
          {sub && <div className="text-xs text-slate-500 mt-1.5 mono">{sub}</div>}
        </div>
      </div>
    </motion.div>
  );
}

// ── Ticker Component ──
function LiveTicker() {
  const [messages, setMessages] = useState<string[]>([
    '🔵 RootPass Engine Initialized',
  ]);

  useEffect(() => {
    const events = [
      '🟢 Credential anchored to Sepolia',
      '✅ Proof Verified in New York',
      '🟢 New Issuer Registered',
      '✅ Proof Verified in London',
      '🔴 Tree Update: Credential Revoked',
      '🟢 Merkle Root updated successfully',
    ];
    const interval = setInterval(() => {
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      const hash = Math.random().toString(16).substring(2, 10);
      setMessages(prev => [`[${new Date().toLocaleTimeString()}] ${randomEvent} (${hash})`, ...prev].slice(0, 5));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900/60 border-b border-slate-800/50 py-2 overflow-hidden border-t">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
          <Terminal className="w-3.5 h-3.5" /> Network Feed
        </div>
        <div className="flex-1 overflow-hidden relative h-5">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={msg + i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: i === 0 ? 1 : 0.5, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 text-xs font-mono text-indigo-400/80 truncate flex items-center"
              >
                {msg}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── Activity Heatmap Component ──
function ActivityHeatmap() {
  // Generate mock heatmap data for the last 90 days
  const data = Array.from({ length: 90 }, () => Math.floor(Math.random() * 5));
  
  return (
    <motion.div variants={fadeUpVariant} className="col-span-full p-6 rounded-3xl bg-slate-900/30 border border-white/5 backdrop-blur-md mb-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold tracking-tight">On-Chain Activity</h3>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-slate-800" />
            <div className="w-3 h-3 rounded-sm bg-indigo-500/20" />
            <div className="w-3 h-3 rounded-sm bg-indigo-500/40" />
            <div className="w-3 h-3 rounded-sm bg-indigo-500/70" />
            <div className="w-3 h-3 rounded-sm bg-indigo-500" />
          </div>
          <span>More</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-1.5 overflow-x-auto pb-2">
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 w-max">
          {data.map((level, i) => {
            let bg = 'bg-slate-800/50';
            if (level === 1) bg = 'bg-indigo-500/20';
            if (level === 2) bg = 'bg-indigo-500/40';
            if (level === 3) bg = 'bg-indigo-500/70 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
            if (level >= 4) bg = 'bg-indigo-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]';
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.005 }}
                className={`w-3.5 h-3.5 rounded-[3px] ${bg} hover:border hover:border-white/50 cursor-pointer transition-colors`}
                title={`Activity Level: ${level}`}
              />
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [issuers, setIssuers] = useState<any[]>([]);
  const [rootData, setRootData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, iRes, rRes] = await Promise.all([
        listCredentials(),
        listIssuers(),
        getLatestRoot(),
      ]);
      setCredentials(cRes.credentials || []);
      setIssuers(iRes.issuers || []);
      setRootData(rRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const active = credentials.filter((c) => c.status === 'ACTIVE').length;
  const revoked = credentials.filter((c) => c.status === 'REVOKED').length;

  return (
    <div className="relative min-h-screen bg-[#0a0f1c] pb-24">
      {/* ── Background Elements ── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full opacity-[0.05] blur-[100px]"
             style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
        <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.03] blur-[120px]"
             style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
      </div>

      <LiveTicker />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">Network Control</h1>
            <p className="text-slate-400 font-light tracking-wide">Live state of the RootPass cryptographic registry</p>
          </div>
          <button onClick={load} disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-800/50 backdrop-blur-md border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-800 transition-all active:scale-[0.98]">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            Sync State
          </button>
        </motion.div>

        {/* ── Stat Cards ── */}
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard label="Total Anchored" value={credentials.length} icon={Layers} color="#3b82f6" />
          <StatCard label="Active Proofs" value={active} icon={CheckCircle} color="#6366f1" />
          <StatCard label="Revoked Trees" value={revoked} icon={XCircle} color="#f43f5e" />
          <StatCard label="Registered Issuers" value={issuers.length} icon={Database} color="#a855f7" sub={rootData ? `Epoch ${rootData.slot?.toLocaleString() || 'Syncing...'}` : undefined} />
        </motion.div>

        {/* ── Activity Heatmap ── */}
        <ActivityHeatmap />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ── Credentials Grid ── */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                <Shield className="w-6 h-6 text-indigo-400" /> Recent Leaves
              </h2>
              <Link href="/issue" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                Issue Protocol →
              </Link>
            </div>

            <div className="p-8 rounded-[2rem] bg-slate-900/30 border border-white/5 backdrop-blur-sm min-h-[400px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 py-20">
                  <RefreshCw className="w-8 h-8 animate-spin mb-4 opacity-50" />
                  <p className="font-light tracking-wide">Syncing distributed ledger...</p>
                </div>
              ) : credentials.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700/50 shadow-inner">
                    <Shield className="w-8 h-8 text-slate-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Zero State</h3>
                  <p className="text-slate-400 mb-6 font-light max-w-sm mx-auto">The Merkle tree is currently empty. Initialize the network by anchoring the first credential.</p>
                  <Link href="/issue" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500/10 text-indigo-400 rounded-full font-semibold border border-indigo-500/20 hover:bg-indigo-500/20 transition-all">
                    Initialize Sequence
                  </Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-6">
                  {credentials.slice(0, 20).map((c) => (
                    <MiniCredential3DCard key={c.credentialId} credential={c} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* ── On-Chain Roots ── */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-white px-2 flex items-center gap-3">
              <Globe className="w-6 h-6 text-blue-400" /> Global State
            </h2>
            
            <div className="p-1 rounded-[2rem] bg-gradient-to-b from-blue-500/10 to-slate-900/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-full bg-[url('/noise.png')] opacity-20 mix-blend-overlay z-0 pointer-events-none"></div>
              
              <div className="relative z-10 bg-[#0a0f1c]/80 backdrop-blur-xl rounded-[1.85rem] p-6 h-full border border-white/5">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                    </span>
                    <span className="text-sm font-semibold tracking-wide text-slate-300">Ethereum Sepolia</span>
                  </div>
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[10px] uppercase font-bold tracking-widest rounded border border-blue-500/20">Active</span>
                </div>

                {!rootData || !rootData.roots || rootData.roots.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 font-light">No on-chain roots detected.</div>
                ) : (
                  <div className="space-y-4">
                    {rootData.roots.map((r: any) => (
                      <div key={r.issuerId} className="group p-4 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="text-sm font-semibold text-white truncate pr-4">{r.issuerName}</div>
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs font-bold rounded">v{r.rootVersion}</span>
                        </div>
                        <div className="p-3 bg-black/40 rounded-xl border border-white/5 mb-3">
                          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Current Root Hash</div>
                          <div className="text-xs text-indigo-400 font-mono truncate">{r.merkleRoot}</div>
                        </div>
                        {r.txSignature && !r.txSignature.startsWith('MOCK') && (
                          <a href={`https://sepolia.etherscan.io/tx/${r.txSignature}`} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                            View on Etherscan <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
