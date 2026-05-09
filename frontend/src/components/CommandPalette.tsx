'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Shield, ArrowRight, Activity, FileKey, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const ACTIONS = [
    { id: 'issue', title: 'Issue Credential', icon: FileKey, desc: 'Anchor a new Merkle leaf', href: '/issue' },
    { id: 'verify', title: 'Verify Proof', icon: Shield, desc: 'Check cryptograhpic validity', href: '/verify' },
    { id: 'revoke', title: 'Revoke Node', icon: Activity, desc: 'Invalidate an existing credential', href: '/revoke' },
    { id: 'dashboard', title: 'Dashboard', icon: Search, desc: 'View global state', href: '/dashboard' },
  ];

  const filtered = ACTIONS.filter(action => 
    action.title.toLowerCase().includes(search.toLowerCase()) || 
    action.desc.toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = (href: string) => {
    setOpen(false);
    setSearch('');
    router.push(href);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-[#020617]/60 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl overflow-hidden"
            >
              <div className="flex items-center px-4 border-b border-slate-800">
                <Search className="w-5 h-5 text-indigo-500" />
                <input 
                  autoFocus
                  placeholder="Search commands or paste Credential ID..."
                  className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 py-5 pl-4 text-lg outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto p-2">
                {search.length > 10 && !search.includes(' ') && (
                   <button 
                    onClick={() => handleAction(`/verify?id=${search}`)}
                    className="w-full text-left flex items-center gap-4 p-4 rounded-xl hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors group mb-2 border border-transparent hover:border-indigo-500/20"
                  >
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold group-hover:text-indigo-400">Verify Custom ID</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{search}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}

                <div className="px-3 pb-2 pt-4 text-xs font-semibold uppercase tracking-widest text-slate-500">Quick Actions</div>
                {filtered.length > 0 ? filtered.map(action => (
                  <button 
                    key={action.id}
                    onClick={() => handleAction(action.href)}
                    className="w-full text-left flex items-center gap-4 p-4 rounded-xl hover:bg-slate-800 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                      <action.icon className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">{action.title}</h4>
                      <p className="text-sm text-slate-400 mt-0.5">{action.desc}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )) : (
                  <div className="py-12 text-center text-slate-500">No results found.</div>
                )}
              </div>
              
              <div className="bg-slate-900 px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Use <kbd className="font-mono bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">↑</kbd> <kbd className="font-mono bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">↓</kbd> to navigate</span>
                <span><kbd className="font-mono bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">esc</kbd> to close</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
