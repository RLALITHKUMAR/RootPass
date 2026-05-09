'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronDown, Loader2, CheckCircle, ExternalLink, User, FileText, BookOpen, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';
import { issueCredential, listIssuers } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import LiveCredentialPreview from '@/components/LiveCredentialPreview';

const CREDENTIAL_TYPES = ['University Degree', 'Postgraduate Diploma', 'Professional Certificate', 'Identity Verification', 'Employment Record', 'Medical License', 'Driver License', 'Professional Membership', 'Skill Badge', 'Course Completion', 'Research Publication', 'Award / Honor', 'Custom'];
const DEGREE_LEVELS = ['High School Diploma', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'MBA', 'Doctorate (PhD)', 'Postdoctoral', 'Professional Degree (MD/JD)', 'Diploma', 'Certificate'];
const GRADE_SYSTEMS = ['GPA (0-4.0)', 'Percentage (%)', 'First Class / Second Class', 'Pass / Fail', 'CGPA (0-10)', 'Other'];
const HONOR_TYPES = ['Summa Cum Laude', 'Magna Cum Laude', 'Cum Laude', 'With Distinction', 'With Merit', 'None'];

const STEPS = [
  { id: 1, label: 'Subject', icon: User },
  { id: 2, label: 'Credential', icon: BookOpen },
  { id: 3, label: 'Finalize', icon: Shield },
];

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">{children}</label>
);
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`input-field ${props.className || ''}`} />
);
const Sel = ({ children, value, onChange }: { children: React.ReactNode; value: string; onChange: (e: any) => void }) => (
  <div className="relative">
    <select value={value} onChange={onChange} className="input-field appearance-none pr-10 cursor-pointer">{children}</select>
    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
  </div>
);

