const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { ShieldCheck, ArrowRight, Info } from 'lucide-react';
import { session } from '@/components/safety/safetyUtils';

export default function Guardian() {
  const nav = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [dest, setDest] = useState('');
  const [arrival, setArrival] = useState('');
  const [duration, setDuration] = useState(60);
  const [interval, setIntervalMin] = useState(15);
  const [note, setNote] = useState('');
  const [chosen, setChosen] = useState({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (session.get()) { nav('/guardian/active', { replace: true }); return; }
    db.auth.me().then(u => db.entities.TrustedContact.filter({ created_by_id: u.id, alert_enabled: true }, '-is_priority').then(setContacts));
  }, []);

  async function start(e) {
    e.preventDefault();
    if (contacts.length < 2) { setErr('Add at least 2 trusted contacts before arming Guardian Mode.'); return; }
    if (!Object.values(chosen).some(Boolean)) { setErr('Select at least one trusted contact to notify.'); return; }
    setBusy(true); setErr('');
    try {
      const due = new Date(arrival).toISOString();
      const j = await db.entities.SafetyJourney.create({ destination: dest.trim(), due_at: due, started_at: new Date().toISOString(), check_in_interval: interval, safety_note: note.trim(), status: 'active' });
      session.set({ journeyId: j.id, destination: dest.trim(), dueAt: due, interval, note: note.trim(), startedAt: Date.now(), nextCheckIn: Date.now() + interval * 60000, status: 'SAFE', contacts: contacts.filter(c => chosen[c.id]).map(c => ({ name: c.name, phone: c.phone, channels: c.alert_channels || ['sms'], is_priority: c.is_priority })) });
      await db.entities.AppNotification.create({ category: 'success', title: 'Guardian session started', message: `Monitoring your journey to ${dest.trim()}.` });
      nav('/guardian/active');
    } catch (e2) { setErr(e2.message || 'Could not start session.'); } finally { setBusy(false); }
  }

  return (
    <div>
      <Link to="/dashboard" className="text-xs text-[#7C3AED] font-semibold">← Dashboard</Link>
      <div className="flex items-center gap-2 mt-2 mb-4"><ShieldCheck size={20} className="text-[#7C3AED]" /><h1 className="text-xl font-bold text-[#1E1033]">Start Guardian Session</h1></div>
      <p className="text-sm text-[#6B7280] mb-4">Protection activates only for this journey. Location is shared only while the session is active. No background tracking.</p>
      <form onSubmit={start} className="space-y-3">
        <Field label="Destination"><input required value={dest} onChange={e => setDest(e.target.value)} placeholder="e.g. Home" className="field w-full" /></Field>
        <Field label="Expected arrival"><input required type="datetime-local" value={arrival} onChange={e => setArrival(e.target.value)} className="field w-full" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Trip duration (min)"><input type="number" min={5} value={duration} onChange={e => setDuration(+e.target.value)} className="field w-full" /></Field>
          <Field label="Check-in interval (min)"><input type="number" min={1} value={interval} onChange={e => setIntervalMin(+e.target.value)} className="field w-full" /></Field>
        </div>
        <Field label="Optional safety note"><textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Anything your contacts should know" className="field w-full" /></Field>
        <div>
          <p className="text-xs font-medium text-[#2D2A3D] mb-2">Trusted contacts to notify</p>
          {contacts.length === 0 ? <p className="text-sm text-[#6B7280]">No contacts yet. <Link to="/contacts" className="text-[#7C3AED] font-medium">Add at least 2.</Link></p> : (
            <div className="space-y-2">{contacts.map(c => (
              <label key={c.id} className="flex items-center gap-3 bg-white border border-[#C4B5FD]/50 rounded-xl p-3">
                <input type="checkbox" checked={!!chosen[c.id]} onChange={e => setChosen(s => ({ ...s, [c.id]: e.target.checked }))} className="w-4 h-4 accent-[#7C3AED]" />
                <div className="flex-1"><p className="text-sm font-medium text-[#1E1033]">{c.name} {c.is_priority && <span className="text-xs text-[#7C3AED]">· Priority</span>}</p><p className="text-xs text-[#6B7280]">{c.relationship || ''} · {c.phone}</p></div>
              </label>
            ))}</div>
          )}
        </div>
        {err && <p className="text-sm text-[#EF4444]">{err}</p>}
        <button disabled={busy} className="w-full inline-flex items-center justify-center gap-2 bg-[#7C3AED] text-white rounded-full px-5 py-3 font-semibold disabled:opacity-50 enabled:hover:bg-[#6d28d9]">Start Guardian Session <ArrowRight size={18} /></button>
      </form>
      <p className="text-xs text-[#6B7280] mt-3 flex items-start gap-1"><Info size={14} className="mt-0.5 shrink-0" /> Trusted contacts receive alerts only according to the rules you configure.</p>
    </div>
  );
}

function Field({ label, children }) { return <label className="block"><span className="text-xs font-medium text-[#2D2A3D]">{label}</span><div className="mt-1">{children}</div></label>; }