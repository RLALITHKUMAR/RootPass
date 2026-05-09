'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Loader2, CheckCircle, Copy, Check, ChevronDown, Globe, Mail, MapPin, Shield, Users, Briefcase, Phone, Hash, Link, FileText, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { registerIssuer } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

const ORG_TYPES = ['University', 'Enterprise', 'Government', 'Non-Profit', 'Healthcare', 'Financial Services', 'Legal Firm', 'Research Institute', 'Other'];
const INDUSTRIES = ['Education', 'Technology', 'Finance', 'Healthcare', 'Government', 'Legal', 'Manufacturing', 'Retail', 'Energy', 'Defense', 'Other'];
const EMPLOYEE_RANGES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'];
const COUNTRIES = ['United States', 'United Kingdom', 'India', 'Germany', 'Canada', 'Australia', 'Singapore', 'UAE', 'France', 'Japan', 'Other'];
const COMPLIANCE = [
  {
    id: 'ISO 27001',
    short: 'ISO 27001',
    full: 'Information Security Management System',
    desc: 'International standard for managing information security risks across an organization.',
    color: '#6366f1',
  },
  {
    id: 'SOC 2 Type II',
    short: 'SOC 2 Type II',
    full: 'Systems and Organization Controls 2 — Type II',
    desc: 'AICPA audit verifying security, availability, and confidentiality over a period of time.',
    color: '#818cf8',
  },
  {
    id: 'GDPR',
    short: 'GDPR',
    full: 'General Data Protection Regulation',
    desc: 'EU regulation governing personal data collection, processing, and storage rights.',
    color: '#a78bfa',
  },
  {
    id: 'HIPAA',
    short: 'HIPAA',
    full: 'Health Insurance Portability and Accountability Act',
    desc: 'US federal law mandating privacy and security of protected health information (PHI).',
    color: '#38bdf8',
  },
  {
    id: 'PCI-DSS',
    short: 'PCI-DSS',
    full: 'Payment Card Industry Data Security Standard',
    desc: 'Global standard ensuring organizations that handle card payments protect cardholder data.',
    color: '#34d399',
  },
  {
    id: 'FedRAMP',
    short: 'FedRAMP',
    full: 'Federal Risk and Authorization Management Program',
    desc: 'US government framework standardizing security assessment for cloud services.',
    color: '#fbbf24',
  },
  {
    id: 'CCPA',
    short: 'CCPA',
    full: 'California Consumer Privacy Act',
    desc: 'California state law granting consumers rights over their personal data held by businesses.',
    color: '#f87171',
  },
];

const STEPS = [
  { id: 1, label: 'Organization', icon: Building2 },
  { id: 2, label: 'Contact', icon: Mail },
  { id: 3, label: 'Compliance', icon: Shield },
  { id: 4, label: 'Web3 Identity', icon: Hash },
];

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">{children}</label>
);
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`input-field ${props.className || ''}`} />
);
const Select = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) => (
  <div className="relative">
    <select {...props} className="input-field appearance-none pr-10 cursor-pointer">{children}</select>
    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
  </div>
);

