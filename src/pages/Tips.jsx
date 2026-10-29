import React, { useState } from 'react';
import { Shield, Smartphone, Users, Heart } from 'lucide-react';

const TIPS = [
  { cat: 'Digital', icon: Shield, text: 'Be cautious with strangers online; verify before you trust.' },
  { cat: 'Digital', icon: Shield, text: "Don\u2019t open suspicious links or attachments." },
  { cat: 'Digital', icon: Shield, text: 'Use strong, unique passwords and enable two-factor authentication.' },
  { cat: 'Travel', icon: Smartphone, text: 'Keep your phone charged, especially before travel.' },
  { cat: 'Travel', icon: Smartphone, text: 'Share your live location with a trusted contact during unfamiliar trips.' },
  { cat: 'Travel', icon: Smartphone, text: 'Keep a portable charger and emergency cash when travelling.' },
  { cat: 'Travel', icon: Smartphone, text: 'Learn the local emergency numbers wherever you are.' },
  { cat: 'Social', icon: Users, text: 'Be careful about posting personal details or real-time location on social media.' },
  { cat: 'Social', icon: Users, text: 'Use the buddy system for late-night travel where possible.' },
  { cat: 'Personal', icon: Heart, text: 'Trust your instincts \u2014 if something feels wrong, leave the situation.' },
  { cat: 'Personal', icon: Heart, text: 'Avoid unnecessary confrontation if someone is behaving aggressively.' },
  { cat: 'Personal', icon: Heart, text: 'Prioritize moving through and staying in open, well-lit public places.' },
  { cat: 'Personal', icon: Heart, text: 'Vary your routine and routes occasionally if you feel you\u2019re being watched.' },
];
const CATS = ['All', 'Digital', 'Travel', 'Social', 'Personal'];

export default function Tips() {
  const [cat, setCat] = useState('All');
  const list = TIPS.filter(t => cat === 'All' || t.cat === cat);
  return (
    <div>
      <h1 className="text-xl font-bold text-[#1E1033]">Safety Tips</h1>
      <p className="text-sm text-[#6B7280] mt-1 mb-4">Practical, categorized safety guidance.</p>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3">{CATS.map(c => <button key={c} onClick={() => setCat(c)} className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${cat === c ? 'bg-[#7C3AED] text-white' : 'bg-white border border-[#C4B5FD] text-[#6B7280]'}`}>{c}</button>)}</div>
      <div className="space-y-2">
        {list.map((t, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#C4B5FD]/50 p-4 flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center shrink-0"><t.icon size={18} /></div>
            <div><p className="text-xs font-bold text-[#7C3AED] uppercase tracking-widest">{t.cat} Safety</p><p className="text-sm text-[#2D2A3D] mt-1">{t.text}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}