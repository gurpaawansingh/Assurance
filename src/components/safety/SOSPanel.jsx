import React, { useState } from 'react';
import { PhoneCall, MapPin, MessageCircle, AlertTriangle } from 'lucide-react';
import { getLocation, smsLink } from './safetyUtils';

export default function SOSPanel({ contacts }) {
  const [busy, setBusy] = useState(false); const [location, setLocation] = useState('');
  const primary = contacts[0];
  async function locate() { setBusy(true); const result = await getLocation(); setLocation(result || 'Location unavailable. Enable location permission to include a map link.'); setBusy(false); }
  return <section className="rounded-3xl bg-[#2e1065] text-white p-6 sm:p-8 shadow-lg shadow-violet-900/20 relative overflow-hidden">
    <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full border border-white/10 pointer-events-none"/><div className="relative">
      <div className="flex gap-2 items-center text-violet-200 text-xs font-bold tracking-[.16em] uppercase mb-3"><AlertTriangle size={15}/> Immediate help</div>
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">You are not alone.</h2><p className="text-violet-100/80 text-sm mb-6 max-w-md">Open a call to your trusted contact or prepare a location message. Your device will require your confirmation to call or send.</p>
      <div className="flex flex-col sm:flex-row gap-3"><a href={primary ? `tel:${primary.phone}` : '#contacts'} className="action-button bg-[#ec4899] hover:bg-[#db2777] text-white justify-center py-4"><PhoneCall size={19}/> {primary ? `Call ${primary.name}` : 'Add a contact first'}</a><button onClick={locate} disabled={busy} className="action-button border border-white/30 text-white hover:bg-white/10 justify-center py-4"><MapPin size={19}/> {busy ? 'Getting location…' : 'Get my location'}</button></div>
      {location && <div className="mt-4 rounded-2xl bg-white/10 p-4 text-sm"><p className="break-all">{location.startsWith('https:') ? <a href={location} target="_blank" rel="noreferrer" className="underline">View your location on a map</a> : location}</p>{location.startsWith('https:') && primary && <a className="inline-flex items-center gap-2 mt-3 font-semibold text-[#f9a8d4] underline" href={smsLink(primary.phone, `I need help. My location: ${location}`)}><MessageCircle size={16}/> Open message to {primary.name}</a>}</div>}
      <p className="mt-5 text-xs text-violet-200/70">No automatic calls or alerts are sent by this web app. If in immediate danger, use your local emergency number.</p>
    </div>
  </section>;
}