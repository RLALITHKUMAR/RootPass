'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { XCircle, RefreshCw, Loader2, AlertTriangle, Shield, CheckCircle, Search, ChevronRight, GitBranch } from 'lucide-react';
import { listCredentials, revokeCredential } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';

// ── Holographic Credential Card ──────────────────────────────────────────────
function HolographicCard({
  credential,
  onRevoke,
}: {
  credential: any;
  onRevoke: (id: string) => void;
}) {
  const isActive = credential.status === 'ACTIVE';
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mx = useSpring(x, { stiffness: 300, damping: 40 });
  const my = useSpring(y, { stiffness: 300, damping: 40 });
  const rotateX = useTransform(my, [-0.5, 0.5], ['12deg', '-12deg']);
  const rotateY = useTransform(mx, [-0.5, 0.5], ['-12deg', '12deg']);
  const glareX = useTransform(mx, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(my, [-0.5, 0.5], ['0%', '100%']);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  const fmtDate = (d: string) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <div className="perspective-1000 w-full group">
      <motion.div
        className="w-full preserve-3d"
        style={{ rotateX, rotateY, minHeight: '320px' }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        <div
          className="absolute inset-0 backface-hidden rounded-[2rem] p-6 flex flex-col justify-between overflow-hidden border"
          style={{
            background: 'linear-gradient(145deg, rgba(17,24,39,0.95) 0%, rgba(9,13,27,0.98) 100%)',
            borderColor: isActive ? 'rgba(99,102,241,0.3)' : 'rgba(244,63,94,0.25)',
            boxShadow: isActive
              ? '0 20px 40px -10px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.06)'
              : '0 20px 40px -10px rgba(244,63,94,0.1), inset 0 1px 0 rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Holographic glare */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[2rem]"
            style={{
              background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(129,140,248,0.35) 0%, rgba(167,139,250,0.1) 40%, transparent 70%)`,
            }}
          />
          {/* Noise texture */}
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.12] mix-blend-overlay pointer-events-none rounded-[2rem]" />

          {/* Top gradient line */}
          <div
            className="absolute top-0 left-8 right-8 h-px"
            style={{
              background: isActive
                ? 'linear-gradient(90deg, transparent, rgba(129,140,248,0.6), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(244,63,94,0.4), transparent)',
            }}
          />

          {/* Card Content */}
          <div className="relative z-10 flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(79,70,229,0.1))'
                      : 'linear-gradient(135deg, rgba(244,63,94,0.15), rgba(159,18,57,0.1))',
                    border: `1px solid ${isActive ? 'rgba(99,102,241,0.3)' : 'rgba(244,63,94,0.25)'}`,
                  }}
                >
                  <Shield className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-rose-400'}`} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-[0.15em] font-bold">Credential</p>
                  <p className="text-sm font-bold text-white truncate max-w-[140px]">{credential.credentialType}</p>
                </div>
              </div>
              {isActive ? (
                <span className="badge-valid text-[10px]">● Active</span>
              ) : (
                <span className="badge-revoked text-[10px]">● Revoked</span>
              )}
            </div>

            {/* Subject */}
            <div className="mb-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Issued To</p>
              <p className="text-lg font-bold text-white">{credential.subjectName}</p>
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">Issued</p>
                <p className="text-xs text-slate-300 font-medium mono">{fmtDate(credential.issuedAt)}</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">ID</p>
                <p className="text-[10px] text-indigo-400 font-medium mono truncate">{credential.credentialId?.slice(0, 14)}…</p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-800/60 mt-auto pt-4 flex items-center gap-2">
              <Link
                href={`/verify?id=${credential.credentialId}`}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 py-2.5 rounded-xl transition-all"
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}
              >
                Verify <ChevronRight className="w-3 h-3" />
              </Link>

              {isActive && (
                <button
                  onClick={() => onRevoke(credential.credentialId)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 py-2.5 rounded-xl transition-all"
                  style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}
                >
                  <XCircle className="w-3.5 h-3.5" /> Revoke
                </button>
              )}

              {!isActive && credential.revokedAt && (
                <div
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 py-2.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  {fmtDate(credential.revokedAt)}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Dramatic Revocation Modal ─────────────────────────────────────────────────
function RevocationModal({
  credentialId,
  credential,
  onConfirm,
  onCancel,
  isLoading,
}: {
  credentialId: string;
  credential: any;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(16px)' }}
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg rounded-[2rem] overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #110a0a 0%, #0d0a15 100%)',
            border: '1px solid rgba(244,63,94,0.35)',
            boxShadow: '0 0 80px rgba(244,63,94,0.15), 0 40px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top danger gradient line */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(244,63,94,0.8), transparent)' }} />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.1] mix-blend-overlay pointer-events-none" />

          <div className="relative z-10 p-8">
            {/* Warning icon */}
            <div className="flex flex-col items-center text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, transition: { type: 'spring', delay: 0.1, stiffness: 400, damping: 20 } }}
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                style={{
                  background: 'radial-gradient(circle, rgba(244,63,94,0.2) 0%, rgba(244,63,94,0.05) 100%)',
                  border: '1px solid rgba(244,63,94,0.4)',
                  boxShadow: '0 0 40px rgba(244,63,94,0.2)',
                }}
              >
                <AlertTriangle className="w-10 h-10 text-rose-400" />
              </motion.div>
              <h2 className="text-2xl font-black text-white mb-2">Revoke Credential?</h2>
              <p className="text-slate-400 text-sm font-light max-w-sm">
                This action is <span className="text-rose-400 font-semibold">permanent and irreversible</span>. The credential will be invalidated on-chain.
              </p>
            </div>

            {/* Credential summary */}
            {credential && (
              <div className="rounded-2xl p-4 mb-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3">Credential Being Revoked</p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.2)' }}>
                    <XCircle className="w-4 h-4 text-rose-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{credential.subjectName}</p>
                    <p className="text-xs text-slate-500">{credential.credentialType}</p>
                  </div>
                </div>
                <p className="mono text-[10px] text-indigo-400/70 bg-black/40 p-2 rounded-lg border border-slate-800 break-all">{credentialId}</p>
              </div>
            )}

            {/* What happens */}
            <div className="rounded-2xl p-4 mb-6 space-y-2" style={{ background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.15)' }}>
              <p className="text-xs font-bold text-rose-400 flex items-center gap-2 mb-3">
                <GitBranch className="w-3.5 h-3.5" /> What happens on-chain
              </p>
              {[
                'Leaf status changes: ACTIVE → REVOKED',
                'Leaf hash recomputed with new status',
                'Merkle tree is fully rebuilt',
                'New 32-byte root published to Ethereum',
                'All existing proofs instantly invalidated',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="text-rose-500 font-bold flex-shrink-0">{i + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 py-3.5 rounded-2xl text-sm font-semibold text-slate-400 hover:text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-[2] py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all"
                style={{
                  background: isLoading ? 'rgba(244,63,94,0.3)' : 'linear-gradient(135deg, #f43f5e, #e11d48)',
                  border: '1px solid rgba(244,63,94,0.4)',
                  boxShadow: isLoading ? 'none' : '0 4px 20px rgba(244,63,94,0.35)',
                }}
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Revoking…</>
                ) : (
                  <><XCircle className="w-4 h-4" /> Confirm Revocation</>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function RevokePage() {
  const { toast } = useToast();
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'REVOKED'>('ALL');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listCredentials();
      setCredentials(res.credentials || []);
    } catch {
      toast({ type: 'error', title: 'Failed to load credentials' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleRevoke = async () => {
    if (!confirmId) return;
    setRevoking(confirmId);
    try {
      const res = await revokeCredential(confirmId);
      toast({ type: 'success', title: 'Credential revoked', message: `Root v${res.rootVersion} published on Ethereum` });
      setCredentials((prev) =>
        prev.map((c) => c.credentialId === confirmId
          ? { ...c, status: 'REVOKED', revokedAt: new Date().toISOString() } : c)
      );
    } catch (err: any) {
      toast({ type: 'error', title: 'Revoke failed', message: err?.response?.data?.message });
    } finally {
      setRevoking(null);
      setConfirmId(null);
    }
  };

  const confirmCredential = credentials.find(c => c.credentialId === confirmId);

  const filtered = credentials.filter((c) => {
    const matchesFilter = filter === 'ALL' || c.status === filter;
    const matchesSearch = !search || c.subjectName?.toLowerCase().includes(search.toLowerCase()) || c.credentialType?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const active = credentials.filter(c => c.status === 'ACTIVE').length;
  const revoked = credentials.filter(c => c.status === 'REVOKED').length;

  return (
    <div className="relative min-h-screen bg-[#0a0f1c] pb-24">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-5%] left-[15%] w-[500px] h-[500px] rounded-full opacity-[0.04] blur-[100px]" style={{ background: 'radial-gradient(circle, #f43f5e 0%, transparent 70%)' }} />
        <div className="absolute top-[50%] right-[-5%] w-[400px] h-[400px] rounded-full opacity-[0.03] blur-[120px]" style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.2), rgba(159,18,57,0.1))', border: '1px solid rgba(244,63,94,0.3)', boxShadow: '0 0 30px rgba(244,63,94,0.15)' }}>
                <XCircle className="w-7 h-7 text-rose-400" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-tight">Revocation</h1>
                <p className="text-slate-400 font-light text-sm mt-0.5">Revoking updates the Merkle leaf and publishes a new root on Ethereum</p>
              </div>
            </div>
            <button onClick={load} disabled={loading} className="btn-secondary gap-2 self-start sm:self-auto">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total', value: credentials.length, color: '#6366f1' },
            { label: 'Active', value: active, color: '#34d399' },
            { label: 'Revoked', value: revoked, color: '#f43f5e' },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-3xl font-black text-white" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Controls */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          {/* Filter tabs */}
          <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {(['ALL', 'ACTIVE', 'REVOKED'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  filter === f
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
                <span className="ml-2 text-xs opacity-60">
                  {f === 'ALL' ? credentials.length : credentials.filter(c => c.status === f).length}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              className="input-field pl-11"
              placeholder="Search subject or type…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Credential Cards Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-[2rem] animate-pulse" style={{ minHeight: '320px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <Shield className="w-10 h-10 text-indigo-500/40" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No credentials found</h3>
            <p className="text-slate-500 mb-6 font-light">
              {search ? 'Try a different search term' : 'No credentials in this category'}
            </p>
            <Link href="/issue" className="btn-primary px-6 py-3">Issue a Credential</Link>
          </motion.div>
        ) : (
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
          >
            {filtered.map((c) => (
              <motion.div key={c.credentialId} variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16,1,0.3,1] } } }}>
                <HolographicCard credential={c} onRevoke={(id) => setConfirmId(id)} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Warning footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-12 rounded-2xl p-5 flex gap-4 items-start" style={{ background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.15)' }}>
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-rose-400 font-semibold text-sm mb-1">Revocation is permanent</p>
            <p className="text-slate-400 text-sm font-light">The credential leaf hash changes, the tree is rebuilt, and a new Merkle root is published on Ethereum. All previous proofs become instantly invalid.</p>
          </div>
        </motion.div>
      </div>

      {/* Revocation Modal */}
      {confirmId && (
        <RevocationModal
          credentialId={confirmId}
          credential={confirmCredential}
          onConfirm={handleRevoke}
          onCancel={() => setConfirmId(null)}
          isLoading={revoking === confirmId}
        />
      )}
    </div>
  );
}
