'use client';

import { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Shield, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface MiniCredential3DCardProps {
  credential: any;
}

export default function MiniCredential3DCard({ credential }: MiniCredential3DCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const isActive = credential.status === 'ACTIVE';

  // ── Holographic & Physics State ──
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 40 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 40 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['15deg', '-15deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-15deg', '15deg']);

  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    import('@/lib/sounds').then(({ sounds }) => sounds.playWhoosh());
  };

  return (
    <div className="relative w-full perspective-1000 group">
      <motion.div
        className="w-full relative preserve-3d cursor-pointer"
        style={{
          rotateX: isFlipped ? 0 : rotateX,
          rotateY: isFlipped ? 180 : rotateY,
          minHeight: '280px',
        }}
        transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
        onClick={handleFlip}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* ================= FRONT OF CARD ================= */}
        <div 
          className="absolute inset-0 backface-hidden w-full h-full rounded-[2rem] p-6 border flex flex-col justify-between overflow-hidden"
          style={{ 
            background: 'linear-gradient(145deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.95) 100%)',
            borderColor: isActive ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)',
            boxShadow: isActive ? '0 20px 40px -10px rgba(16,185,129,0.15), inset 0 1px 0 rgba(255,255,255,0.1)' : '0 20px 40px -10px rgba(244,63,94,0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)'
          }}
        >
          {/* Holographic Glare Layer */}
          <motion.div 
            className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay opacity-50 transition-opacity group-hover:opacity-100"
            style={{
              background: 'radial-gradient(circle at var(--x) var(--y), rgba(255,255,255,0.4) 10%, transparent 80%)',
              //@ts-ignore
              '--x': glareX, '--y': glareY
            }}
          />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.15] mix-blend-overlay pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-indigo-400 font-black tracking-[0.2em] uppercase text-[10px] mb-1.5 drop-shadow-sm">Credential</p>
                <h3 className="text-xl font-bold text-white truncate drop-shadow-md">{credential.credentialType}</h3>
              </div>
              {isActive ? (
                <span className="badge-valid text-[10px] px-2.5 py-1 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.3)]">Active</span>
              ) : (
                <span className="badge-revoked text-[10px] px-2.5 py-1 backdrop-blur-md shadow-[0_0_15px_rgba(244,63,94,0.3)]">Revoked</span>
              )}
            </div>

            <div className="space-y-4">
               <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Issued To</p>
                  <p className="text-sm font-semibold text-slate-200">{credential.subjectName}</p>
               </div>
               <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Issued At</p>
                  <p className="text-xs font-medium text-slate-300 mono">{new Date(credential.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
               </div>
            </div>
          </div>

          <div className="relative z-10 flex justify-between items-center mt-4 pt-4 border-t border-slate-700/50">
             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               <RefreshCw className="w-3 h-3 text-indigo-500" /> Tap to flip
             </div>
             <Shield className={`w-6 h-6 ${isActive ? 'text-indigo-500/50' : 'text-rose-500/50'}`} />
          </div>
        </div>

        {/* ================= BACK OF CARD ================= */}
        <div 
          className="absolute inset-0 backface-hidden w-full h-full rounded-[2rem] p-6 border flex flex-col justify-between overflow-hidden"
          style={{ 
            background: 'linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(2,6,23,0.98) 100%)',
            borderColor: isActive ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)',
            transform: 'rotateY(180deg)',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)'
          }}
        >
          {/* Holographic Glare Layer Back */}
          <motion.div 
            className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay opacity-30 transition-opacity group-hover:opacity-80"
            style={{
              background: 'radial-gradient(circle at calc(100% - var(--x)) var(--y), rgba(16,185,129,0.3) 0%, transparent 60%)',
              //@ts-ignore
              '--x': glareX, '--y': glareY
            }}
          />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.2] mix-blend-overlay pointer-events-none"></div>

          <div className="relative z-10">
            <h3 className="text-sm font-bold text-indigo-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
              <Shield className="w-4 h-4" /> Cryptographic Data
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1.5">Credential ID</p>
                <p className="mono text-indigo-300/90 text-[10px] break-all bg-black/60 p-2 rounded-xl border border-slate-800/80 shadow-inner">
                  {credential.credentialId}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1.5">Subject DID</p>
                <p className="mono text-slate-400 text-[10px] break-all bg-black/60 p-2 rounded-xl border border-slate-800/80 shadow-inner">
                  {credential.subjectDid}
                </p>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 mt-4 pt-4 border-t border-slate-800/50">
             <Link 
                href={`/verify?id=${credential.credentialId}`}
                onClick={(e) => e.stopPropagation()} 
                className="w-full flex items-center justify-center gap-2 text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 py-3 rounded-xl transition-colors border border-indigo-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]"
              >
               Verify Cryptographic Proof →
             </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
