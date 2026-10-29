import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Globe, Shield, ArrowLeft } from 'lucide-react';

const LINES = [
  { name: 'Emergency Services (India)', number: '112', desc: 'Police, fire, ambulance — nationwide.' },
  { name: "Women's Helpline", number: '1091', desc: 'National women\u2019s helpline, 24/7.' },
  { name: 'Cyber Crime Helpline', number: '1930', desc: 'Report cybercrime (cybercrime.gov.in).' },
  { name: 'Police', number: '100', desc: 'Local police assistance.' },
];

export default function Help() {
  return (
    <div>
      <Link to="/dashboard" className="text-xs text-[#7C3AED] font-semibold flex items-center gap-1"><ArrowLeft size={14} /> Dashboard</Link>
      <div className="flex items-center gap-2 mt-2 mb-1"><Shield size={20} className="text-[#7C3AED]" /><h1 className="text-xl font-bold text-[#1E1033]">Real Human Helpline</h1></div>
      <p className="text-sm text-[#6B7280] mb-4">These connect to real, verified external services — not ASSURANCE staff. Calling opens your phone dialer.</p>
      <div className="space-y-3">
        {LINES.map(l => (
          <div key={l.number} className="bg-white rounded-2xl border border-[#C4B5FD]/50 p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center"><Phone size={20} /></div>
            <div className="flex-1"><p className="font-semibold text-[#1E1033]">{l.name}</p><p className="text-xs text-[#6B7280]">{l.desc}</p><p className="text-sm font-bold text-[#7C3AED] mt-0.5">{l.number}</p></div>
            <a href={`tel:${l.number}`} className="bg-[#7C3AED] text-white rounded-full px-4 py-2 text-sm font-semibold">Call now</a>
          </div>
        ))}
      </div>
      <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-2 bg-white border border-[#C4B5FD] text-[#1E1033] rounded-2xl py-3 font-semibold text-sm"><Globe size={16} /> cybercrime.gov.in</a>
    </div>
  );
}