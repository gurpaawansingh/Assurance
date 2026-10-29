const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from 'react';

import { Bell, Trash2, Info, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

const STYLE = {
  info: { icon: Info, color: '#7C3AED', bg: '#7C3AED' },
  warning: { icon: AlertTriangle, color: '#F59E0B', bg: '#F59E0B' },
  emergency: { icon: ShieldAlert, color: '#EF4444', bg: '#EF4444' },
  success: { icon: CheckCircle2, color: '#22C55E', bg: '#22C55E' },
};

export default function Notifications() {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true);
  async function load() { const u = await db.auth.me(); const r = await db.entities.AppNotification.filter({ created_by_id: u.id }, '-created_date'); setItems(r); setLoading(false); }
  useEffect(() => { load(); }, []);
  async function remove(id) { await db.entities.AppNotification.delete(id); load(); }
  async function clearAll() { if (!confirm('Clear all notifications?')) return; const u = await db.auth.me(); await db.entities.AppNotification.deleteMany({ created_by_id: u.id }); load(); }
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2"><Bell size={20} className="text-[#7C3AED]" /><h1 className="text-xl font-bold text-[#1E1033]">Notifications</h1></div>
        {items.length > 0 && <button onClick={clearAll} className="text-xs text-[#EF4444] font-semibold">Clear all</button>}
      </div>
      <p className="text-sm text-[#6B7280] mb-4">Recent safety events and alerts.</p>
      <div className="space-y-2">
        {loading ? <p className="text-sm text-[#6B7280]">Loading…</p> : items.length === 0 ? <p className="text-sm text-[#6B7280] bg-white rounded-2xl border border-[#C4B5FD]/50 p-4">No notifications yet.</p> :
          items.map(n => { const s = STYLE[n.category] || STYLE.info; const Icon = s.icon; return (
            <div key={n.id} className="bg-white rounded-2xl border border-[#C4B5FD]/50 p-4 flex gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg + '15', color: s.color }}><Icon size={18} /></div>
              <div className="flex-1"><p className="font-semibold text-[#1E1033] text-sm">{n.title}</p><p className="text-xs text-[#6B7280] mt-0.5">{n.message}</p><p className="text-xs text-[#6B7280] mt-1">{new Date(n.created_date).toLocaleString()}</p></div>
              <button onClick={() => remove(n.id)} className="text-[#6B7280] hover:text-[#EF4444]"><Trash2 size={16} /></button>
            </div>
          ); })}
      </div>
    </div>
  );
}