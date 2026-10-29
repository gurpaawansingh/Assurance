export async function hashCode(value, salt) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(value), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 150000, hash: 'SHA-256' }, key, 256);
  return Array.from(new Uint8Array(bits), b => b.toString(16).padStart(2, '0')).join('');
}

export function getLocation() {
  return new Promise(resolve => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, url: `https://www.google.com/maps?q=${p.coords.latitude},${p.coords.longitude}` }),
      () => resolve(null), { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  });
}

export function smsLink(phone, message) { return `sms:${phone}?body=${encodeURIComponent(message)}`; }
export function waLink(phone, message) { return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`; }

// On-device CyberShield risk engine (prototype — guides only, not a guarantee)
export function classifyContent(text) {
  const t = (text || '').toLowerCase();
  const indicators = [];
  if (/\b(kill|hurt you|harm|leak|expose|ruin|post your (private )?photos|your family|send me your (password|photos|nudes|money)|or i will|i'll|pay me|do this or)\b/i.test(text)) indicators.push('Threatening or coercive language');
  if (/\b(password|otp|verification code|bank details|pin|confirm your account|account (is )?suspended|reset (your )?password|login immediately)\b/i.test(t)) indicators.push('Requests for private account information (phishing pattern)');
  if (/https?:\/\/[^\s]*(@|xn--|bit\.ly|tinyurl|t\.co|goo\.gl|secure-)/i.test(text)) indicators.push('Suspicious or shortened link');
  if (/\b(urgent|immediately|act now|within 24 hours|last warning|final notice)\b/i.test(t)) indicators.push('Urgency or pressure tactic');
  if (/\b(stalk|slut|bitch|ugly|kill yourself|go die|harass|abuse|threat)\b/i.test(t)) indicators.push('Harassment or abusive language');
  let classification = 'SAFE';
  if (indicators.some(i => /Threatening|coercive/i.test(i))) classification = 'THREAT';
  else if (indicators.some(i => /Harassment|abusive/i.test(i))) classification = 'HARASSMENT';
  else if (indicators.some(i => /phishing/i.test(i))) classification = 'PHISHING';
  else if (indicators.length) classification = 'SUSPICIOUS';
  return { classification, indicators, summary: indicators.length ? indicators.join('; ') : 'No common risk indicators detected in this message.' };
}

const K = { session: 'assurance.session', consent: 'assurance.consent', demo: 'assurance.demo', pin: 'assurance.pinChecked', locLink: 'assurance.locLink' };
export const store = {
  get: (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  del: (k) => localStorage.removeItem(k),
};
export const session = { get: () => store.get(K.session), set: (s) => store.set(K.session, s), clear: () => store.del(K.session) };
export const consent = { get: () => store.get(K.consent), set: () => store.set(K.consent, { at: Date.now() }) };
export const demo = { get: () => store.get(K.demo) || {}, set: (d) => store.set(K.demo, { ...demo.get(), ...d }) };
export const pinGate = { done: () => store.get(K.pin), mark: () => store.set(K.pin, true), reset: () => store.del(K.pin) };
export const locLink = {
  create: (minutes) => { const link = { token: Math.random().toString(36).slice(2), expiresAt: Date.now() + minutes * 60000 }; store.set(K.locLink, link); return link; },
  get: () => store.get(K.locLink),
  clear: () => store.del(K.locLink),
};