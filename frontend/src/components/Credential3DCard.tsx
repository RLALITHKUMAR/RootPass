'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ExternalLink, RefreshCw } from 'lucide-react';
import QRCode from 'react-qr-code';

interface Credential3DCardProps {
  data: any;
  result: string | null;
  currentUrl: string;
}

export default function Credential3DCard({ data, result, currentUrl }: Credential3DCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!data?.credential) return null;

  return (
    <div className="relative w-full perspective-1000 my-8 group">
      {/* 3D Container */}
      <motion.div
        className="w-full relative preserve-3d cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ minHeight: '600px' }}
      >
        {/* ================= FRONT OF CARD ================= */}
        <div 
          className="absolute inset-0 backface-hidden w-full h-full rounded-3xl p-8 border"
          style={{ 
            background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
            borderColor: result === 'VALID' ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)',
            boxShadow: '0 20px 50px -12px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)'
          }}
        >
          {/* Card Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-indigo-400 font-bold tracking-widest uppercase text-xs mb-1">Official Credential</p>
              <h3 className="text-2xl font-black text-white">{data.credential.credentialData?.credentialTitle || data.credential.credentialType}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
               <Shield className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
             {/* Subject Info */}
             <div className="space-y-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold border-b border-slate-800 pb-1">Issued To</p>
                <div>
                  <p className="text-lg font-bold text-white">{data.credential.subjectName}</p>
                  {data.credential.credentialData?.subjectStudentId && (
                     <p className="text-sm text-slate-400 mono mt-1">ID: {data.credential.credentialData.subjectStudentId}</p>
                  )}
                </div>
             </div>

             {/* Issuer Info */}
             <div className="space-y-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold border-b border-slate-800 pb-1">Issued By</p>
                <div>
                  <p className="text-lg font-bold text-white">{data.issuer?.name}</p>
                  {data.credential.credentialData?.institution && (
                     <p className="text-sm text-slate-400 mt-1">{data.credential.credentialData.institution}</p>
                  )}
                </div>
             </div>
          </div>

          {/* Academic/Professional Grid */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
               ['Degree Level', data.credential.credentialData?.degreeLevel],
               ['Major', data.credential.credentialData?.major],
               ['Graduation', `${data.credential.credentialData?.graduationMonth || ''} ${data.credential.credentialData?.graduationYear || ''}`.trim()],
               ['Grade/GPA', data.credential.credentialData?.grade],
               ['Honors', data.credential.credentialData?.honor],
               ['Reference #', data.credential.credentialData?.credentialNumber],
            ].filter(([,v]) => v).map(([k,v]) => (
               <div key={k as string} className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                 <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{k as string}</p>
                 <p className="text-slate-200 text-sm font-medium mt-1">{v as string}</p>
               </div>
            ))}
          </div>

          {/* Bottom Flip Hint */}
          <div className="absolute bottom-6 left-0 w-full flex justify-center opacity-50 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-900 px-4 py-2 rounded-full border border-slate-800 shadow-lg">
              <RefreshCw className="w-3.5 h-3.5" /> Click to flip & view cryptographic proof
            </div>
          </div>
        </div>

        {/* ================= BACK OF CARD ================= */}
        <div 
          className="absolute inset-0 backface-hidden w-full h-full rounded-3xl p-8 border"
          style={{ 
            background: 'linear-gradient(145deg, #0f172a 0%, #020617 100%)',
            borderColor: result === 'VALID' ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)',
            transform: 'rotateY(180deg)',
            boxShadow: '0 20px 50px -12px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)'
          }}
        >
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" /> Cryptographic Ledger
            </h3>
            {result !== 'NOT_FOUND' && (
              <div className="bg-white p-2 rounded-xl">
                 <QRCode value={currentUrl} size={64} />
              </div>
            )}
          </div>

          <div className="space-y-4">
             {/* Hashes */}
             {[
                { label: 'Credential ID', value: data.credential.credentialId },
                { label: 'Leaf Hash (SHA-256)', value: data.credential.leafHash },
                { label: 'Merkle Root (On-Chain)', value: data.credential.merkleRoot },
             ].filter(i => i.value).map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">{label}</p>
                  <p className="mono text-indigo-300/80 text-xs break-all bg-black/40 p-2.5 rounded-lg border border-slate-800">{value}</p>
                </div>
             ))}

             {/* Transaction */}
             {data.credential.txSignature && !data.credential.txSignature.startsWith('MOCK') && (
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Transaction Signature</p>
                  <a href={`https://sepolia.etherscan.io/tx/${data.credential.txSignature}`} target="_blank" rel="noreferrer"
                     className="mono text-blue-400 text-xs break-all bg-blue-950/30 p-2.5 rounded-lg border border-blue-900/50 flex items-center gap-2 hover:bg-blue-900/40 transition-colors">
                    {data.credential.txSignature} <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  </a>
                </div>
             )}

             {/* Timeline */}
             <div className="mt-4 pt-4 border-t border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-3">Verification Timeline</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Issued', time: data.credential.issuedAt, color: '#6366f1' },
                    { label: 'Verified', time: data.verifiedAt || new Date().toISOString(), color: '#818cf8' },
                  ].filter(i => i.time).map(({ label, time, color }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                      <div>
                         <p className="text-[10px] text-slate-500 font-bold uppercase">{label}</p>
                         <p className="mono text-[10px] text-slate-300">{new Date(time).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
          
          <div className="absolute bottom-6 left-0 w-full flex justify-center opacity-50 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-900 px-4 py-2 rounded-full border border-slate-800 shadow-lg">
              <RefreshCw className="w-3.5 h-3.5" /> Click to flip back
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
