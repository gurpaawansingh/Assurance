const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from 'react';

import { Users, Plus, Trash2, Star, Phone } from 'lucide-react';

const CHANNELS = ['sms', 'whatsapp', 'email', 'push'];

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState(''); const [rel, setRel] = useState(''); const [phone, setPhone] = useState(''); const [email, setEmail] = useState('');
  const [channels, setChannels] = useState(['sms']); const [priority, setPriority] = useState(false);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  async function load() { const u = await db.auth.me(); const r = await db.entities.TrustedContact.filter({ created_by_id: u.id }, '-is_priority'); setContacts(r); }
  useEffect(() => { load(); }, []);
  function toggleCh(c) { setChannels(s => s.includes(c) ? s.filter(x => x !== c) : [...s, c]); }
  async function add(e) {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      if (priority) { /* demote others */ const others = contacts.filter(c => c.is_priority); await db.entities.TrustedContact.bulkUpdate(others.map(c => ({ id: c.id, is_priority: false }))); }
      await db.entities.TrustedContact.create({ name: name.trim(), relationship: rel.trim(), phone: phone.trim(), email: email.trim(), alert_channels: channels, is_priority: priority, alert_enabled: true });
      setName(''); setRel(''); setPhone(''); setEmail(''); setChannels(['sms']); setPriority(false); await load();
    } catch (e2) { setErr(e2.message || 'Could not save contact.'); } finally { setBusy(false); }
  }
  async function togglePriority(c) { await db.entities.TrustedContact.update(c.id, { is_priority: !c.is_priority }); if (!c.is_priority) { const others = contacts.filter(x => x.is_priority && x.id !== c.id); await db.entities.TrustedContact.bulkUpdate(others.map(x => ({ id: x.id, is_priority: false }))); } load(); }
  async function toggleEnabled(c) { await db.entities.TrustedContact.update(c.id, { alert_enabled: !c.alert_enabled }); load(); }
  async function remove(id) { await db.entities.TrustedContact.delete(id); load(); }
  return (
    <div>
      <div className="flex items-center gap-2 mb-1"><Users size={20} className="text-[#7C3AED]" /><h1 className="text-xl font-bold text-[#1E1033]">Trusted Contacts</h1></div>
      <p className="text-sm text-[#6B7280] mb-2">Add at least 2 contacts to arm Guardian Mode or SOS. {contacts.length < 2 && <span className="text-[#F59E0B] font-medium">You need {2 - contacts.length} more.</span>}</p>
      <p className="text-xs text-[#6B7280] mb-4">Trusted contacts receive alerts only according to the safety rules you configure.</p>
      <div className="space-y-2 mb-5">
        {contacts.map(c => (
          <div key={c.id} className="bg-white rounded-2xl border border-[#C4B5FD]/50 p-4">
            <div className="flex justify-between gap-2">
              <div><p className="font-semibold text-[#1E1033]">{c.name} {c.is_priority && <span className="text-xs text-[#7C3AED] font-bold">· Priority</span>}</p><p className="text-xs text-[#6B7280]">{c.relationship} · {c.phone}</p></div>
              <a href={`tel:${c.phone}`} className="text-[#7C3AED]"><Phone size={18} /></a>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <button onClick={() => togglePriority(c)} className={`text-xs px-2.5 py-1 rounded-full ${c.is_priority ? 'bg-[#7C3AED] text-white' : 'bg-[#F5F3FF] text-[#7C3AED] border border-[#C4B5FD]'}`}><Star size={12} className="inline mr-1" />{c.is_priority ? 'Priority' : 'Make priority'}</button>
              <button onClick={() => toggleEnabled(c)} className={`text-xs px-2.5 py-1 rounded-full ${c.alert_enabled ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#6B7280]/10 text-[#6B7280]'}`}>{c.alert_enabled ? 'Alerts on' : 'Alerts off'}</button>
              <button onClick={() => remove(c.id)} className="text-xs px-2.5 py-1 rounded-full text-[#EF4444] bg-[#EF4444]/10"><Trash2 size={12} className="inline mr-1" />Remove</button>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={add} className="bg-white rounded-2xl border border-[#C4B5FD]/50 p-4 space-y-3">
        <p className="font-semibold text-[#1E1033] flex items-center gap-2"><Plus size={16} /> Add a contact</p>
        <div className="grid grid-cols-2 gap-3">
          <input required value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="field w-full" />
          <input value={rel} onChange={e => setRel(e.target.value)} placeholder="Relationship" className="field w-full" />
        </div>
        <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" className="field w-full" />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (optional)" className="field w-full" />
        <div><span className="text-xs font-medium text-[#2D2A3D]">Alert channels</span><div className="flex flex-wrap gap-2 mt-1">{CHANNELS.map(c => <button type="button" key={c} onClick={() => toggleCh(c)} className={`text-xs px-3 py-1.5 rounded-full ${channels.includes(c) ? 'bg-[#7C3AED] text-white' : 'bg-[#F5F3FF] border border-[#C4B5FD] text-[#6B7280]'}`}>{c}</button>)}</div></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={priority} onChange={e => setPriority(e.target.checked)} className="w-4 h-4 accent-[#7C3AED]" /> Mark as Priority contact</label>
        {err && <p className="text-sm text-[#EF4444]">{err}</p>}
        <button disabled={busy} className="w-full bg-[#7C3AED] text-white rounded-2xl py-3 font-semibold disabled:opacity-50">Save contact</button>
      </form>
    </div>
  );
}