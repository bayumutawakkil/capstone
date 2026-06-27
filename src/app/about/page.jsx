'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Layers, Github, Heart } from 'lucide-react';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      {/* Navbar Minimalis */}
      <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">Tentang Proyek</h1>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-500" />
            <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">NowPlaying</span>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-indigo-600 p-4 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                <Layers className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">NowPlaying</h2>
                <p className="text-indigo-400 font-medium">Media & Literacy Tracker</p>
              </div>
            </div>

            <div className="space-y-6 text-slate-300 leading-relaxed">
              <p>
                <strong>NowPlaying</strong> adalah aplikasi pelacakan media multifungsi yang dirancang sebagai bagian dari proyek akhir (Capstone Project) divisi <strong>FrontEnd Web Programming</strong> UKM Neo Telemetri, Universitas Andalas tahun 2026.
              </p>
              
              <div className="bg-gray-950 p-6 rounded-2xl border border-gray-800 my-8">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500" /> Tema: Hiburan & Lifestyle
                </h3>
                <p className="text-sm">
                  Proyek ini bertujuan untuk memudahkan pengguna dalam melacak, memberi ulasan, dan menemukan berbagai media hiburan (Film, TV, Anime, Game, Buku, Komik) dalam satu platform yang estetik dan intuitif.
                </p>
              </div>

              <h3 className="text-xl font-bold text-white mt-8 mb-4">Teknologi yang Digunakan</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <li className="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/10"><span className="w-2 h-2 rounded-full bg-blue-500"></span> React & Next.js 16 (App Router)</li>
                <li className="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/10"><span className="w-2 h-2 rounded-full bg-teal-400"></span> Tailwind CSS 4</li>
                <li className="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/10"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Supabase (Auth & Database)</li>
                <li className="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/10"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Lucide React Icons</li>
                <li className="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/10"><span className="w-2 h-2 rounded-full bg-amber-500"></span> TMDB, RAWG, Anilist, Google API</li>
              </ul>
            </div>
            
            <div className="mt-12 pt-8 border-t border-gray-800 flex justify-between items-center">
              <p className="text-xs text-slate-500">© 2026 UKM Neo Telemetri. All rights reserved.</p>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                <Github className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