export default function IssuePage() {
  const { toast } = useToast();
  const [issuers, setIssuers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    // Step 1 - Subject
    issuerId: '', subjectName: '', subjectDid: '', subjectEmail: '', subjectDateOfBirth: '',
    subjectNationality: '', subjectStudentId: '', subjectPhoneNumber: '',
    // Step 2 - Credential Details
    credentialType: 'University Degree', degreeLevel: "Bachelor's Degree", gradeSystem: 'GPA (0-4.0)',
    institution: '', department: '', major: '', minor: '', specialization: '',
    graduationYear: '', graduationMonth: '', grade: '', honor: 'None',
    thesisTitle: '', credentialTitle: '', expiryDate: '', issueDate: '',
    credentialNumber: '', courseCode: '', accreditationBody: '', licenseNumber: '',
    issueReason: '', additionalNotes: '',
  });

  useEffect(() => {
    listIssuers().then(r => {
      setIssuers(r.issuers || []);
      if (r.issuers?.length > 0) setForm(f => ({ ...f, issuerId: r.issuers[0].issuerId }));
    }).catch(() => {});
  }, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const validateStep = () => {
    if (step === 1 && (!form.issuerId || !form.subjectName)) {
      toast({ type: 'error', title: 'Issuer and Subject Name required' }); return false;
    }
    if (step === 2 && !form.institution) {
      toast({ type: 'error', title: 'Institution name is required' }); return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.issuerId || !form.subjectName) {
      toast({ type: 'error', title: 'Missing required fields' }); return;
    }
    setLoading(true); setSuccess(null);
    try {
      const res = await issueCredential({
        issuerId: form.issuerId,
        subjectDid: form.subjectDid || `did:rootpass:subject:${Date.now()}`,
        subjectName: form.subjectName,
        credentialType: form.credentialType,
        expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : undefined,
        credentialData: {
          credentialTitle: form.credentialTitle || form.credentialType,
          degreeLevel: form.degreeLevel, gradeSystem: form.gradeSystem,
          institution: form.institution, department: form.department,
          major: form.major, minor: form.minor, specialization: form.specialization,
          graduationYear: form.graduationYear, graduationMonth: form.graduationMonth,
          grade: form.grade, honor: form.honor, thesisTitle: form.thesisTitle,
          credentialNumber: form.credentialNumber, courseCode: form.courseCode,
          accreditationBody: form.accreditationBody, licenseNumber: form.licenseNumber,
          issueReason: form.issueReason, additionalNotes: form.additionalNotes,
          subjectEmail: form.subjectEmail, subjectStudentId: form.subjectStudentId,
          subjectNationality: form.subjectNationality,
        },
      });
      setSuccess(res);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#6366f1', '#818cf8', '#f8fafc'] });
      toast({ type: 'success', title: 'Credential Issued!', message: 'Merkle root updated on Ethereum' });
      setStep(1);
    } catch (err: any) {
      toast({ type: 'error', title: 'Issue failed', message: err?.response?.data?.message || 'Check backend' });
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="lg:grid lg:grid-cols-[1fr_400px] lg:gap-10 lg:items-start">

        {/* ── Left Column: Form ── */}
        <div>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
          style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 0 40px rgba(16,185,129,0.3)' }}>
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">Issue Credential</h1>
        <p className="text-slate-400 mt-2 font-light">Create a cryptographically signed, Merkle-anchored credential on Ethereum Sepolia</p>
      </motion.div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-10 px-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon; const active = step === s.id; const done = step > s.id;
          return (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500
                  ${done ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]' : active ? 'bg-indigo-500/20 border-2 border-indigo-500 text-indigo-400' : 'bg-slate-800/50 border border-slate-700 text-slate-600'}`}>
                  {done ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs mt-2 font-semibold tracking-wide ${active || done ? 'text-indigo-400' : 'text-slate-600'}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className="flex-1 h-0.5 mx-3 mt-[-16px]" style={{ background: step > s.id ? '#6366f1' : 'rgba(255,255,255,0.05)' }} />}
            </div>
          );
        })}
      </div>

      {/* Success Result */}
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
                <h3 className="font-black text-indigo-400 text-lg mb-4">🎉 Credential Issued Successfully</h3>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  {[
                    { label: 'Credential ID', value: success.credential?.credentialId },
                    { label: 'Merkle Root', value: success.merkleRoot?.slice(0, 32) + '…' },
                    { label: 'Root Version', value: `v${success.rootVersion}` },
                    { label: 'Proof Depth', value: `${success.proof?.proof?.length ?? 0} siblings` },
                    { label: 'Tx Hash', value: success.txSignature?.slice(0, 20) + '…' },
                    { label: 'Status', value: 'ACTIVE ✅' },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">{label}</p>
                      <p className="mono text-slate-200 text-xs break-all">{value}</p>
                    </div>
                  ))}
                </div>
                {success.txSignature && !success.txSignature.startsWith('MOCK') && (
                  <a href={`https://sepolia.etherscan.io/tx/${success.txSignature}`} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-2 mt-4 text-sm text-indigo-400 hover:text-indigo-300 font-semibold">
                    <ExternalLink className="w-4 h-4" /> View on Etherscan Sepolia
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
        onSubmit={handleSubmit} className="card">
        <AnimatePresence mode="wait">

          {/* ── STEP 1: Subject Identity ── */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <User className="w-5 h-5 text-indigo-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">Subject Identity</h2>
                  <p className="text-sm text-slate-500">Information about the credential recipient</p>
                </div>
              </div>

              <div>
                <Label>Issuing Organization *</Label>
                {issuers.length === 0 ? (
                  <div className="input-field text-slate-500 text-sm">
                    No issuers found. <a href="/register" className="text-indigo-400 hover:underline">Register one first →</a>
                  </div>
                ) : (
                  <Sel value={form.issuerId} onChange={e => set('issuerId', e.target.value)}>
                    {issuers.map((i: any) => <option key={i.issuerId} value={i.issuerId}>{i.name} ({i.walletAddress.slice(0, 8)}…)</option>)}
                  </Sel>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label>Full Legal Name *</Label>
                  <Input placeholder="e.g. Alice Marie Johnson" value={form.subjectName} onChange={e => set('subjectName', e.target.value)} required />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input type="date" value={form.subjectDateOfBirth} onChange={e => set('subjectDateOfBirth', e.target.value)} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label>Email Address</Label>
                  <Input placeholder="alice@example.com" type="email" value={form.subjectEmail} onChange={e => set('subjectEmail', e.target.value)} />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input placeholder="+1 (555) 000-0000" type="tel" value={form.subjectPhoneNumber} onChange={e => set('subjectPhoneNumber', e.target.value)} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label>Student / Employee ID</Label>
                  <Input placeholder="e.g. STU-2024-001234" value={form.subjectStudentId} onChange={e => set('subjectStudentId', e.target.value)} className="mono" />
                </div>
                <div>
                  <Label>Nationality / Citizenship</Label>
                  <Input placeholder="e.g. American, Indian, British" value={form.subjectNationality} onChange={e => set('subjectNationality', e.target.value)} />
                </div>
              </div>

              <div>
                <Label>Subject DID <span className="text-slate-600 normal-case font-normal">(auto-generated if left blank)</span></Label>
                <Input placeholder="did:rootpass:subject:…" value={form.subjectDid} onChange={e => set('subjectDid', e.target.value)} className="mono" />
              </div>

              <button type="button" onClick={() => validateStep() && setStep(2)} className="btn-primary w-full justify-center py-4 text-base">
                Continue to Credential Details →
              </button>
            </motion.div>
          )}

          {/* ── STEP 2: Credential Data ── */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">Credential Details</h2>
                  <p className="text-sm text-slate-500">Full academic and professional credential metadata</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label>Credential Type *</Label>
                  <Sel value={form.credentialType} onChange={e => set('credentialType', e.target.value)}>
                    {CREDENTIAL_TYPES.map(t => <option key={t}>{t}</option>)}
                  </Sel>
                </div>
                <div>
                  <Label>Credential / Award Title</Label>
                  <Input placeholder="e.g. Bachelor of Science in Computer Science" value={form.credentialTitle} onChange={e => set('credentialTitle', e.target.value)} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label>Degree Level</Label>
                  <Sel value={form.degreeLevel} onChange={e => set('degreeLevel', e.target.value)}>
                    {DEGREE_LEVELS.map(d => <option key={d}>{d}</option>)}
                  </Sel>
                </div>
                <div>
                  <Label>Credential Reference Number</Label>
                  <Input placeholder="e.g. MIT-CRED-2024-0042" value={form.credentialNumber} onChange={e => set('credentialNumber', e.target.value)} className="mono" />
                </div>
              </div>

              <div>
                <Label>Issuing Institution / Organization *</Label>
                <Input placeholder="e.g. Massachusetts Institute of Technology" value={form.institution} onChange={e => set('institution', e.target.value)} required />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label>Department / Faculty</Label>
                  <Input placeholder="e.g. School of Engineering" value={form.department} onChange={e => set('department', e.target.value)} />
                </div>
                <div>
                  <Label>Accreditation Body</Label>
                  <Input placeholder="e.g. ABET, AACSB" value={form.accreditationBody} onChange={e => set('accreditationBody', e.target.value)} />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-5">
                <div>
                  <Label>Major / Primary Field</Label>
                  <Input placeholder="Computer Science" value={form.major} onChange={e => set('major', e.target.value)} />
                </div>
                <div>
                  <Label>Minor / Secondary Field</Label>
                  <Input placeholder="Mathematics" value={form.minor} onChange={e => set('minor', e.target.value)} />
                </div>
                <div>
                  <Label>Specialization / Track</Label>
                  <Input placeholder="AI & Machine Learning" value={form.specialization} onChange={e => set('specialization', e.target.value)} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label>Grading System</Label>
                  <Sel value={form.gradeSystem} onChange={e => set('gradeSystem', e.target.value)}>
                    {GRADE_SYSTEMS.map(g => <option key={g}>{g}</option>)}
                  </Sel>
                </div>
                <div>
                  <Label>Grade / Score Achieved</Label>
                  <Input placeholder="e.g. 3.92 / 4.0 or 94%" value={form.grade} onChange={e => set('grade', e.target.value)} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label>Latin Honors / Distinction</Label>
                  <Sel value={form.honor} onChange={e => set('honor', e.target.value)}>
                    {HONOR_TYPES.map(h => <option key={h}>{h}</option>)}
                  </Sel>
                </div>
                <div>
                  <Label>License / Certificate Number</Label>
                  <Input placeholder="e.g. LIC-2024-98765" value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} className="mono" />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-5">
                <div>
                  <Label>Graduation Month</Label>
                  <Sel value={form.graduationMonth} onChange={e => set('graduationMonth', e.target.value)}>
                    {['', 'January','February','March','April','May','June','July','August','September','October','November','December'].map(m => <option key={m}>{m}</option>)}
                  </Sel>
                </div>
                <div>
                  <Label>Graduation Year</Label>
                  <Input placeholder="2024" type="number" value={form.graduationYear} onChange={e => set('graduationYear', e.target.value)} />
                </div>
                <div>
                  <Label>Expiry Date <span className="text-slate-600 font-normal normal-case">(if applicable)</span></Label>
                  <Input type="date" value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} />
                </div>
              </div>

              <div>
                <Label>Thesis / Research Title <span className="text-slate-600 font-normal normal-case">(optional)</span></Label>
                <Input placeholder="e.g. Scalable Zero-Knowledge Proof Systems for Decentralized Identity" value={form.thesisTitle} onChange={e => set('thesisTitle', e.target.value)} />
              </div>

              <div>
                <Label>Reason for Issuance / Additional Notes</Label>
                <textarea className="input-field min-h-[80px] resize-none" placeholder="e.g. Awarded for completing the 4-year program with distinction…"
                  value={form.additionalNotes} onChange={e => set('additionalNotes', e.target.value)} />
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 rounded-2xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all font-semibold">
                  ← Back
                </button>
                <button type="button" onClick={() => validateStep() && setStep(3)} className="btn-primary flex-[2] justify-center py-4 text-base">
                  Review & Finalize →
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Review & Issue ── */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <Shield className="w-5 h-5 text-indigo-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">Review & Issue on Ethereum</h2>
                  <p className="text-sm text-slate-500">Confirm all details before anchoring on-chain</p>
                </div>
              </div>

              {/* Summary grid */}
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { section: 'Subject', items: [
                    ['Full Name', form.subjectName],
                    ['Email', form.subjectEmail || '—'],
                    ['Student ID', form.subjectStudentId || '—'],
                    ['Nationality', form.subjectNationality || '—'],
                  ]},
                  { section: 'Credential', items: [
                    ['Type', form.credentialType],
                    ['Level', form.degreeLevel],
                    ['Title', form.credentialTitle || form.credentialType],
                    ['Reference #', form.credentialNumber || '—'],
                  ]},
                  { section: 'Academic', items: [
                    ['Institution', form.institution || '—'],
                    ['Major', form.major || '—'],
                    ['Grade', form.grade || '—'],
                    ['Honors', form.honor],
                  ]},
                  { section: 'Dates', items: [
                    ['Graduated', `${form.graduationMonth} ${form.graduationYear}` || '—'],
                    ['Expires', form.expiryDate || 'Does not expire'],
                    ['Accreditation', form.accreditationBody || '—'],
                    ['Thesis', form.thesisTitle ? form.thesisTitle.slice(0, 30) + '…' : '—'],
                  ]},
                ].map(({ section, items }) => (
                  <div key={section} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">{section}</p>
                    {items.map(([k, v]) => (
                      <div key={k} className="flex gap-2 text-sm mb-2">
                        <span className="text-slate-600 w-28 flex-shrink-0">{k}</span>
                        <span className="text-slate-300 truncate font-light">{v}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* How it works */}
              <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <p className="text-sm font-bold text-indigo-400">🌳 What happens on Issue</p>
                <div className="grid sm:grid-cols-2 gap-2 text-sm text-slate-400 font-light">
                  {[
                    '1. Credential data is hashed: SHA256(credentialId + subjectDid + issuerDid + status)',
                    '2. Hash becomes a leaf in the issuer\'s Merkle tree',
                    '3. Tree is rebuilt with all active credentials',
                    '4. New 32-byte Merkle root published to Ethereum Sepolia',
                  ].map(t => <p key={t}>{t}</p>)}
                </div>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(2)} className="flex-1 py-4 rounded-2xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all font-semibold">
                  ← Back
                </button>
                <button type="submit" disabled={loading || issuers.length === 0} className="btn-primary flex-[2] justify-center py-4 text-base">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Issuing on Ethereum…</> : <><Shield className="w-4 h-4" /> Issue & Anchor on Ethereum</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>

      <p className="text-center text-sm text-slate-600 mt-6">
        No issuer registered? <a href="/register" className="text-indigo-400 hover:underline">Register your organization →</a>
      </p>
        </div>

        {/* Right Column: Live Preview desktop only */}
        <div className="hidden lg:block">
          <LiveCredentialPreview form={form} issuers={issuers} step={step} />
        </div>

      </div>
    </div>
  );
}
