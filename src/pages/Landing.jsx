const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Shield, ShieldCheck, ShieldAlert, Lock, Lightbulb, MapPinned, ArrowRight, Eye, Heart } from 'lucide-react';
import { Image } from '@/components/ui/image';

const FEATURES = [
  { icon: ShieldCheck, title: 'Guardian Mode', desc: 'Discreet journey monitoring with check-ins and route-deviation alerts.' },
  { icon: ShieldAlert, title: 'Discreet SOS', desc: 'A countdown-confirmed distress signal to your trusted contacts.' },
  { icon: ShieldAlert, title: 'CyberShield', desc: 'On-device screening of suspicious messages, photos, and audio.' },
  { icon: Lock, title: 'Evidence Vault', desc: 'Private, encrypted storage for evidence you choose to keep.' },
  { icon: Lightbulb, title: 'Safety Tips', desc: 'A browsable library of practical digital and travel safety tips.' },
  { icon: MapPinned, title: 'Quick Access', desc: 'Nearby help, siren, and recording tools within one tap.' },
];

export default function Landing() {
  const nav = useNavigate();
  const [authed, setAuthed] = useState(null);
  useEffect(() => { db.auth.isAuthenticated().then(setAuthed); }, []);
  useEffect(() => { if (authed) nav('/dashboard', { replace: true }); }, [authed]);
  if (authed) return null;
  return (
    <div className="min-h-screen bg-[#F5F3FF] text-[#2D2A3D]">
      <header className="border-b border-[#C4B5FD]/40 bg-white/70 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <span className="flex items-center gap-2 font-bold text-[#1E1033]"><span className="w-8 h-8 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center"><Shield size={18} /></span> ASSURANCE</span>
          <nav className="flex items-center gap-4 text-sm font-medium text-[#6B7280]">
            <Link to="/privacy" className="hover:text-[#7C3AED]">Privacy</Link>
            <Link to="/login" className="hover:text-[#7C3AED]">Log in</Link>
            <Link to="/consent" className="bg-[#7C3AED] text-white rounded-full px-4 py-2 hover:bg-[#6d28d9]">Get started</Link>
          </nav>
        </div>
      </header>
      <section className="max-w-5xl mx-auto px-5 pt-12 pb-8 grid lg:grid-cols-2 gap-8 items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-[#7C3AED] uppercase mb-3"><Heart size={14} /> Your Safety. Your Control.</span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight text-[#1E1033]">Smart protection for physical journeys and digital threats.</h1>
          <p className="text-[#6B7280] mt-4 max-w-lg">One privacy-first platform for safer journeys, digital threat detection, emergency assistance, and secure evidence.</p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link to="/consent" className="inline-flex items-center gap-2 bg-[#7C3AED] text-white rounded-full px-5 py-3 font-semibold hover:bg-[#6d28d9]">Start Safe Journey <ArrowRight size={18} /></Link>
            <a href="#features" className="inline-flex items-center gap-2 border border-[#C4B5FD] text-[#1E1033] rounded-full px-5 py-3 font-semibold hover:bg-white">Explore Assurance</a>
          </div>
          <p className="text-xs text-[#6B7280] mt-4">ASSURANCE guides and assists. It does not replace emergency services or guarantee safety.</p>
        </div>
        <div className="rounded-3xl overflow-hidden border border-[#C4B5FD]/60 shadow-lg">
          <Image src="https://media.db.com/images/public/6ab4dd93f6a4300f14c6c864/0ce52931b_WhatsAppImage2026-09-29at110118AM.jpeg" alt="Raised fists in solidarity" className="w-full h-64" fittingType="fill" focalPointY={0.6} />
        </div>
      </section>
      <section id="features" className="max-w-5xl mx-auto px-5 py-12">
        <h2 className="text-2xl font-bold text-[#1E1033] mb-6">Everything you need, calm by design</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-white rounded-2xl border border-[#C4B5FD]/50 p-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center mb-3"><f.icon size={20} /></div>
              <h3 className="font-semibold text-[#1E1033]">{f.title}</h3>
              <p className="text-sm text-[#6B7280] mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-5 py-12 grid lg:grid-cols-2 gap-8">
        <div className="bg-[#1E1033] text-violet-100 rounded-3xl p-8">
          <Eye size={22} className="text-[#A78BFA] mb-3" />
          <h3 className="text-xl font-bold text-white">Safety without constant surveillance</h3>
          <p className="text-violet-200/80 text-sm mt-2">Protection activates only when you choose it. No 24/7 tracking — location sharing starts with an explicit action and stops when a session ends.</p>
        </div>
        <div className="bg-white border border-[#C4B5FD]/60 rounded-3xl p-8">
          <Lock size={22} className="text-[#7C3AED] mb-3" />
          <h3 className="text-xl font-bold text-[#1E1033]">Built around privacy</h3>
          <p className="text-[#6B7280] text-sm mt-2">User-controlled location sharing, consent-based trusted contacts, temporary links that expire, minimal retention, and secure evidence storage.</p>
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-5 pb-16 text-center">
        <h2 className="text-2xl font-bold text-[#1E1033]">Create your safety plan</h2>
        <p className="text-[#6B7280] mt-2">Set up your trusted contacts, configure your PINs, and take control in minutes.</p>
        <Link to="/consent" className="inline-flex mt-5 items-center gap-2 bg-[#7C3AED] text-white rounded-full px-6 py-3 font-semibold hover:bg-[#6d28d9]">Begin <ArrowRight size={18} /></Link>
      </section>
      <footer className="border-t border-[#C4B5FD]/40 py-6 text-center text-xs text-[#6B7280]">ASSURANCE · Hackathon prototype · Privacy-first by design</footer>
    </div>
  );
}