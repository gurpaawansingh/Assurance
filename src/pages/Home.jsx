const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from 'react';

import { Shield, Heart, PhoneCall } from 'lucide-react';
import SOSPanel from '@/components/safety/SOSPanel';
import ContactPanel from '@/components/safety/ContactPanel';
import CodePanel from '@/components/safety/CodePanel';
import JourneyPanel from '@/components/safety/JourneyPanel';
import ReportPanel from '@/components/safety/ReportPanel';
import DigitalPanel from '@/components/safety/DigitalPanel';
import ResourcesPanel from '@/components/safety/ResourcesPanel';
import BottomNav from '@/components/safety/BottomNav';
import { Image } from '@/components/ui/image';

export default function Home() {
  const [contacts, setContacts] = useState([]); const [profiles, setProfiles] = useState([]);
  const [journeys, setJourneys] = useState([]); const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [tab, setTab] = useState('safety');
  async function reload() {
    try {
      const user = await db.auth.me();
      const [c,p,j,r] = await Promise.all([
        db.entities.TrustedContact.filter({created_by_id: user.id}, 'created_date'),
        db.entities.SafetyProfile.filter({created_by_id: user.id}, '-created_date'),
        db.entities.SafetyJourney.filter({created_by_id: user.id}, '-created_date'),
        db.entities.SafetyReport.filter({created_by_id: user.id}, '-created_date')
      ]);
      setContacts(c); setProfiles(p); setJourneys(j); setReports(r); setError('');
    } catch(err) { setError(err.message || 'Could not load your safety space.'); } finally { setLoading(false); }
  }
  useEffect(() => { reload(); }, []);
  function callPrimary() { if (contacts[0]) window.location.href = `tel:${contacts[0].phone}`; }
  return <div className="min-h-screen bg-[#f6f3fb] text-slate-900 flex flex-col">
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-stone-200">
      <div className="max-w-md mx-auto px-5 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2 font-bold tracking-tight text-lg text-[#3b1a6b]">
          <span className="w-8 h-8 rounded-xl bg-[#3b1a6b] text-white flex items-center justify-center"><Shield size={18}/></span> haven<span className="text-[#d946ef]">.</span>
        </a>
        <span className="text-xs font-semibold uppercase tracking-widest text-violet-800">{tab}</span>
      </div>
    </header>
    <main id="top" className="flex-1 w-full max-w-md mx-auto px-5 pt-5 pb-28">
      {loading ? <div role="status" className="bg-white rounded-3xl p-8 text-sm text-slate-500">Loading your safety space…</div> : <>
        {error && <div role="alert" className="rounded-xl bg-red-50 text-red-800 p-4 mb-5 text-sm">{error} <button onClick={reload} className="underline font-semibold ml-2">Try again</button></div>}
        {tab === 'safety' && <>
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-violet-800 uppercase mb-2"><Heart size={14}/> Your safety space</div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">Help, when you need it.<br/><span className="text-[#a21caf]">Control, every day.</span></h1>
            <p className="text-slate-500 mt-3 text-sm">A private place for trusted contacts, check-ins, and digital safety. Your decisions stay yours.</p>
          </div>
          <div className="rounded-3xl overflow-hidden border border-stone-200 shadow-sm mb-6"><Image src="https://media.db.com/images/public/6ab4dd93f6a4300f14c6c864/0ce52931b_WhatsAppImage2026-09-29at110118AM.jpeg" alt="Raised fists in solidarity — together we stand" className="w-full h-40" fittingType="fill" focalPointY={0.6}/></div>
          <div className="space-y-5">
            <SOSPanel contacts={contacts}/>
            <CodePanel profile={profiles[0]} reload={reload} onEmergency={callPrimary} hasContact={contacts.length>0}/>
            <ContactPanel contacts={contacts} reload={reload}/>
          </div>
        </>}
        {tab === 'journey' && <>
          <div className="mb-4">
            <p className="text-xs font-bold tracking-widest uppercase text-violet-800">Stay connected</p>
            <h2 className="text-2xl font-semibold mt-1">On your way</h2>
          </div>
          <div className="rounded-3xl overflow-hidden border border-stone-200 shadow-sm mb-5"><Image src="https://media.db.com/images/public/6ab4dd93f6a4300f14c6c864/a6695f91e_WhatsAppImage2026-09-29at110118AM1.jpeg" alt="Hands raised together" className="w-full h-32" fittingType="fill" focalPointY={0.6}/></div>
          <JourneyPanel journeys={journeys} contacts={contacts} reload={reload}/>
        </>}
        {tab === 'tools' && <>
          <div className="mb-4">
            <p className="text-xs font-bold tracking-widest uppercase text-violet-800">Everyday protection</p>
            <h2 className="text-2xl font-semibold mt-1">Tools & resources</h2>
          </div>
          <div className="space-y-5">
            <ReportPanel reports={reports} reload={reload}/>
            <DigitalPanel/>
            <ResourcesPanel/>
          </div>
        </>}
      </>}
    </main>
    <BottomNav active={tab} onChange={setTab}/>
  </div>;
}