import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, ShieldCheck, ShieldAlert, Lock, User } from 'lucide-react';

const TABS = [
  { to: '/dashboard', label: 'Home', icon: Shield },
  { to: '/guardian', label: 'Guardian', icon: ShieldCheck },
  { to: '/cybershield', label: 'CyberShield', icon: ShieldAlert },
  { to: '/evidence', label: 'Vault', icon: Lock },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  return (
    <nav aria-label="App sections" className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-[#C4B5FD]/40 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {TABS.map(t => (
          <NavLink key={t.to} to={t.to} className={({ isActive }) => `relative flex flex-col items-center gap-1 py-2.5 ${isActive ? 'text-[#7C3AED]' : 'text-[#6B7280]'}`}>
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute top-0 h-1 w-8 rounded-b-full bg-[#7C3AED]" />}
                <t.icon size={22} />
                <span className="text-[11px] font-medium">{t.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}