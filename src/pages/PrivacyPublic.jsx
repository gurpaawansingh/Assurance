import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Eye, Clock, Lock, Cpu, Trash2, Users } from 'lucide-react';

const PRINCIPLES = [
  { icon: Eye, t: 'User action before sharing', d: 'Location sharing begins only after an explicit action, never automatically.' },
  { icon: Users, t: 'Consent-based contacts', d: 'You choose your trusted contacts and alert rules.' },
  { icon: Clock, t: 'Temporary links', d: 'Location links expire after a fixed window and do not auto-renew.' },
  { icon: Trash2, t: 'Minimal retention', d: 'Session data is auto-deleted when a session or SOS ends, except evidence you save.' },
  { icon: Cpu, t: 'On-device analysis', d: 'Sensitive signals are analyzed locally where technically possible.' },
  { icon: Lock, t: 'Encrypted evidence', d: 'Evidence is encrypted client-side and never exposed via public URLs.' },
];

export default function PrivacyPublic() {
  return (
    <div className="min-h-screen bg-[#F5F3FF] text-[#2D2A3D]">
      <header className="border-b border-[#C4B5FD]/40 bg-white/70 backdrop-blur"><div className="max-w-3xl mx-auto px-5 h-16 flex items-center gap-2 font-bold text-[#1E1033]"><span className="w-8 h-8 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center"><Shield size={18} /></span> ASSURANCE</div></header>
      <main className="max-w-3xl mx-auto px-5 py-10">
        <h1 className="text-3xl font-bold text-[#1E1033]">Privacy by design</h1>
        <p className="text-[#6B7280] mt-2 max-w-xl">ASSURANCE protects users without requiring constant surveillance. Here's how.</p>
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          {PRINCIPLES.map(p => (
            <div key={p.t} className="bg-white rounded-2xl border border-[#C4B5FD]/50 p-5">
              <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center mb-3"><p.icon size={20} /></div>
              <h2 className="font-semibold text-[#1E1033]">{p.t}</h2>
              <p className="text-sm text-[#6B7280] mt-1">{p.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 bg-[#1E1033] text-white rounded-3xl p-6">
          <h2 className="font-bold">What ASSURANCE does not do</h2>
          <ul className="text-violet-200/80 text-sm mt-2 list-disc pl-5 space-y-1">
            <li>No 24/7 background tracking.</li>
            <li>No automatic location sharing without explicit activation.</li>
            <li>No silent SMS/WhatsApp sending (browsers can't).</li>
            <li>No public or permanent location links.</li>
            <li>No access between users' private data.</li>
          </ul>
        </div>
        <Link to="/consent" className="mt-6 inline-flex items-center bg-[#7C3AED] text-white rounded-full px-5 py-3 font-semibold">Get started</Link>
      </main>
    </div>
  );
}