import React, { useState } from 'react';
import { ShieldAlert, ExternalLink } from 'lucide-react';

export default function DigitalPanel() {
  const [text, setText] = useState(''); const [result, setResult] = useState(null);
  function scan(e) { e.preventDefault(); const flags = []; const t = text.toLowerCase();
    if (/https?:\/\/[^\s]*(@|xn--|bit\.ly|tinyurl|t\.co)/i.test(text)) flags.push('The link uses a redirect, unusual domain, or misleading address.');
    if (/\b(password|otp|verification code|bank details|pin)\b/i.test(t)) flags.push('Someone may be asking for private account information.');
    if (/\b(urgent|immediately|act now|account suspended|click here)\b/i.test(t)) flags.push('Pressure or urgency can be a phishing tactic.');
    if (/\b(threat|hurt you|kill you|send photos|share your photos)\b/i.test(t)) flags.push('The wording may indicate a threat or coercion.');
    setResult(flags);
  }
  return <section className="rounded-3xl bg-white border border-stone-200 p-5 sm:p-7 shadow-sm"><div className="flex items-center gap-3 mb-2"><div className="p-2.5 bg-violet-50 rounded-xl text-violet-800"><ShieldAlert size={20}/></div><h2 className="text-xl font-semibold">Digital safety check</h2></div><p className="text-sm text-slate-500 mb-5">A simple on-device pattern check, not AI or a guarantee of safety. Text is not saved or sent to a server.</p><form onSubmit={scan}><textarea required maxLength={3000} value={text} onChange={e=>{setText(e.target.value);setResult(null);}} placeholder="Paste a suspicious message or link…" aria-label="Suspicious message or link" rows={4} className="field w-full"/><button className="action-button bg-violet-800 text-white mt-3">Check text</button></form>{result && <div role="status" className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-950"><p className="font-semibold">{result.length ? 'Possible warning signs' : 'No common warning signs found'}</p>{result.length ? <ul className="list-disc pl-5 mt-2 space-y-1">{result.map(s=><li key={s}>{s}</li>)}</ul> : <p className="mt-1">Still verify the sender independently; a clean check does not mean the message is safe.</p>}<p className="mt-3">Avoid opening unknown links, sharing codes, or replying to threats. Save evidence and contact someone you trust if needed.</p></div>}</section>;
}