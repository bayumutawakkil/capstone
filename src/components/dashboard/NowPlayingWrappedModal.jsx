import React, { useEffect, useState } from 'react';
import { X, Sparkles, Trophy, BookOpen, Star, Crown, PlayCircle, LibraryBig } from 'lucide-react';

/**
 * Komponen Modal NowPlaying Wrapped.
 * Menampilkan rangkuman statistik konsumsi media secara estetik (Glassmorphism).
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Status visibilitas modal
 * @param {Function} props.onClose - Handler untuk menutup modal
 * @param {Object} props.wrapData - Data agregat untuk ditampilkan
 * @returns {JSX.Element|null} UI Komponen NowPlayingWrappedModal
 */
export default function NowPlayingWrappedModal({ isOpen, onClose, wrapData }) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-500" 
        onClick={onClose}
      ></div>
      
      <div 
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gray-950/60 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(79,70,229,0.2)] transition-all duration-700 ease-out transform ${showContent ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-10'}`}
      >
        {/* Header / Background Pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-purple-600 to-transparent mix-blend-overlay"></div>
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute top-32 -left-32 w-80 h-80 bg-purple-600 rounded-full blur-3xl opacity-40"></div>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-20 p-2.5 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md transition-all duration-300 shadow-lg hover:scale-110"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10 p-8 md:p-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 mb-6 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-2xl shadow-lg shadow-purple-500/30">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-purple-200 mb-4 tracking-tight">
              2026 WRAPPED
            </h2>
            <p className="text-lg text-indigo-300 font-medium">Kilas balik perjalanan hiburan dan literasimu!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* 1. Koleksi Diselesaikan */}
            <div className="bg-gradient-to-br from-indigo-900/50 to-blue-900/30 p-8 rounded-3xl border border-indigo-500/20 shadow-xl backdrop-blur-sm group hover:-translate-y-2 transition-transform duration-500">
              <Trophy className="w-10 h-10 text-yellow-400 mb-5 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-slate-300 text-sm font-bold uppercase tracking-wider mb-2">Koleksi Terselesaikan</h3>
              <div className="text-4xl font-black text-white mb-4">
                {wrapData.completedTotal} <span className="text-2xl text-indigo-300 font-bold">Judul</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-sm">
                Tahun ini kamu luar biasa! Berhasil menamatkan <span className="text-emerald-400 font-bold">{wrapData.completedBreakdown.game || 0} Game</span>, <span className="text-blue-400 font-bold">{wrapData.completedBreakdown.anime || 0} Anime</span>, dan <span className="text-amber-400 font-bold">{wrapData.completedBreakdown.book || 0} Buku</span>.
              </p>
            </div>

            {/* 2. Top Niche */}
            <div className="bg-gradient-to-br from-purple-900/50 to-fuchsia-900/30 p-8 rounded-3xl border border-purple-500/20 shadow-xl backdrop-blur-sm group hover:-translate-y-2 transition-transform duration-500">
              <Crown className="w-10 h-10 text-fuchsia-400 mb-5 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-slate-300 text-sm font-bold uppercase tracking-wider mb-2">Raja Genre</h3>
              <p className="text-slate-400 text-sm mb-5">
                Ini dia genre favorit yang paling sering mengisi waktumu:
              </p>
              <div className="flex flex-wrap gap-3">
                {wrapData.topGenres.map((genre, idx) => (
                  <div key={idx} className={`px-4 py-2 rounded-xl font-bold text-sm border flex items-center gap-2 shadow-lg ${
                    idx === 0 ? 'bg-fuchsia-600/30 border-fuchsia-500 text-fuchsia-200' : 
                    idx === 1 ? 'bg-purple-600/30 border-purple-500 text-purple-200' :
                    'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                  }`}>
                    <span className="text-xl">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                    {genre}
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Total Volume */}
            <div className="bg-gradient-to-br from-emerald-900/50 to-teal-900/30 p-8 rounded-3xl border border-emerald-500/20 shadow-xl backdrop-blur-sm group hover:-translate-y-2 transition-transform duration-500">
              <BookOpen className="w-10 h-10 text-emerald-400 mb-5 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-slate-300 text-sm font-bold uppercase tracking-wider mb-2">Total Volume Literasi</h3>
              <div className="space-y-4 mt-4">
                <div className="flex justify-between items-center pb-3 border-b border-emerald-800/50">
                  <span className="text-emerald-200/80 font-medium flex items-center gap-2"><PlayCircle className="w-4 h-4" /> Anime / TV</span>
                  <span className="text-2xl font-black text-white">{wrapData.totalVolume.episodes} <span className="text-sm font-bold text-emerald-400">Ep</span></span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-emerald-800/50">
                  <span className="text-emerald-200/80 font-medium flex items-center gap-2"><BookOpen className="w-4 h-4" /> Buku</span>
                  <span className="text-2xl font-black text-white">{wrapData.totalVolume.pages} <span className="text-sm font-bold text-emerald-400">Hal</span></span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-200/80 font-medium flex items-center gap-2"><LibraryBig className="w-4 h-4" /> Komik</span>
                  <span className="text-2xl font-black text-white">{wrapData.totalVolume.chapters} <span className="text-sm font-bold text-emerald-400">Ch</span></span>
                </div>
              </div>
            </div>

            {/* 4. Rata-rata Rating */}
            <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/30 p-8 rounded-3xl border border-amber-500/20 shadow-xl backdrop-blur-sm group hover:-translate-y-2 transition-transform duration-500 flex flex-col justify-center items-center text-center">
              <h3 className="text-slate-300 text-sm font-bold uppercase tracking-wider mb-6">Rata-Rata Apresiasi</h3>
              <div className="relative">
                <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-500 drop-shadow-lg z-10 relative">
                  {wrapData.averageRating.toFixed(1)}
                </div>
                <Star className="w-24 h-24 text-amber-500/20 absolute -top-4 -right-8 -z-0 transform rotate-12" />
              </div>
              <div className="flex gap-1 mt-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-6 h-6 ${star <= Math.round(wrapData.averageRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} 
                  />
                ))}
              </div>
              <p className="text-amber-200/70 text-sm mt-4">Berdasarkan ulasan jurnalmu.</p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button 
              onClick={onClose}
              className="px-10 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full backdrop-blur-md transition-all duration-300 border border-white/20 hover:border-white/40 hover:scale-105"
            >
              Tutup Jurnal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
