'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Shield, Sparkles } from 'lucide-react';

interface PreviewProps {
  form: {
    subjectName?: string;
    credentialType?: string;
    credentialTitle?: string;
    institution?: string;
    degreeLevel?: string;
    major?: string;
    grade?: string;
    honor?: string;
    graduationMonth?: string;
    graduationYear?: string;
    issuerId?: string;
  };
  issuers: { issuerId: string; name: string }[];
  step: number;
}

export default function LiveCredentialPreview({ form, issuers, step }: PreviewProps) {
  const issuer = issuers.find(i => i.issuerId === form.issuerId);
  const hasContent = !!(form.subjectName || form.institution || form.credentialTitle);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mx = useSpring(x, { stiffness: 200, damping: 30 });
  const my = useSpring(y, { stiffness: 200, damping: 30 });
  const rotateX = useTransform(my, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(mx, [-0.5, 0.5], ['-10deg', '10deg']);
  const glareX = useTransform(mx, [-0.5, 0.5], ['10%', '90%']);
  const glareY = useTransform(my, [-0.5, 0.5], ['10%', '90%']);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  const title = form.credentialTitle || form.credentialType || 'Your Credential';
  const gradDate = [form.graduationMonth, form.graduationYear].filter(Boolean).join(' ') || '—';

  return (
    <div className="sticky top-28 flex flex-col gap-4">
      {/* Label */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live Preview</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold text-indigo-400"
          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
          Updates as you type
        </span>
      </div>

      {/* Holographic 3D Card */}
      <div className="perspective-1000 w-full group">
        <motion.div
          className="w-full preserve-3d"
          style={{ rotateX, rotateY, minHeight: '340px' }}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
        >
          <div
            className="absolute inset-0 backface-hidden rounded-[2rem] p-7 flex flex-col justify-between overflow-hidden border"
            style={{
              background: 'linear-gradient(145deg, rgba(20,20,40,0.97) 0%, rgba(8,10,26,0.99) 100%)',
              borderColor: 'rgba(99,102,241,0.3)',
              boxShadow: '0 25px 50px -12px rgba(99,102,241,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
              backdropFilter: 'blur(24px)',
            }}
          >
            {/* Holographic glare */}
            <motion.div
              className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]"
              style={{
                background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(129,140,248,0.4) 0%, rgba(167,139,250,0.15) 35%, transparent 65%)`,
              }}
            />
            {/* Noise */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.12] mix-blend-overlay pointer-events-none rounded-[2rem]" />
            {/* Rainbow top line */}
            <div className="absolute top-0 left-10 right-10 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(129,140,248,0.7), rgba(167,139,250,0.5), rgba(99,102,241,0.7), transparent)' }} />
            {/* Corner glow */}
            <div className="absolute top-4 right-4 w-20 h-20 rounded-full blur-2xl opacity-20"
              style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />

            {/* Card content */}
            <div className="relative z-10 flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] text-indigo-400 font-black tracking-[0.2em] uppercase mb-1.5">
                    Official Credential
                  </p>
                  <motion.h3
                    key={title}
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: 1 }}
                    className="text-xl font-black text-white leading-tight max-w-[200px]"
                  >
                    {title}
                  </motion.h3>
                </div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
                  <Shield className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Subject & Issuer */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold border-b border-slate-800 pb-1 mb-2">Issued To</p>
                  <motion.p key={form.subjectName} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}
                    className={`text-sm font-bold ${form.subjectName ? 'text-white' : 'text-slate-600'}`}>
                    {form.subjectName || 'Subject Name'}
                  </motion.p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold border-b border-slate-800 pb-1 mb-2">Issued By</p>
                  <motion.p key={issuer?.name} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}
                    className={`text-sm font-bold ${issuer ? 'text-white' : 'text-slate-600'}`}>
                    {issuer?.name || 'Select Issuer'}
                  </motion.p>
                  {form.institution && (
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">{form.institution}</p>
                  )}
                </div>
              </div>

              {/* Meta chips */}
              <div className="flex flex-wrap gap-2 mb-auto">
                {form.degreeLevel && form.degreeLevel !== "Bachelor's Degree" && (
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold text-indigo-300"
                    style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
                    {form.degreeLevel}
                  </span>
                )}
                {form.major && (
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold text-purple-300"
                    style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.2)' }}>
                    {form.major}
                  </span>
                )}
                {form.grade && (
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold text-sky-300"
                    style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.2)' }}>
                    GPA {form.grade}
                  </span>
                )}
                {form.honor && form.honor !== 'None' && (
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold text-amber-300"
                    style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.2)' }}>
                    {form.honor}
                  </span>
                )}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-slate-800/60 flex justify-between items-center">
                <div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Graduation</p>
                  <p className="text-xs font-semibold text-slate-300 mono">{gradDate}</p>
                </div>
                <span className="badge-valid text-[10px]">● Active</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Step progress hint */}
      <div className="rounded-2xl p-4" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.12)' }}>
        <p className="text-xs text-indigo-400 font-bold flex items-center gap-2 mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Step {step} of 3
        </p>
        <div className="flex gap-1.5">
          {[1, 2, 3].map(s => (
            <div key={s} className="h-1 flex-1 rounded-full transition-all duration-500"
              style={{ background: s <= step ? 'linear-gradient(90deg, #818cf8, #6366f1)' : 'rgba(255,255,255,0.06)' }} />
          ))}
        </div>
        <p className="text-[10px] text-slate-500 mt-2">
          {step === 1 ? 'Fill in subject identity details' : step === 2 ? 'Add credential metadata' : 'Review and anchor on-chain'}
        </p>
      </div>
    </div>
  );
}