export default function RegisterPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedCompliance, setSelectedCompliance] = useState<string[]>([]);

  const [form, setForm] = useState({
    // Step 1 - Organization
    name: '', organizationType: 'University', industry: 'Education',
    foundedYear: '', employeeCount: '1-10', registrationNumber: '',
    description: '', tagline: '', logoUrl: '',
    // Step 2 - Contact
    contactEmail: '', contactPhone: '', supportEmail: '', website: '',
    linkedinUrl: '', twitterHandle: '', location: '', country: 'United States',
    city: '', postalCode: '', address: '',
    // Step 3 - Compliance
    accreditationBody: '', accreditationId: '', isPubliclyTraded: 'No',
    stockSymbol: '', taxId: '', regulatoryBody: '', notes: '',
    // Step 4 - Web3
    walletAddress: '', secondaryWallet: '', networkPreference: 'Ethereum Sepolia',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const toggleCompliance = (id: string) =>
    setSelectedCompliance(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const copyId = async (id: string) => {
    await navigator.clipboard.writeText(id);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const validateStep = () => {
    if (step === 1 && (!form.name || !form.description)) { toast({ type: 'error', title: 'Fill Organization Name & Description' }); return false; }
    if (step === 2 && !form.contactEmail) { toast({ type: 'error', title: 'Contact Email is required' }); return false; }
    if (step === 4 && !form.walletAddress) { toast({ type: 'error', title: 'Wallet Address is required' }); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.walletAddress) { toast({ type: 'error', title: 'Wallet Address required' }); return; }
    setLoading(true); setSuccess(null);
    try {
      const res = await registerIssuer({ ...form, complianceFrameworks: selectedCompliance });
      setSuccess(res.issuer);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#6366f1', '#818cf8', '#f8fafc'] });
      toast({ type: 'success', title: 'Issuer Registered!', message: `DID: ${res.issuer.did}` });
    } catch (err: any) {
      toast({ type: 'error', title: err?.response?.data?.message || 'Registration failed' });
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
          style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 0 40px rgba(16,185,129,0.3)' }}>
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">Register as Issuer</h1>
        <p className="text-slate-400 mt-2 font-light">Complete your organization profile to become a trusted RootPass credential issuer</p>
      </motion.div>

      {/* Step Progress */}
      <div className="flex items-center justify-between mb-10 px-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = step === s.id; const done = step > s.id;
          return (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 font-bold
                  ${done ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]' : active ? 'bg-indigo-500/20 border-2 border-indigo-500 text-indigo-400' : 'bg-slate-800/50 border border-slate-700 text-slate-600'}`}>
                  {done ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs mt-2 font-semibold tracking-wide ${active || done ? 'text-indigo-400' : 'text-slate-600'}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-3 mt-[-16px]"
                  style={{ background: step > s.id ? '#6366f1' : 'rgba(255,255,255,0.05)' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Success Card */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="card mb-8" style={{ borderColor: 'rgba(16,185,129,0.4)', borderWidth: 1 }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)' }}>
                <CheckCircle className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-indigo-400 text-lg mb-4">🎉 Issuer Successfully Registered</h3>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  {[
                    { label: 'Issuer ID', value: success.issuerId, mono: true, copy: true },
                    { label: 'DID', value: success.did, mono: true },
                    { label: 'Organization', value: success.name },
                    { label: 'Type', value: success.organizationType },
                    { label: 'Wallet', value: `${success.walletAddress?.slice(0,10)}…${success.walletAddress?.slice(-8)}`, mono: true },
                    { label: 'Merkle Root', value: `${success.merkleRoot?.slice(0,20)}…`, mono: true },
                  ].map(({ label, value, mono, copy }) => (
                    <div key={label} className="flex flex-col gap-1 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-slate-200 break-all ${mono ? 'mono text-xs' : 'text-sm'}`}>{value}</span>
                        {copy && <button onClick={() => copyId(value)} className="text-slate-500 hover:text-indigo-400 flex-shrink-0">
                          {copied ? <Check className="w-3.5 h-3.5 text-indigo-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-slate-500 border-t border-white/5 pt-4">
                  ⚠️ Save your Issuer ID — you will need it to issue credentials on the platform.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
        onSubmit={handleSubmit} className="card">

        <AnimatePresence mode="wait">
          {/* ── STEP 1: Organization ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <Building2 className="w-5 h-5 text-indigo-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">Organization Profile</h2>
                  <p className="text-sm text-slate-500">Basic details about your institution</p>
                </div>
              </div>

              <div>
                <Label>Organization Legal Name *</Label>
                <Input placeholder="e.g. Massachusetts Institute of Technology" value={form.name} onChange={e => set('name', e.target.value)} required />
              </div>

              <div>
                <Label>Tagline / Motto</Label>
                <Input placeholder="e.g. Mind and Hand — making a difference for the world" value={form.tagline} onChange={e => set('tagline', e.target.value)} />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label>Organization Type *</Label>
                  <Select value={form.organizationType} onChange={e => set('organizationType', e.target.value)}>
                    {ORG_TYPES.map(t => <option key={t}>{t}</option>)}
                  </Select>
                </div>
                <div>
                  <Label>Industry / Sector</Label>
                  <Select value={form.industry} onChange={e => set('industry', e.target.value)}>
                    {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label>Year Founded</Label>
                  <Input placeholder="e.g. 1861" type="number" min="1000" max="2025" value={form.foundedYear} onChange={e => set('foundedYear', e.target.value)} />
                </div>
                <div>
                  <Label>Number of Employees</Label>
                  <Select value={form.employeeCount} onChange={e => set('employeeCount', e.target.value)}>
                    {EMPLOYEE_RANGES.map(r => <option key={r}>{r}</option>)}
                  </Select>
                </div>
              </div>

              <div>
                <Label>Official Registration / Charter Number</Label>
                <Input placeholder="e.g. EIN: 04-2103594 or Company Reg No." value={form.registrationNumber} onChange={e => set('registrationNumber', e.target.value)} />
              </div>

              <div>
                <Label>Organization Description *</Label>
                <textarea className="input-field min-h-[120px] resize-none" placeholder="Describe your organization's mission, the types of credentials you issue, and why institutions trust you…"
                  value={form.description} onChange={e => set('description', e.target.value)} required />
              </div>

              <div>
                <Label>Logo URL</Label>
                <Input placeholder="https://yourorg.com/logo.png" type="url" value={form.logoUrl} onChange={e => set('logoUrl', e.target.value)} />
              </div>

              <button type="button" onClick={() => validateStep() && setStep(2)} className="btn-primary w-full justify-center py-4 text-base">
                Continue to Contact Details →
              </button>
            </motion.div>
          )}

          {/* ── STEP 2: Contact ── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <Mail className="w-5 h-5 text-indigo-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">Contact & Location</h2>
                  <p className="text-sm text-slate-500">How to reach your organization</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label>Primary Contact Email *</Label>
                  <Input placeholder="admin@yourorg.com" type="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} required />
                </div>
                <div>
                  <Label>Support / Verification Email</Label>
                  <Input placeholder="verify@yourorg.com" type="email" value={form.supportEmail} onChange={e => set('supportEmail', e.target.value)} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label>Phone Number</Label>
                  <Input placeholder="+1 (617) 253-1000" type="tel" value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} />
                </div>
                <div>
                  <Label>Official Website</Label>
                  <Input placeholder="https://www.yourorg.com" type="url" value={form.website} onChange={e => set('website', e.target.value)} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label>LinkedIn URL</Label>
                  <Input placeholder="https://linkedin.com/company/yourorg" type="url" value={form.linkedinUrl} onChange={e => set('linkedinUrl', e.target.value)} />
                </div>
                <div>
                  <Label>Twitter / X Handle</Label>
                  <Input placeholder="@yourorg" value={form.twitterHandle} onChange={e => set('twitterHandle', e.target.value)} />
                </div>
              </div>

              <div className="h-px bg-white/5" />
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Registered Address</h3>

              <div>
                <Label>Street Address</Label>
                <Input placeholder="77 Massachusetts Avenue" value={form.address} onChange={e => set('address', e.target.value)} />
              </div>

              <div className="grid sm:grid-cols-3 gap-5">
                <div>
                  <Label>City</Label>
                  <Input placeholder="Cambridge" value={form.city} onChange={e => set('city', e.target.value)} />
                </div>
                <div>
                  <Label>Country</Label>
                  <Select value={form.country} onChange={e => set('country', e.target.value)}>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </Select>
                </div>
                <div>
                  <Label>Postal Code</Label>
                  <Input placeholder="02139" value={form.postalCode} onChange={e => set('postalCode', e.target.value)} />
                </div>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 rounded-2xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all font-semibold">
                  ← Back
                </button>
                <button type="button" onClick={() => validateStep() && setStep(3)} className="btn-primary flex-[2] justify-center py-4 text-base">
                  Continue to Compliance →
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Compliance ── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <Shield className="w-5 h-5 text-indigo-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">Compliance & Accreditation</h2>
                  <p className="text-sm text-slate-500">Certify your organization's compliance posture</p>
                </div>
              </div>

              <div>
                <Label>Compliance Frameworks (select all that apply)</Label>
                <div className="grid sm:grid-cols-2 gap-3 mt-2">
                  {COMPLIANCE.map(c => {
                    const selected = selectedCompliance.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCompliance(c.id)}
                        className="text-left rounded-2xl p-4 transition-all duration-300 border relative overflow-hidden"
                        style={{
                          background: selected
                            ? `linear-gradient(135deg, ${c.color}18, ${c.color}08)`
                            : 'rgba(255,255,255,0.02)',
                          borderColor: selected ? c.color + '60' : 'rgba(255,255,255,0.07)',
                          boxShadow: selected ? `0 0 20px ${c.color}18` : 'none',
                        }}
                      >
                        {/* Selected checkmark */}
                        {selected && (
                          <div
                            className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                            style={{ background: c.color, color: '#000' }}
                          >
                            ✓
                          </div>
                        )}
                        {/* Acronym badge */}
                        <div
                          className="inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg mb-2"
                          style={{
                            background: `${c.color}18`,
                            color: c.color,
                            border: `1px solid ${c.color}30`,
                          }}
                        >
                          {c.short}
                        </div>
                        {/* Full name */}
                        <p className="text-sm font-bold text-white leading-tight mb-1.5">
                          {c.full}
                        </p>
                        {/* Description */}
                        <p className="text-[11px] text-slate-500 leading-relaxed font-light">
                          {c.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label>Accreditation Body</Label>
                  <Input placeholder="e.g. ABET, AACSB, WASC, NAAC" value={form.accreditationBody} onChange={e => set('accreditationBody', e.target.value)} />
                </div>
                <div>
                  <Label>Accreditation ID / Number</Label>
                  <Input placeholder="e.g. ACC-2024-MIT-001" value={form.accreditationId} onChange={e => set('accreditationId', e.target.value)} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label>Tax ID / EIN</Label>
                  <Input placeholder="e.g. 04-2103594" value={form.taxId} onChange={e => set('taxId', e.target.value)} />
                </div>
                <div>
                  <Label>Regulatory Body</Label>
                  <Input placeholder="e.g. SEC, FCA, RBI, UGC" value={form.regulatoryBody} onChange={e => set('regulatoryBody', e.target.value)} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label>Publicly Traded?</Label>
                  <Select value={form.isPubliclyTraded} onChange={e => set('isPubliclyTraded', e.target.value)}>
                    {['No', 'Yes'].map(v => <option key={v}>{v}</option>)}
                  </Select>
                </div>
                {form.isPubliclyTraded === 'Yes' && (
                  <div>
                    <Label>Stock Symbol</Label>
                    <Input placeholder="e.g. AAPL, GOOGL" value={form.stockSymbol} onChange={e => set('stockSymbol', e.target.value)} className="mono" />
                  </div>
                )}
              </div>

              <div>
                <Label>Additional Compliance Notes</Label>
                <textarea className="input-field min-h-[80px] resize-none" placeholder="Any additional regulatory context, certifications, or audits…"
                  value={form.notes} onChange={e => set('notes', e.target.value)} />
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(2)} className="flex-1 py-4 rounded-2xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all font-semibold">
                  ← Back
                </button>
                <button type="button" onClick={() => setStep(4)} className="btn-primary flex-[2] justify-center py-4 text-base">
                  Continue to Web3 Identity →
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 4: Web3 Identity ── */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <Hash className="w-5 h-5 text-indigo-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">Web3 Identity & Blockchain</h2>
                  <p className="text-sm text-slate-500">Link your Ethereum wallet to anchor your DID on-chain</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Primary EVM Wallet Address *</Label>
                  <button type="button" onClick={async () => {
                    try {
                      if ((window as any).ethereum) {
                        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
                        if (accounts[0]) set('walletAddress', accounts[0]);
                        toast({ type: 'success', title: 'MetaMask Connected!' });
                      } else toast({ type: 'error', title: 'MetaMask not detected' });
                    } catch (err: any) { toast({ type: 'error', title: err.message }); }
                  }} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20 transition-all hover:bg-indigo-500/20 flex items-center gap-2">
                    🦊 Connect MetaMask
                  </button>
                </div>
                <Input placeholder="0x71C7656EC7ab88b098defB751B7401B5f6d8976F" value={form.walletAddress} onChange={e => set('walletAddress', e.target.value)} className="mono" required />
                <p className="text-xs text-slate-600 mt-2">This wallet will be the cryptographic authority for all credentials issued under your DID.</p>
              </div>

              <div>
                <Label>Secondary / Backup Wallet <span className="text-slate-600 normal-case font-normal">(optional)</span></Label>
                <Input placeholder="0x…" value={form.secondaryWallet} onChange={e => set('secondaryWallet', e.target.value)} className="mono" />
              </div>

              {/* Info box */}
              <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <p className="text-sm font-bold text-indigo-400">🔑 What happens when you register</p>
                <div className="space-y-2 text-sm text-slate-400">
                  {[
                    '1. A unique Decentralized Identifier (DID) is generated from your wallet',
                    '2. Your DID is anchored in the RootPass registry on Ethereum Sepolia',
                    '3. An empty Merkle tree is initialized for your credentials',
                    '4. You can begin issuing cryptographically signed credentials immediately',
                  ].map(t => <p key={t} className="font-light">{t}</p>)}
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Registration Summary</p>
                <div className="grid sm:grid-cols-2 gap-2 text-sm">
                  {[
                    ['Organization', form.name || '—'],
                    ['Type', form.organizationType],
                    ['Country', form.country],
                    ['Email', form.contactEmail || '—'],
                    ['Compliance', selectedCompliance.length ? selectedCompliance.map(id => COMPLIANCE.find(c => c.id === id)?.full || id).join(' · ') : 'None selected'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <span className="text-slate-600 w-28 flex-shrink-0">{k}</span>
                      <span className="text-slate-300 truncate">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(3)} className="flex-1 py-4 rounded-2xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all font-semibold">
                  ← Back
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-[2] justify-center py-4 text-base">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Registering…</> : <><Shield className="w-4 h-4" /> Register Issuer</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>
    </div>
  );
}
