const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useRef, useState } from 'react';

import { MapPinned, Siren, Video, Mic, Camera, Phone, ArrowUpRight, MapPin, Info } from 'lucide-react';
import { getLocation } from '@/components/safety/safetyUtils';

const SERVICES = [['Police stations', 'police station near me'], ['Hospitals', 'hospital near me'], ['Ambulance', 'ambulance service near me'], ['Women\u2019s help', 'women help centre near me']];

export default function QuickAccess() {
  const [loc, setLoc] = useState(null);
  const [sirenOn, setSirenOn] = useState(false);
  const [rec, setRec] = useState(null);
  const [recUrl, setRecUrl] = useState(null);
  const sirenRef = useRef(null);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);

  async function locate() { const l = await getLocation(); setLoc(l); }
  function toggleSiren() {
    if (sirenOn) { const r = sirenRef.current; if (r) { clearInterval(r.id); try { r.osc.stop(); r.ctx.close(); } catch {} } sirenRef.current = null; setSirenOn(false); return; }
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine'; gain.gain.value = 0.2; let hi = true;
    const id = setInterval(() => { osc.frequency.value = hi ? 1000 : 700; hi = !hi; }, 350);
    osc.start(); sirenRef.current = { ctx, osc, id }; setSirenOn(true);
  }
  async function startRec(type) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(type === 'video' ? { video: true, audio: true } : { audio: true });
      mediaRef.current = stream; chunksRef.current = [];
      const mr = new MediaRecorder(stream); mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = () => { const blob = new Blob(chunksRef.current, { type: type === 'video' ? 'video/webm' : 'audio/webm' }); setRecUrl(URL.createObjectURL(blob)); setRec({ type }); stream.getTracks().forEach(t => t.stop()); };
      mr.start(); mediaRef.current._mr = mr; setRec({ type, mr });
    } catch (e) { alert('Permission denied or unavailable. Recording works only while the app tab is open in the foreground.'); }
  }
  function stopRec() { mediaRef.current?._mr?.stop(); }
  async function saveRec() {
    try {
      const blob = await fetch(recUrl).then(r => r.blob());
      const file = new File([blob], `capture.${rec.type === 'video' ? 'webm' : 'weba'}`, { type: blob.type });
      const inc = await db.entities.SafetyReport.create({ category: 'Other', description: `Quick Access ${rec.type} recording`, occurred_at: new Date().toISOString() });
      const { file_uri } = await db.integrations.Core.UploadPrivateFile({ file });
      await db.entities.Evidence.create({ incident_id: inc.id, file_url: file_uri, file_type: rec.type, file_name: file.name });
      alert('Saved to Evidence Vault.'); setRecUrl(null); setRec(null);
    } catch (e) { alert('Could not save recording: ' + (e.message || 'upload unavailable in demo mode.')); }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1"><MapPinned size={20} className="text-[#7C3AED]" /><h1 className="text-xl font-bold text-[#1E1033]">Quick Access</h1></div>
      <p className="text-sm text-[#6B7280] mb-4">Nearby help, siren, and recording — within one tap.</p>

      <div className="bg-white rounded-2xl border border-[#C4B5FD]/50 p-4">
        <p className="text-sm font-semibold text-[#1E1033] flex items-center gap-2"><MapPin size={16} className="text-[#7C3AED]" /> Your location</p>
        <button onClick={locate} className="text-sm font-semibold text-[#7C3AED] mt-1">Get my location</button>
        {loc && <a href={loc.url} target="_blank" rel="noreferrer" className="text-sm text-[#7C3AED] underline mt-1 block">View on map</a>}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <button onClick={toggleSiren} className={`rounded-2xl py-5 font-semibold flex flex-col items-center gap-1 ${sirenOn ? 'bg-[#EF4444] text-white' : 'bg-white border border-[#C4B5FD] text-[#1E1033]'}`}><Siren size={22} /> {sirenOn ? 'Stop siren' : 'Play siren'}</button>
        {!rec?.mr ? <>
          <button onClick={() => startRec('video')} className="bg-white border border-[#C4B5FD] text-[#1E1033] rounded-2xl py-5 font-semibold flex flex-col items-center gap-1"><Video size={22} /> Record video</button>
          <button onClick={() => startRec('audio')} className="bg-white border border-[#C4B5FD] text-[#1E1033] rounded-2xl py-5 font-semibold flex flex-col items-center gap-1"><Mic size={22} /> Voice recorder</button>
          <label className="bg-white border border-[#C4B5FD] text-[#1E1033] rounded-2xl py-5 font-semibold flex flex-col items-center gap-1 cursor-pointer"><Camera size={22} /> Record photo<input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => { const f = e.target.files[0]; if (f) { /* store for save */ setRec({ type: 'image', file: f }); setRecUrl(URL.createObjectURL(f)); } }} /></label>
        </> : <button onClick={stopRec} className="col-span-2 bg-[#EF4444] text-white rounded-2xl py-5 font-semibold flex flex-col items-center gap-1"><span className="w-3 h-3 rounded-full bg-white animate-pulse" /> Stop recording</button>}
      </div>
      {recUrl && (
        <div className="mt-3 bg-white rounded-2xl border border-[#C4B5FD]/50 p-4">
          {rec.type === 'video' ? <video src={recUrl} controls className="w-full rounded-xl" /> : rec.type === 'image' ? <img src={recUrl} className="w-full rounded-xl" /> : <audio src={recUrl} controls className="w-full" />}
          <button onClick={saveRec} className="mt-3 w-full bg-[#7C3AED] text-white rounded-xl py-2.5 text-sm font-semibold">Save to Vault</button>
        </div>
      )}
      <p className="text-xs text-[#6B7280] mt-3 flex items-center gap-1"><Info size={12} /> Siren and recording work only while the app tab is open in the foreground. Browsers cannot record after the tab is closed or the phone is locked.</p>

      <h2 className="text-sm font-bold text-[#1E1033] mt-6 mb-2">Nearby services</h2>
      <div className="grid grid-cols-2 gap-2">{SERVICES.map(([label, q]) => <a key={label} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`} target="_blank" rel="noreferrer" className="flex justify-between items-center p-4 rounded-2xl bg-white border border-[#C4B5FD]/50 text-sm font-semibold text-[#1E1033]">{label}<ArrowUpRight size={16} className="text-[#7C3AED]" /></a>)}</div>
      <a href="tel:112" className="mt-3 flex items-center justify-center gap-2 bg-[#1E1033] text-white rounded-2xl py-4 font-bold"><Phone size={20} /> Call 112</a>
      <p className="text-xs text-[#6B7280] mt-2">Map listings are external and not verified by ASSURANCE.</p>
    </div>
  );
}