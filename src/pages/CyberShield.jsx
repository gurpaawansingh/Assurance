const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useRef, useState } from 'react';

import { ShieldAlert, Send, Save, RotateCcw, Paperclip, X, Info } from 'lucide-react';
import { classifyContent } from '@/components/safety/safetyUtils';

const CLASS_COLOR = { SAFE: '#22C55E', SUSPICIOUS: '#F59E0B', HARASSMENT: '#EF4444', PHISHING: '#F59E0B', THREAT: '#EF4444' };
const MAX_BYTES = 25 * 1024 * 1024;

export default function CyberShield() {
  const [log, setLog] = useState([]); // {role, text, result?}
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [log]);

  function validateFile(f) {
    const ok = /\.(jpg|jpeg|png|mp4|mp3)$/i.test(f.name);
    if (!ok) { alert('Only .jpg, .png, .mp4, or .mp3 files are supported.'); return false; }
    if (f.size > MAX_BYTES) { alert('File too large (max 25 MB).'); return false; }
    return true;
  }

  async function analyze() {
    const text = input.trim();
    if (!text && !file) return;
    setBusy(true);
    const contentType = file ? (/\.(mp4)$/i.test(file.name) ? 'video' : /\.(mp3)$/i.test(file.name) ? 'audio' : 'image') : 'text';
    const result = file ? { classification: 'SUSPICIOUS', indicators: ['Uploaded media requires manual review (on-device analysis limited to text).'], summary: 'Media attached. ASSURANCE screens text locally; review media with caution.' } : classifyContent(text);
    const entry = { role: 'user', text, fileName: file?.name, contentType };
    setLog(l => [...l, entry, { role: 'bot', result, text }]);
    setLastResult({ ...result, contentType, text, fileName: file?.name });
    try { await db.entities.CyberShieldLog.create({ content_type: contentType, classification: result.classification, summary: result.summary, saved_to_vault: false }); } catch {}
    setInput(''); setFile(null); setBusy(false);
  }

  async function saveToVault() {
    if (!lastResult) return;
    try {
      const inc = await db.entities.SafetyReport.create({ category: lastResult.classification === 'PHISHING' ? 'Phishing' : lastResult.classification === 'THREAT' || lastResult.classification === 'HARASSMENT' ? 'Online Harassment' : 'Other', description: lastResult.text || `Uploaded file: ${lastResult.fileName}`, evidence_notes: lastResult.summary, occurred_at: new Date().toISOString() });
      if (file) { const { file_uri } = await db.integrations.Core.UploadPrivateFile({ file }); await db.entities.Evidence.create({ incident_id: inc.id, file_url: file_uri, file_type: lastResult.contentType, file_name: file.name }); }
      await db.entities.AppNotification.create({ category: 'success', title: 'Saved to Evidence Vault', message: 'This item is retained until you remove it.' });
      alert('Saved to your Evidence Vault. It will not be auto-deleted.');
      setLastResult(null);
    } catch (e) { alert('Could not save: ' + (e.message || 'upload unavailable in demo mode.')); }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] lg:h-[calc(100vh-7rem)]">
      <div className="flex items-center gap-2 mb-3"><ShieldAlert size={20} className="text-[#7C3AED]" /><h1 className="text-xl font-bold text-[#1E1033]">CyberShield</h1></div>
      <p className="text-sm text-[#6B7280] mb-3">AI-powered digital safety screening. Share a message or attach a file for an on-device risk assessment.</p>
      <div className="flex-1 overflow-y-auto space-y-3 bg-white rounded-2xl border border-[#C4B5FD]/50 p-4">
        {log.length === 0 && <p className="text-sm text-[#6B7280]">Paste a suspicious message or attach a file to begin. Example: <span className="italic">"Send me your password or I will post your private photos."</span></p>}
        {log.map((m, i) => m.role === 'user' ? (
          <div key={i} className="flex justify-end"><div className="bg-[#7C3AED] text-white rounded-2xl px-4 py-2 max-w-[85%] text-sm">{m.text}{m.fileName && <p className="text-xs opacity-80 mt-1">📎 {m.fileName}</p>}</div></div>
        ) : (
          <div key={i} className="flex justify-start"><div className="bg-[#F5F3FF] border border-[#C4B5FD]/50 rounded-2xl px-4 py-3 max-w-[85%]">
            <p className="text-xs font-bold" style={{ color: CLASS_COLOR[m.result.classification] }}>Classification: {m.result.classification}</p>
            {m.result.indicators.length > 0 && <ul className="mt-1 text-sm text-[#2D2A3D] list-disc pl-5">{m.result.indicators.map((x, j) => <li key={j}>{x}</li>)}</ul>}
            <p className="text-xs text-[#6B7280] mt-2">{m.result.summary}</p>
          </div></div>
        ))}
        <div ref={bottomRef} />
      </div>
      {lastResult && (
        <div className="mt-2 flex gap-2">
          <button onClick={saveToVault} className="flex-1 bg-[#7C3AED] text-white rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2"><Save size={16} /> Save to Vault</button>
          <button onClick={() => setLastResult(null)} className="flex-1 bg-white border border-[#C4B5FD] text-[#1E1033] rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2"><RotateCcw size={16} /> Analyze another</button>
        </div>
      )}
      <p className="text-xs text-[#6B7280] mt-1 flex items-center gap-1"><Info size={12} /> This is an automated risk assessment, not a certainty. Session content is deleted unless you save it.</p>
      <div className="mt-2 flex gap-2 items-end">
        <label className="p-2.5 bg-white border border-[#C4B5FD] rounded-xl cursor-pointer text-[#7C3AED]">
          <Paperclip size={18} />
          <input type="file" accept=".jpg,.jpeg,.png,.mp4,.mp3" className="hidden" onChange={e => { const f = e.target.files[0]; if (f && validateFile(f)) setFile(f); }} />
        </label>
        {file && <span className="text-xs bg-[#F5F3FF] border border-[#C4B5FD]/50 rounded-lg px-2 py-1 flex items-center gap-1">{file.name} <button onClick={() => setFile(null)}><X size={12} /></button></span>}
        <textarea value={input} onChange={e => setInput(e.target.value)} rows={1} placeholder="Type or paste a message…" className="field flex-1 resize-none" onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); analyze(); } }} />
        <button onClick={analyze} disabled={busy} className="bg-[#7C3AED] text-white rounded-xl px-4 py-3 font-semibold disabled:opacity-50"><Send size={18} /></button>
      </div>
    </div>
  );
}