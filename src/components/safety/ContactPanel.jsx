const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';

import { Phone, Trash2, Plus } from 'lucide-react';

export default function ContactPanel({ contacts, reload }) {
  const [name, setName] = useState(''); const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function add(e) {
    e.preventDefault(); setBusy(true); setError('');
    try { await db.entities.TrustedContact.create({ name: name.trim(), phone: phone.trim() }); setName(''); setPhone(''); await reload(); }
    catch (err) { setError(err.message || 'Could not save contact.'); } finally { setBusy(false); }
  }
  async function remove(id) {
    setBusy(true); setError('');
    try { await db.entities.TrustedContact.delete(id); await reload(); }
    catch (err) { setError(err.message || 'Could not remove contact.'); } finally { setBusy(false); }
  }
  return <section id="contacts" className="rounded-3xl bg-white border border-stone-200 p-5 sm:p-7 shadow-sm">
    <div className="flex items-center gap-3 mb-2"><div className="p-2.5 bg-violet-50 rounded-xl text-violet-800"><Phone size={20}/></div><h2 className="text-xl font-semibold text-slate-900">Trusted contacts</h2></div>
    <p className="text-sm text-slate-500 mb-5">Your first contact is used for the emergency call. Your phone will ask you to place the call or send any message.</p>
    <div className="space-y-2 mb-5">{contacts.length ? contacts.map((c, i) => <div key={c.id} className="flex items-center justify-between gap-2 bg-stone-50 rounded-2xl p-3"><div className="min-w-0"><p className="font-medium text-slate-900 truncate">{c.name} {i === 0 && <span className="text-xs text-violet-700">· Primary</span>}</p><p className="text-xs text-slate-500">{c.phone}</p></div><div className="flex items-center gap-1"><a className="p-2 text-violet-800" aria-label={`Call ${c.name}`} href={`tel:${c.phone}`}><Phone size={17}/></a><button disabled={busy} aria-label={`Remove ${c.name}`} onClick={() => remove(c.id)} className="p-2 text-slate-400 hover:text-red-700"><Trash2 size={17}/></button></div></div>) : <p className="text-sm text-slate-500 bg-stone-50 rounded-xl p-4">No contacts yet. Add someone you trust below.</p>}</div>
    <form onSubmit={add} className="flex flex-col sm:flex-row gap-2"><input required maxLength={80} value={name} onChange={e=>setName(e.target.value)} placeholder="Contact name" aria-label="Contact name" className="field flex-1"/><input required type="tel" pattern="[+0-9() .-]{7,20}" title="Enter a valid phone number" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone number" aria-label="Phone number" className="field flex-1"/><button disabled={busy} className="action-button bg-violet-800 hover:bg-violet-900 text-white"><Plus size={17}/> Add</button></form>
    {error && <p role="alert" className="text-sm text-red-700 mt-3">{error}</p>}
  </section>;
}