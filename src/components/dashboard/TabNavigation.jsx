'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Activity, Archive, Search, Sparkles } from 'lucide-react';

export default function TabNavigation({ onOpenWrapped }) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex p-1 bg-gray-900/60 backdrop-blur-md rounded-2xl border border-gray-800 mb-8 inline-flex mx-auto md:mx-0 overflow-x-auto w-full md:w-auto hide-scrollbar shadow-lg">
        <Link
          href="/dashboard"
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap ${
            pathname === '/dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Compass className="w-4 h-4" />
          Active Tracker
        </Link>
        <Link
          href="/dashboard/analytics"
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap ${
            pathname === '/dashboard/analytics' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Activity className="w-4 h-4" />
          Lifestyle Analytics
        </Link>
        <Link
          href="/dashboard/history"
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap ${
            pathname === '/dashboard/history' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Archive className="w-4 h-4" />
          History Journal
        </Link>
        <Link
          href="/dashboard/discovery"
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap ${
            pathname === '/dashboard/discovery' ? 'bg-fuchsia-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Search className="w-4 h-4" />
          Discovery
        </Link>
      </div>

      <div className="md:hidden mb-6 flex justify-center">
         <button
            onClick={onOpenWrapped}
            className="flex items-center justify-center gap-2 px-6 py-3 w-full rounded-full font-bold text-white bg-gradient-to-r from-purple-600 to-blue-500 shadow-[0_0_15px_rgba(147,51,234,0.4)]"
          >
            <Sparkles className="w-5 h-5" />
            <span>NowPlaying Wrapped 2026</span>
          </button>
      </div>
    </>
  );
}
