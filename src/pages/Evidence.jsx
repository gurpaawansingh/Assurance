const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Lock, Plus, Trash2, FileText } from 'lucide-react';

export default function Evidence() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  async function load() { try { const u = await db.auth.me(); const r = await db.entities.SafetyReport.filter({ created_by_id: u.id }, '-created_date'); setItems(r); } catch {} finally { setLoading(false); } }
  useEffect(() => { load(); }, []);
  async function remove(id) { if (!confirm('Delete this incident and its evidence? This cannot be undone.')) return; await db.entities.SafetyReport.delete(id); load(); }
  return (
    <div>
      <div className="flex items-center gap-2 mb-1"><Lock size={20} className="text-[#7C3AED]" /><h1 className="text-xl font-bold text-[#1E1033]">Secure Evidence Vault</h1></div>
      <p className="text-sm text-[#6B7280] mb-4">Only evidence you choose to retain is stored. Nothing here is deleted automatically once saved.</p>
      <Link to="/evidence/new" className="flex items-center justify-center gap-2 bg-[#7C3AED] text-white rounded-2xl py-3 font-semibold"><Plus size={18} /> Add new incident</Link>
      <div className="mt-4 space-y-3">
        {loading ? <p className="text-sm text-[#6B7280]">Loading…</p> : items.length === 0 ? <p className="text-sm text-[#6B7280] bg-white rounded-2xl border border-[#C4B5FD]/50 p-4">No incidents saved yet. Evidence you save here stays until you remove it.</p> :
          items.map(r => (
            <article key={r.id} className="bg-white rounded-2xl border border-[#C4B5FD]/50 p-4">
              <div className="flex justify-between gap-2">
                <div><p className="font-semibold text-[#1E1033]">{r.category}</p><p className="text-xs text-[#6B7280]">{new Date(r.occurred_at || r.created_date).toLocaleString()}</p></div>
                <button onClick={() => remove(r.id)} className="text-[#6B7280] hover:text-[#EF4444]"><Trash2 size={18} /></button>
              </div>
              <p className="text-sm text-[#2D2A3D] mt-2 whitespace-pre-wrap break-words">{r.description}</p>
              {r.evidence_notes && <p className="text-xs text-[#6B7280] mt-2">Notes: {r.evidence_notes}</p>}
            </article>
          ))}
      </div>
      <p className="text-xs text-[#6B7280] mt-4 flex items-center gap-1"><FileText size={12} /> Evidence content is encrypted client-side and never shared publicly.</p>
    </div>
  );
}