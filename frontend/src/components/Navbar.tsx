'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { href: '/',           label: 'Home' },
  { href: '/dashboard',  label: 'Dashboard' },
  { href: '/register',   label: 'Register' },
  { href: '/issue',      label: 'Issue' },
  { href: '/verify',     label: 'Verify' },
  { href: '/revoke',     label: 'Revoke' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0a0f1c]/70 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-3 group relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-shadow">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="relative font-bold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 group-hover:to-indigo-200 transition-colors">
              RootPass.
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden md:flex items-center gap-2">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 overflow-hidden ${
                    active ? 'text-indigo-300' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-indigo-500/10 border border-indigo-500/20 rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 tracking-wide">{label}</span>
                </Link>
              );
            })}
          </div>

          {/* ── Network Badge ── */}
          <div className="hidden md:flex items-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 text-xs font-semibold tracking-wide text-slate-300 shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Ethereum Sepolia
            </div>
          </div>

          {/* ── Mobile Menu Button ── */}
          <button
            className="md:hidden p-2.5 rounded-full bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* ── Mobile Nav ── */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-white/5"
            >
              <div className="py-4 flex flex-col gap-2">
                {NAV_LINKS.map(({ href, label }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`px-5 py-3 rounded-2xl text-sm font-semibold transition-all ${
                        active
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
