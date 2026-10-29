import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import SidebarNav from './SidebarNav';
import BottomNav from './safety/BottomNav';
import { Shield } from 'lucide-react';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-[#F5F3FF] text-[#2D2A3D]">
      <SidebarNav />
      <div className="lg:pl-64">
        <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-[#C4B5FD]/40">
          <div className="px-4 h-14 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2 font-bold text-[#1E1033]">
              <span className="w-7 h-7 rounded-lg bg-[#7C3AED] text-white flex items-center justify-center"><Shield size={16} /></span> ASSURANCE
            </Link>
            <Link to="/sos" className="text-xs font-bold text-[#EF4444] border border-[#EF4444]/30 rounded-full px-3 py-1">SOS</Link>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-4 pb-28 lg:pb-12">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}