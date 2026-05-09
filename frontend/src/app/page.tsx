'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Shield, Zap, Lock, CheckCircle, ArrowRight, GitBranch, Database, Globe, Fingerprint, Activity, Layers } from 'lucide-react';
import { useRef } from 'react';
import AuroraBackground from '@/components/animations/AuroraBackground';
import CryptoRain from '@/components/animations/CryptoRain';
import NetworkWeb from '@/components/animations/NetworkWeb';
import TopographicWaves from '@/components/animations/TopographicWaves';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

const slideRightVariant = {
  hidden: { opacity: 0, x: -100 },
  show: { opacity: 1, x: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } },
};

const slideLeftVariant = {
  hidden: { opacity: 0, x: 100 },
  show: { opacity: 1, x: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const scaleUpVariant = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

const FEATURES = [
  { icon: Shield, title: 'Merkle Verification', desc: 'Every credential operates as a leaf in a cryptographic tree. Mathematically tamper-proof and zero-knowledge ready.' },
  { icon: Zap, title: 'Instant Revocation', desc: 'Revoke credentials in one transaction. The Merkle root updates on-chain instantly — invalidating old proofs.' },
  { icon: Lock, title: 'Privacy by Design', desc: 'Only a lightweight 32-byte root lives on Ethereum. Personal subject data never touches the blockchain.' },
  { icon: Globe, title: 'Universal Trust', desc: 'Anyone can verify any credential independently against the on-chain root. Zero reliance on third-party intermediaries.' },
];

const FLOW_STEPS = [
  { step: '01', title: 'Issuer Registration', desc: 'University registers wallet and receives a Decentralized Identifier (DID) on RootPass.', icon: Fingerprint, color: '#6366f1' },
  { step: '02', title: 'Degree Issuance', desc: 'Credential is encrypted, leaf is hashed, and the Merkle root is officially updated on Ethereum.', icon: Layers, color: '#818cf8' },
  { step: '03', title: 'Employer Verification', desc: 'Proof is generated. The computed root matches the on-chain root perfectly.', icon: CheckCircle, color: '#6366f1' },
  { step: '04', title: 'Status Revocation', desc: 'Issuer changes the leaf status. The tree is instantly rebuilt and a new root is published.', icon: Activity, color: '#4f46e5' },
];

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const yBg = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacityBg = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="relative overflow-hidden bg-[#0a0f1c]" ref={containerRef}>
      {/* ── Background Elements ── */}
      <motion.div style={{ y: yBg, opacity: opacityBg }} className="absolute inset-0 pointer-events-none z-0">
        <AuroraBackground />
        <TopographicWaves />
        <CryptoRain />
        <NetworkWeb />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-overlay"></div>
        {/* Dark gradient overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1c]/30 via-transparent to-[#0a0f1c] pointer-events-none z-20"></div>
      </motion.div>

      {/* ── Hero Section ── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] max-w-7xl mx-auto px-4 pt-32 pb-20 text-center">
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col items-center max-w-4xl mx-auto">
          
          <motion.div variants={fadeUpVariant} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/20 text-indigo-400 text-xs sm:text-sm font-semibold mb-8 bg-indigo-500/5 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <span className="relative flex h-2 w-2 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Built on Ethereum Sepolia
          </motion.div>

          <div className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-x-4 mb-8 overflow-hidden w-full">
            <motion.h1 variants={slideRightVariant} className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter leading-[1.05] text-slate-300">
              RootPass.
            </motion.h1>
            <motion.h1 variants={slideLeftVariant} className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter leading-[1.05] text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-300 to-teal-500 drop-shadow-sm">
              Cryptographic Proof.
            </motion.h1>
          </div>

          <motion.p variants={fadeUpVariant} className="text-lg sm:text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light tracking-wide">
            RootPass anchors verification to Ethereum using advanced Merkle-trees. Issue, verify, and instantly revoke credentials without compromising user privacy.
          </motion.p>

          <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row gap-5 justify-center w-full sm:w-auto">
            <Link href="/issue" className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-bold text-white bg-indigo-500 rounded-full overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_40px_rgba(16,185,129,0.25)] hover:shadow-[0_0_60px_rgba(16,185,129,0.4)]">
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
              <span className="relative z-10 flex items-center gap-2">Issue Credential <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
            </Link>
            <Link href="/verify" className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-slate-300 bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-full transition-all hover:bg-slate-800/60 hover:text-white hover:border-slate-600 active:scale-[0.98]">
              Verify a Credential
            </Link>
          </motion.div>

        </motion.div>

        {/* ── Stats ── */}
        <motion.div variants={fadeUpVariant} initial="hidden" animate="show" className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 w-full max-w-4xl mx-auto border-t border-slate-800/50 pt-12">
          {[
            { label: 'On-chain Storage', value: '32 Bytes' },
            { label: 'Verification Speed', value: '< 1s' },
            { label: 'Cryptography', value: 'SHA-256' },
            { label: 'Network', value: 'Ethereum' },
          ].map((stat, i) => (
            <div key={stat.label} className="text-center group">
              <div className="text-2xl md:text-3xl font-black text-white group-hover:text-indigo-400 transition-colors duration-300">{stat.value}</div>
              <div className="text-xs md:text-sm text-slate-500 mt-2 uppercase tracking-widest font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Features Grid ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-32 border-t border-white/5">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant} className="text-center mb-20">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6 tracking-tight">Enterprise Grade <span className="text-indigo-400">Security</span></h2>
          <p className="text-xl text-slate-400 font-light max-w-2xl mx-auto">Engineered to provide cryptographic guarantees, eliminating the need for trust assumptions.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div key={feature.title} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={scaleUpVariant} transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-sm hover:bg-slate-800/50 hover:border-indigo-500/30 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors"></div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 bg-slate-800/50 border border-slate-700/50 group-hover:border-indigo-500/50 group-hover:scale-110 transition-all duration-500 shadow-[0_0_0_rgba(16,185,129,0)] group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <feature.icon className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-white text-xl mb-3">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-light">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── The Narrative Flow ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-32 bg-slate-900/20 border-y border-white/5">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUpVariant} className="text-center mb-20">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6 tracking-tight">The Lifecycle of Trust</h2>
          <p className="text-xl text-slate-400 font-light max-w-2xl mx-auto">Follow a credential from cryptographic inception to on-chain revocation.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FLOW_STEPS.map((step, i) => (
            <motion.div key={step.step} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUpVariant} transition={{ delay: i * 0.15 }}
              className="relative p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md group hover:border-indigo-500/40 transition-colors duration-500 flex flex-col h-full">
              <div className="text-5xl font-black text-slate-800/50 absolute top-4 right-6 pointer-events-none group-hover:text-indigo-900/30 transition-colors">{step.step}</div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-slate-800 border border-slate-700">
                <step.icon className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-bold text-white text-lg mb-3 mt-auto relative z-10">{step.title}</h3>
              <p className="text-sm text-slate-400 font-light leading-relaxed relative z-10">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Architecture Layers ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-32">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUpVariant} className="text-center mb-20">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6 tracking-tight">Hybrid Architecture</h2>
          <p className="text-xl text-slate-400 font-light max-w-2xl mx-auto">Combining the speed of off-chain databases with the immutable security of the blockchain.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Globe, title: 'Layer 1: Blockchain', subtitle: 'Ethereum Sepolia', items: ['Merkle roots (32 bytes)', 'Immutable timestamps', 'Issuer anchoring', 'Smart contract state'], color: 'text-indigo-400', bg: 'from-indigo-500/10 to-transparent', border: 'border-indigo-500/30' },
            { icon: Database, title: 'Layer 2: Storage', subtitle: 'MongoDB Atlas', items: ['Encrypted JSON blobs', 'Subject metadata', 'Rapid query indexing', 'Revocation states'], color: 'text-blue-400', bg: 'from-blue-500/10 to-transparent', border: 'border-blue-500/30' },
            { icon: GitBranch, title: 'Layer 3: Cryptography', subtitle: 'Merkle Engine', items: ['SHA-256 leaf hashing', 'Dynamic tree construction', 'ZKP proof generation', 'Standalone verification'], color: 'text-purple-400', bg: 'from-purple-500/10 to-transparent', border: 'border-purple-500/30' },
          ].map((arch, i) => (
            <motion.div key={arch.title} initial="hidden" whileInView="show" viewport={{ once: true }} variants={scaleUpVariant} transition={{ delay: i * 0.15 }}
              className={`p-1 rounded-3xl bg-gradient-to-b ${arch.border.replace('border-', 'from-').replace('/30', '/20')} to-slate-900/50`}>
              <div className="h-full bg-slate-950/80 rounded-[22px] p-8 backdrop-blur-xl border border-white/5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 bg-gradient-to-br ${arch.bg} border ${arch.border}`}>
                  <arch.icon className={`w-6 h-6 ${arch.color}`} />
                </div>
                <div className="mb-8">
                  <h3 className="font-bold text-white text-xl mb-1">{arch.title}</h3>
                  <p className="text-sm font-medium tracking-wide uppercase" style={{ color: arch.color.replace('text-', '') }}>{arch.subtitle}</p>
                </div>
                <ul className="space-y-4">
                  {arch.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-slate-300 font-light">
                      <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${arch.color}`} />
                      <span className="leading-tight">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Premium CTA ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 py-32 mb-20">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={scaleUpVariant}
          className="relative rounded-[2.5rem] overflow-hidden p-1 bg-gradient-to-br from-indigo-500/40 via-slate-800 to-indigo-900/40 shadow-2xl shadow-indigo-900/20">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay z-10"></div>
          
          <div className="relative z-20 bg-[#0a0f1c]/90 backdrop-blur-2xl rounded-[2.25rem] px-8 py-24 text-center border border-white/10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none rounded-[2.25rem]"></div>
            
            <h2 className="text-4xl sm:text-6xl font-bold text-white mb-6 tracking-tight relative">
              Initialize the Protocol
            </h2>
            <p className="text-xl text-slate-400 mb-12 relative font-light max-w-2xl mx-auto leading-relaxed">
              Step into the future of decentralized identity. Issue your first credential and observe the cryptographic state change on the Ethereum network.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center relative">
              <Link href="/dashboard" className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 text-base font-bold text-[#0a0f1c] bg-indigo-400 rounded-full overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(52,211,153,0.3)] hover:shadow-[0_0_50px_rgba(52,211,153,0.5)]">
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-300 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10 flex items-center gap-2">Launch Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
              </Link>
              <Link href="/issue" className="inline-flex items-center justify-center px-10 py-5 text-base font-semibold text-white bg-white/5 backdrop-blur-xl border border-white/10 rounded-full transition-all hover:bg-white/10 hover:border-white/20 active:scale-[0.98]">
                Start Issuing
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

