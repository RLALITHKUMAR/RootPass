'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Shield, Loader2, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { verifyCredential } from '@/lib/api';

type VerifyResult = 'VALID' | 'REVOKED' | 'INVALID' | 'NOT_FOUND' | null;

import { Download } from 'lucide-react';
import confetti from 'canvas-confetti';
import Credential3DCard from '@/components/Credential3DCard';
import AdvancedDiagnostics from '@/components/AdvancedDiagnostics';

// New Visual Node Tree
function ProofTree({ proof, hashFormula }: { proof: any; hashFormula?: string }) {
  const [open, setOpen] = useState(false);
  if (!proof) return null;

  return (
    <div className="rounded-xl overflow-hidden mt-6 bg-slate-900 border border-indigo-500/20 shadow-lg">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-4 text-sm font-medium text-slate-200 hover:bg-slate-800 transition-colors">
        <span className="flex items-center gap-2">
          <span>🌳</span> Visual Node Tree (Merkle Canvas)
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="p-6 bg-slate-950 border-t border-slate-800">
              <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-6">Cryptographic Path to Root</p>
              
              <div className="flex flex-col gap-6 relative">
                {/* Connecting Line */}
                <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-800 z-0"></div>
                
                {/* Leaf Node */}
                <div className="relative z-10 flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 border-2 border-indigo-500 flex items-center justify-center flex-shrink-0 text-indigo-400 text-xs font-bold">L</div>
                  <div className="flex-1 bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">Leaf Hash (Credential)</p>
                    <p className="mono text-indigo-400 text-xs break-all">{proof.leafHash}</p>
                    {hashFormula && <p className="mt-2 text-[10px] text-slate-500 border-t border-slate-800 pt-1 mono">{hashFormula}</p>}
                  </div>
                </div>

                {/* Sibling Nodes */}
                {proof.siblings?.map((s: string, i: number) => (
                  <div key={i} className="relative z-10 flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center flex-shrink-0 text-slate-400 text-[10px] font-bold">S{i}</div>
                    <div className="flex-1 bg-slate-900 p-3 rounded-lg border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="min-w-0">
                        <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">Sibling Hash</p>
                        <p className="mono text-slate-400 text-xs break-all">{s}</p>
                      </div>
                      <span className="text-slate-500 text-[10px] flex-shrink-0 px-2 py-1 rounded bg-slate-950 font-bold border border-slate-800">
                        {proof.positions?.[i] === 1 ? 'Right' : 'Left'}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Root Node */}
                <div className="relative z-10 flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center flex-shrink-0 text-blue-400 text-xs font-bold">R</div>
                  <div className="flex-1 bg-slate-900 p-3 rounded-lg border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">On-Chain Root</p>
                    <p className="mono text-blue-400 text-xs break-all">{proof.onChainRoot}</p>
                    <div className="mt-2 text-xs flex items-center gap-2 border-t border-slate-800 pt-2">
                      <span className="text-slate-500">Match Status:</span>
                      {proof.rootMatch ? <span className="text-indigo-400 font-bold">✓ Verified mathematically</span> : <span className="text-rose-400 font-bold">✗ Mismatch</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const [credentialId, setCredentialId] = useState(searchParams.get('id') || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult>(null);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  // Auto-verify if ID is in URL
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) { setCredentialId(id); handleVerify(id); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleVerify(id?: string) {
    const cid = id || credentialId.trim();
    if (!cid) return;
    setLoading(true);
    setResult(null);
    setData(null);
    setError('');

    try {
      const res = await verifyCredential({ credentialId: cid });
      setResult(res.result as VerifyResult);
      setData(res);
      
      if (res.result === 'VALID') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#818cf8', '#f8fafc', '#0f172a']
        });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Verification failed';
      setError(msg);
      setResult('NOT_FOUND');
    } finally {
      setLoading(false);
    }
  }

  const handlePrint = () => {
    window.print();
  };

  const RESULT_CONFIG = {
    VALID: {
      bg: 'rgba(16,185,129,0.08)',
      border: 'rgba(16,185,129,0.35)',
      glow: '0 0 60px rgba(16,185,129,0.2)',
      icon: <CheckCircle className="w-16 h-16 text-indigo-400" />,
      label: '✅ VERIFIED',
      labelColor: '#818cf8',
      desc: 'This credential is cryptographically valid. The Merkle proof matches the on-chain root.',
    },
    REVOKED: {
      bg: 'rgba(244,63,94,0.08)',
      border: 'rgba(244,63,94,0.35)',
      glow: '0 0 60px rgba(244,63,94,0.2)',
      icon: <XCircle className="w-16 h-16 text-rose-400" />,
      label: '❌ REVOKED',
      labelColor: '#fb7185',
      desc: 'This credential has been revoked. The issuer invalidated this credential on-chain.',
    },
    INVALID: {
      bg: 'rgba(234,179,8,0.08)',
      border: 'rgba(234,179,8,0.35)',
      glow: '0 0 60px rgba(234,179,8,0.1)',
      icon: <AlertTriangle className="w-16 h-16 text-yellow-400" />,
      label: '⚠️ INVALID',
      labelColor: '#fbbf24',
      desc: 'Proof does not match on-chain root. Credential may be tampered with.',
    },
    NOT_FOUND: {
      bg: 'rgba(100,116,139,0.08)',
      border: 'rgba(100,116,139,0.3)',
      glow: 'none',
      icon: <Search className="w-16 h-16 text-slate-500" />,
      label: '🔍 NOT FOUND',
      labelColor: '#94a3b8',
      desc: error || 'No credential found with this ID.',
    },
  };

  const cfg = result ? RESULT_CONFIG[result] : null;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 print:py-0 print:px-0">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 print:hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Verify Credential</h1>
            <p className="text-slate-400 text-sm">Enterprise-Grade Cryptographic Proof</p>
          </div>
        </div>
      </motion.div>

      {/* Search box */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
        className="card mb-8 print:hidden">
        <label className="block text-sm font-medium text-slate-300 mb-3">Credential ID</label>
        <div className="flex gap-3">
          <input
            className="input-field flex-1"
            placeholder="Enter credential UUID…"
            value={credentialId}
            onChange={(e) => setCredentialId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
          />
          <button onClick={() => handleVerify()} disabled={loading || !credentialId.trim()}
            className="btn-primary px-6 flex-shrink-0">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? 'Checking…' : 'Verify'}
          </button>
        </div>
      </motion.div>

      {/* ── SKELETON LOADER ── */}
      {loading && (
        <div className="rounded-2xl p-6 bg-slate-900 border border-slate-800 animate-pulse mb-8">
          <div className="flex justify-between items-center pb-4 border-b border-slate-800">
            <div className="h-4 bg-slate-800 rounded w-1/4"></div>
            <div className="h-6 bg-slate-800 rounded w-24"></div>
          </div>
          <div className="flex flex-col items-center py-10">
            <div className="w-16 h-16 rounded-full bg-slate-800 mb-6"></div>
            <div className="h-8 bg-slate-800 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-slate-800 rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800">
            <div className="h-10 bg-slate-800 rounded"></div>
            <div className="h-10 bg-slate-800 rounded"></div>
          </div>
        </div>
      )}

      {/* ── RESULT SCREEN ── */}
      <AnimatePresence mode="wait">
        {!loading && cfg && (
          <motion.div
            key={result}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            className="rounded-2xl overflow-hidden mb-8 print:border-none print:shadow-none"
            style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, boxShadow: cfg.glow }}
            id="verification-report"
          >
            {/* Header / Actions */}
            <div className="flex justify-between items-center px-6 py-4 border-b print:hidden" style={{ borderColor: cfg.border }}>
              <span className="text-xs font-mono text-slate-400">RootPass Protocol Verification</span>
              {result === 'VALID' && (
                <button onClick={handlePrint} className="flex items-center gap-2 text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  Download PDF Report
                </button>
              )}
            </div>

            {/* Big status */}
            <div className="flex flex-col items-center py-10 px-6 text-center print:py-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, transition: { type: 'spring', stiffness: 400, damping: 20, delay: 0.1 } }}
              >
                {cfg.icon}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.25 } }}
              >
                <h2 className="text-4xl font-black mt-6 mb-2 print:text-black" style={{ color: cfg.labelColor }}>
                  {cfg.label}
                </h2>
                <p className="text-slate-400 text-sm max-w-sm print:text-slate-600">{cfg.desc}</p>
                {data?.verifiedAt && (
                  <p className="text-xs text-slate-500 mt-3 print:text-slate-500 font-mono">
                    Timestamp: {new Date(data.verifiedAt).toLocaleString()}
                  </p>
                )}
              </motion.div>
            </div>

            {/* Credential details and QR */}
            {data?.credential && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.3 } }}>
                <Credential3DCard data={data} result={result} currentUrl={currentUrl} />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proof tree (Hidden in print) */}
      {data?.proof && (
        <motion.div className="print:hidden" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}>
          <ProofTree proof={data.proof} hashFormula={data.hashFormula} />
          <AdvancedDiagnostics data={data} />
        </motion.div>
      )}

      {/* How it works (Hidden in print) */}
      {!result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.2 } }}
          className="card text-sm text-slate-400 space-y-2 print:hidden"
          style={{ background: 'rgba(99,102,241,0.04)' }}>
          <p className="font-medium text-slate-300">🔐 Enterprise Cryptographic Verification</p>
          <ul className="space-y-1.5 list-decimal list-inside opacity-80 pl-2">
            <li>Leaf Hash recomputed locally: <span className="mono text-brand-400">SHA256(Credential Data)</span></li>
            <li>Merkle proof generated from active off-chain storage</li>
            <li>Computed Root compared mathematically against Ethereum On-Chain Root</li>
            <li>If roots match exactly → <span className="text-indigo-400 font-semibold">VERIFIED</span></li>
            <li>If credential was revoked, proof uses nullified leaf → <span className="text-rose-400 font-semibold">REVOKED</span></li>
          </ul>
        </motion.div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20 text-slate-500">Loading…</div>}>
      <VerifyContent />
    </Suspense>
  );
}
