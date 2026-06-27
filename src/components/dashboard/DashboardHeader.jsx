'use client';

import { useRouter } from 'next/navigation';
import { Layers, Sparkles, LogOut, Info } from 'lucide-react';

export default function DashboardHeader({ user, onLogout, onOpenWrapped }) {
  const router = useRouter();

  return (
    <header className="relative z-10 border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push('/')}>
            <div className="bg-indigo-600 p-2.5 rounded-xl group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-300">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                NowPlaying
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-bold">Media & Literacy Tracker</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenWrapped}
              className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 shadow-[0_0_15px_rgba(147,51,234,0.4)] hover:shadow-[0_0_25px_rgba(147,51,234,0.6)] transition-all duration-300 transform hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>Lihat NowPlaying Wrapped Anda!</span>
            </button>

            <button 
              onClick={() => router.push('/profile')}
              className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors text-left"
              title="Profil Pengguna"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div className="text-sm">
                <p className="font-semibold text-slate-200 leading-tight">
                  {user?.user_metadata?.full_name || 'User'}
                </p>
                <p className="text-xs text-slate-500">Premium Member</p>
              </div>
            </button>

            <button 
              onClick={() => router.push('/about')}
              className="p-2.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-xl transition-all"
              title="Tentang Proyek"
            >
              <Info className="w-5 h-5" />
            </button>
            <button 
              onClick={onLogout}
              className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all"
              title="Keluar"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
