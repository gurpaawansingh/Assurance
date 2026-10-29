import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Clock, Lock, ShieldOff } from 'lucide-react';
import { locLink } from '@/components/safety/safetyUtils';

export default function LocationVisibility() {
  const token = new URLSearchParams(window.location.search).get('token');
  const link = locLink.get();
  const expired = !link || (link.expiresAt && link.expiresAt < Date.now()) || (token && link?.token !== token);

  if (token) {
    return (
      <div className="min-h-screen bg-[#1E1033] text-white flex flex-col items-center justify-center p-6 text-center">
        {expired ? <>
          <Clock size={40} className="text-[#A78BFA]" />
          <h1 className="text-2xl font-bold mt-3">Location sharing expired</h1>
          <p className="text-violet-200/70 mt-2 text-sm max-w-sm">This temporary link is no longer active. Location sharing does not restart automatically.</p>
        </> : <>
          <Eye size={40} className="text-[#A78BFA]" />
          <h1 className="text-2xl font-bold mt-3">Guardian view (read-only)</h1>
          <p className="text-violet-200/70 mt-2 text-sm max-w-sm">You are viewing a temporary, authenticated location link for an active session. Expires in {Math.ceil((link.expiresAt - Date.now()) / 60000)} min.</p>
          <a href="https://www.google.com/maps" target="_blank" rel="noreferrer" className="mt-4 bg-[#7C3AED] text-white rounded-full px-5 py-2.5 font-semibold">Open map</a>
        </>}
        <p className="text-xs text-violet-200/40 mt-6">Guardians never see past sessions, the Evidence Vault, or CyberShield conversations.</p>
      </div>
    );
  }

  return (
    <div>
      <Link to="/privacy-settings" className="text-xs text-[#7C3AED] font-semibold">← Privacy Center</Link>
      <h1 className="text-xl font-bold text-[#1E1033] mt-2">Location Visibility</h1>
      <p className="text-sm text-[#6B7280] mt-1">Exactly who can see your location, and how.</p>
      <div className="mt-4 space-y-3">
        <Row icon={Eye} title="Who can see it">Only trusted contacts you mark as Guardian for a specific session, and only while a session or SOS is active or a temporary link is unexpired.</Row>
        <Row icon={ShieldOff} title="What guardians do NOT get">No access to past sessions, the Evidence Vault, CyberShield conversations, or your location outside an active session.</Row>
        <Row icon={Clock} title="Temporary by design">Guardians see a unique, expiring, read-only map link — never a permanent dashboard of your history.</Row>
      </div>
      <div className="mt-5 bg-white rounded-2xl border border-[#C4B5FD]/50 p-5">
        <p className="text-xs font-bold text-[#7C3AED] uppercase tracking-widest">How it works</p>
        <div className="flex items-center justify-between gap-2 mt-3 text-sm font-semibold text-[#1E1033]">
          <div className="flex-1 text-center bg-[#F5F3FF] rounded-xl p-3"><Eye size={18} className="mx-auto text-[#7C3AED]" /> You</div>
          <span className="text-[#7C3AED]">→</span>
          <div className="flex-1 text-center bg-[#F5F3FF] rounded-xl p-3"><Clock size={18} className="mx-auto text-[#7C3AED]" /> Time-limited link</div>
          <span className="text-[#7C3AED]">→</span>
          <div className="flex-1 text-center bg-[#F5F3FF] rounded-xl p-3"><Lock size={18} className="mx-auto text-[#7C3AED]" /> Guardian's browser</div>
        </div>
        <p className="text-xs text-[#6B7280] mt-3 text-center">Visibility is temporary and scoped to one session.</p>
      </div>
    </div>
  );
}

function Row({ icon: Icon, title, children }) {
  return <div className="bg-white rounded-2xl border border-[#C4B5FD]/50 p-4"><div className="flex items-center gap-2 text-[#7C3AED]"><Icon size={16} /><p className="font-semibold text-[#1E1033] text-sm">{title}</p></div><p className="text-sm text-[#6B7280] mt-1">{children}</p></div>;
}