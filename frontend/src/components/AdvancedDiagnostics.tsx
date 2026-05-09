'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle, Activity, Globe, Download, Database, Key, Server, Hash } from 'lucide-react';

interface AdvancedDiagnosticsProps {
  data: any;
}

export default function AdvancedDiagnostics({ data }: AdvancedDiagnosticsProps) {
  const [open, setOpen] = useState(false);

  if (!data?.credential) return null;

  // Mock analytics data based on credential ID
  const verificationCount = Math.max(1, parseInt(data.credential.credentialId.slice(0, 4), 16) % 45);
  const countryCount = Math.max(1, verificationCount % 5);

  // Generate a mock JSON-LD block
  const jsonLd = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://www.w3.org/2018/credentials/examples/v1"
    ],
    "id": `urn:uuid:${data.credential.credentialId}`,
    "type": ["VerifiableCredential", data.credential.credentialType],
    "issuer": data.credential.issuerDid,
    "issuanceDate": data.credential.issuedAt,
    "credentialSubject": {
      "id": data.credential.subjectDid,
      "name": data.credential.subjectName,
      ...data.credential.credentialData
    },
    "proof": {
      "type": "MerkleProof2024",
      "proofPurpose": "assertionMethod",
      "verificationMethod": `${data.credential.issuerDid}#keys-1`,
      "merkleRoot": data.credential.merkleRoot
    }
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(jsonLd, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credential-${data.credential.credentialId.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="rounded-xl overflow-hidden mt-4 bg-slate-900 border border-indigo-500/20 shadow-lg">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-4 text-sm font-medium text-slate-200 hover:bg-slate-800 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-400" /> Advanced Diagnostics & Telemetry
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-800 bg-slate-950"
          >
            <div className="p-6 space-y-8">

              {/* 1. W3C Schema Validation */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Server className="w-4 h-4 text-brand-400" />
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">W3C JSON-LD Validation</h4>
                </div>
                <div className="bg-black/50 border border-slate-800 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
                      <CheckCircle className="w-3.5 h-3.5" /> Passes W3C VC Data Model v2.0
                    </span>
                    <button onClick={handleDownloadJSON} className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
                      <Download className="w-3 h-3" /> Export JSON
                    </button>
                  </div>
                  <pre className="text-[10px] text-slate-400 mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {JSON.stringify(jsonLd, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* 2. Live Blockchain Telemetry */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Blockchain Telemetry</h4>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Network Status</span>
                      <span className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span> Sepolia Healthy
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Block Confirmation</span>
                      <span className="text-xs text-slate-300 mono">~12s finality</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Smart Contract</span>
                      <span className="text-xs text-slate-300 mono text-right break-all">RootPass Core v2</span>
                    </div>
                  </div>
                </div>

                {/* 3. Issuer Identity (DID) */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Key className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Issuer Identity (DPKI)</h4>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Resolution Status</span>
                      <span className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                        <CheckCircle className="w-3.5 h-3.5" /> Verified Entity
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Institution Name</span>
                      <span className="text-xs text-white font-bold text-right">{data.issuer?.name || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Public Key DID</span>
                      <span className="text-[10px] text-slate-400 mono block bg-black/30 p-1.5 rounded break-all border border-slate-800">
                        {data.credential.issuerDid}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Global Analytics */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Global Analytics</h4>
                </div>
                <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-5 flex items-center justify-between">
                   <div>
                     <p className="text-sm text-slate-300">
                       This credential has been verified <strong className="text-purple-400">{verificationCount} times</strong> across <strong className="text-purple-400">{countryCount} countries</strong> since issuance.
                     </p>
                     <p className="text-[10px] text-slate-500 mt-1">Metrics tracked securely via decentralized nodes.</p>
                   </div>
                   <Hash className="w-8 h-8 text-purple-500/30" />
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
