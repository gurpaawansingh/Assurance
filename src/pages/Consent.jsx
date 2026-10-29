import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Check, ArrowRight } from 'lucide-react';
import { consent } from '@/components/safety/safetyUtils';

export default function Consent() {
  const nav = useNavigate();
  const [agree, setAgree] = useState(false);
  function proceed() { consent.set(); nav('/register'); }
  return (
    <div className="min-h-screen bg-[#F5F3FF] text-[#2D2A3D]">
      <header className="border-b border-[#C4B5FD]/40 bg-white/70 backdrop-blur">
        <div className="max-w-2xl mx-auto px-5 h-16 flex items-center gap-2 font-bold text-[#1E1033]">
          <span className="w-8 h-8 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center"><Shield size={18} /></span> ASSURANCE
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-5 py-8">
        <h1 className="text-2xl font-bold text-[#1E1033]">Before you begin — please read</h1>
        <p className="text-[#6B7280] mt-2 text-sm">ASSURANCE is a hackathon prototype that guides and assists. It does not replace emergency services or guarantee your safety.</p>
        <div className="mt-6 space-y-4">
          <div className="bg-white rounded-2xl border border-[#C4B5FD]/50 p-5">
            <h2 className="font-semibold text-[#1E1033]">What ASSURANCE does &amp; does not do</h2>
            <ul className="mt-2 text-sm text-[#6B7280] list-disc pl-5 space-y-1">
              <li>It guides and assists you; it does not contact anyone without your confirmation.</li>
              <li>AI features (CyberShield, risk engine) only advise — they never act or decide for you.</li>
              <li>It cannot send silent SMS/WhatsApp, run after the app closes, or perform OS-level hooks.</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-[#C4B5FD]/50 p-5">
            <h2 className="font-semibold text-[#1E1033]">Your session data is auto-deleted</h2>
            <p className="mt-2 text-sm text-[#6B7280]">Location history, check-in logs, temporary links, and media analyzed by CyberShield are deleted when a Guardian session or SOS event ends — except evidence you explicitly save to the Evidence Vault.</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#C4B5FD]/50 p-5">
            <h2 className="font-semibold text-[#1E1033]">What trusted contacts can see</h2>
            <p className="mt-2 text-sm text-[#6B7280]">Only contacts you mark as Guardian for a specific session, only while a session or temporary link is active. They never see past sessions, your Evidence Vault, or CyberShield conversations. <Link to="/location-visibility" className="text-[#7C3AED] font-medium">See the full Location Visibility page.</Link></p>
          </div>
        </div>
        <label className="flex items-start gap-3 mt-6 cursor-pointer select-none">
          <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="mt-1 w-5 h-5 accent-[#7C3AED]" />
          <span className="text-sm text-[#2D2A3D]">I understand and agree. I accept that ASSURANCE is a prototype that guides and assists, and does not guarantee safety or replace emergency services.</span>
        </label>
        <button disabled={!agree} onClick={proceed} className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-[#7C3AED] text-white rounded-full px-5 py-3 font-semibold disabled:opacity-40 enabled:hover:bg-[#6d28d9]">Continue to sign up <ArrowRight size={18} /></button>
      </main>
    </div>
  );
}