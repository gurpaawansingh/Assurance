import React, { useEffect, useState } from 'react';
import { hashCode, pinGate } from './safetyUtils';
import { Lock, FlaskConical } from 'lucide-react';

export default function PinCheck({ profile, onClose, onDistress }) {
  const [pin, setPin] = useState('');
  const [count, setCount] = useState(60);
  const [shake, setShake] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setCount(c => { if (c <= 1) { clearInterval(id); handleDistress(); return 0; } return c - 1; }), 1000);
    return () => clearInterval(id);
  }, []);
  function handleDistress() { pinGate.mark(); onDistress(); }
  async function submit(e) {
    e.preventDefault();
    const hash = await hashCode(pin, profile.salt);
    if (hash === profile.safe_hash) { pinGate.mark(); onClose(); }
    else if (hash === profile.sos_hash) { handleDistress(); }
    else { setShake(true); setPin(''); setTimeout(() => setShake(false), 500); }
  }
  function skip() { pinGate.mark(); onClose(); }
  return (
    <div className="fixed inset-0 z-50 bg-[#1E1033] flex flex-col items-center justify-center text-white p-6">
      <Lock size={32} className="text-[#A78BFA]" />
      <h2 className="text-xl font-bold mt-3">Quick safety check</h2>
      <p className="text-sm text-violet-200/70 mt-1">Enter your PIN to confirm you're safe.</p>
      <p className="text-xs text-violet-200/50 mt-1">Auto-alert in {count}s. A distress PIN looks identical here but silently triggers help.</p>
      <form onSubmit={submit} className="mt-5 w-full max-w-xs">
        <input type="password" inputMode="numeric" maxLength={8} value={pin} onChange={e => setPin(e.target.value)} autoFocus placeholder="PIN" className={`w-full text-center text-2xl tracking-widest bg-white/10 rounded-xl py-3 text-white outline-none ${shake ? 'ring-2 ring-[#EF4444]' : 'focus:ring-2 focus:ring-[#7C3AED]'}`} />
        <button className="mt-3 w-full bg-[#7C3AED] rounded-xl py-3 font-semibold">Confirm</button>
      </form>
      <button onClick={handleDistress} className="mt-4 text-xs text-violet-200/60 flex items-center gap-1"><FlaskConical size={12} /> Snatch Protection demo (simulate motion)</button>
      <button onClick={skip} className="mt-2 text-xs text-violet-200/40">Skip for now</button>
    </div>
  );
}