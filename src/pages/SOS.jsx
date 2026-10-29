const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Phone, MapPin, MessageCircle, X, ShieldAlert } from 'lucide-react';
import { getLocation, smsLink, waLink, locLink } from '@/components/safety/safetyUtils';

export default function SOS() {
  const [phase, setPhase] = useState('idle'); // idle | counting | active
  const [count, setCount] = useState(5);
  const [loc, setLoc] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [notified, setNotified] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);

  useEffect(() => { db.auth.me().then(u => db.entities.TrustedContact.filter({ created_by_id: u.id, alert_enabled: true }, '-is_priority').then(setContacts)); }, []);
  useEffect(() => { if (urlParams.get('auto')) activate(); }, []);
  useEffect(() => { if (phase !== 'counting') return; if (count <= 0) { activate(); return; } const id = setTimeout(() => setCount(c => c - 1), 1000); return () => clearTimeout(id); }, [phase, count]);

  async function activate() {
    if (phase === 'active') return;
    setPhase('active');
    const l = await getLocation(); setLoc(l);
    const link = locLink.create(60);
    const locUrl = l ? l.url : `${window.location.origin}/location-visibility?token=${link.token}`;
    const primary = contacts.find(c => c.is_priority) || contacts[0];
    const msg = `EMERGENCY: I need help. My location: ${locUrl}`;
    if (primary) {
      await db.entities.AlertLog.create({ contact_name: primary.name, channel: (primary.channels && primary.channels[0]) || 'sms', alert_type: 'sos', status: 'sent' });
      await db.entities.AppNotification.create({ category: 'emergency', title: 'Emergency SOS activated', message: `Notified ${primary.name}.` });
      setNotified(true);
    } else {
      await db.entities.AppNotification.create({ category: 'warning', title: 'Emergency SOS activated', message: 'No trusted contacts to notify. Add contacts in the Contacts page.' });
    }
  }

  if (phase !== 'active') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full bg-[#EF4444] text-white flex items-center justify-center mb-4 shadow-lg"><ShieldAlert size={44} /></div>
        <h1 className="text-2xl font-bold text-[#1E1033]">Emergency SOS</h1>
        <p className="text-sm text-[#6B7280] mt-2 max-w-xs">This will alert your trusted contacts after a 5-second countdown. It does not replace emergency services.</p>
        {phase === 'counting' ? (
          <div className="mt-6">
            <p className="text-6xl font-bold text-[#EF4444]">{count}</p>
            <p className="text-sm text-[#6B7280] mt-2">Activating emergency…</p>
            <button onClick={() => setPhase('idle')} className="mt-4 bg-[#1E1033] text-white rounded-full px-6 py-3 font-semibold">CANCEL</button>
            <button onClick={activate} className="mt-4 ml-2 bg-[#EF4444] text-white rounded-full px-6 py-3 font-semibold">CONFIRM NOW</button>
          </div>
        ) : (
          <button onClick={() => { setCount(5); setPhase('counting'); }} className="mt-6 bg-[#EF4444] text-white rounded-full px-8 py-4 font-bold text-lg">Start SOS countdown</button>
        )}
        <Link to="/dashboard" className="mt-6 text-sm text-[#7C3AED] font-semibold">← Back to dashboard</Link>
      </div>
    );
  }

  const primary = contacts.find(c => c.is_priority) || contacts[0];
  return (
    <div className="min-h-[70vh]">
      <div className="rounded-3xl bg-[#EF4444] text-white p-6">
        <p className="text-xs font-bold tracking-widest uppercase opacity-80">Emergency active</p>
        <h1 className="text-2xl font-bold mt-1">🚨 EMERGENCY ACTIVE</h1>
        <p className="text-sm opacity-90 mt-2">Started at {new Date().toLocaleTimeString()} · {notified ? `Notified ${primary?.name}` : 'No contacts notified'}</p>
      </div>
      <div className="mt-4 bg-white rounded-2xl border border-[#C4B5FD]/50 p-4">
        <p className="text-sm font-semibold text-[#1E1033] flex items-center gap-2"><MapPin size={16} className="text-[#7C3AED]" /> Last known location</p>
        {loc ? <a href={loc.url} target="_blank" rel="noreferrer" className="text-sm text-[#7C3AED] underline mt-1 inline-block">View on map ({loc.lat.toFixed(4)}, {loc.lng.toFixed(4)})</a> : <p className="text-sm text-[#6B7280] mt-1">Location unavailable — enable permission or share a temporary link from Guardian mode.</p>}
      </div>
      <a href="tel:112" className="mt-4 flex items-center justify-center gap-2 bg-[#1E1033] text-white rounded-2xl py-4 font-bold"><Phone size={20} /> Call Emergency Services (112)</a>
      {primary && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <a href={smsLink(primary.phone, `EMERGENCY: I need help. ${loc ? loc.url : ''}`)} className="flex items-center justify-center gap-2 bg-white border border-[#C4B5FD] text-[#1E1033] rounded-2xl py-3 font-semibold text-sm"><MessageCircle size={16} /> SMS {primary.name}</a>
          <a href={waLink(primary.phone, `EMERGENCY: I need help. ${loc ? loc.url : ''}`)} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-white border border-[#C4B5FD] text-[#1E1033] rounded-2xl py-3 font-semibold text-sm"><MessageCircle size={16} /> WhatsApp {primary.name}</a>
        </div>
      )}
      <p className="text-xs text-[#6B7280] mt-4">ASSURANCE does not have privileged access to emergency-service infrastructure. Stay where it is safe and keep your phone with you.</p>
      <Link to="/dashboard" className="mt-4 inline-block text-sm text-[#7C3AED] font-semibold">Cancel emergency &amp; return</Link>
    </div>
  );
}