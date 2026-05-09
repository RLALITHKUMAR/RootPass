import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { ToastProvider } from '@/context/ToastContext';
import Navbar from '@/components/Navbar';
import CommandPalette from '@/components/CommandPalette';

export const metadata: Metadata = {
  title: 'RootPass — Decentralized Credential System',
  description:
    'Issue, verify, and revoke credentials on Ethereum using Merkle-tree accumulators. Privacy-preserving, tamper-proof, and instantly verifiable.',
  keywords: 'Ethereum, credentials, Merkle tree, decentralized identity, blockchain, DID',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans bg-[#020617] text-slate-200 min-h-screen antialiased selection:bg-indigo-500/30`}>
        {/* Subtle background effects */}
        <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))]" />
        <div className="fixed inset-0 z-[-1] bg-[url('/noise.png')] opacity-[0.03] pointer-events-none" />
        
        <ToastProvider>
          <CommandPalette />
          <Navbar />
          <main className="min-h-[calc(100vh-64px)]">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
