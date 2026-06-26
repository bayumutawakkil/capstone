import React from 'react';
import { Archive, Star, Clock, Calendar, Sparkles } from 'lucide-react';

/**
 * Komponen Tab Jurnal Arsip. Menampilkan daftar entri media yang telah diselesaikan.
 * 
 * @param {Object} props
 * @param {Array<Object>} props.archives - Daftar entri dengan status 'completed' atau 'dropped'
 * @param {Function} props.onOpenWrapped - Handler untuk membuka modal NowPlaying Wrapped
 * @returns {JSX.Element|null} UI Komponen ArchiveJournal
 */
export default function ArchiveJournal({ archives, onOpenWrapped }) {
  if (!archives || archives.length === 0) {
    return null;
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`} />
    ));
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return '?';
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diff = Math.abs(d2 - d1);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days === 0 ? 1 : days;
  };

  return (
    <div className="mt-12">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="bg-fuchsia-500/20 p-2.5 rounded-xl border border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.2)]">
            <Archive className="w-6 h-6 text-fuchsia-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">History Journal</h2>
            <p className="text-slate-400 text-sm">Arsip ulasan dan rekam jejak hiburanmu</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <span className="hidden md:inline-block px-4 py-2 bg-gray-900/80 border border-gray-700 rounded-full text-xs font-bold text-slate-300 shadow-inner">
            {archives.length} Koleksi
          </span>
          <button
            onClick={onOpenWrapped}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-bold text-white bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 shadow-[0_0_15px_rgba(192,38,211,0.4)] hover:shadow-[0_0_25px_rgba(192,38,211,0.6)] transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-5 h-5" />
            <span>✨ Lihat NowPlaying Wrapped Anda!</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {archives.map((item) => (
          <div 
            key={item.id} 
            className="bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-2xl overflow-hidden shadow-lg opacity-85 hover:opacity-100 hover:shadow-2xl hover:border-gray-700 transition-all duration-300 group hover:-translate-y-1"
          >
            <div className="h-44 relative overflow-hidden">
              <img 
                src={item.cover_url || item.coverUrl} 
                alt={item.title}
                className="w-full h-full object-cover filter brightness-75 group-hover:brightness-90 transition-all duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
              
              <div className="absolute top-3 right-3">
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider backdrop-blur-md shadow-sm border flex items-center gap-1 ${
                  item.status === 'completed' 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'completed' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                  {item.status}
                </span>
              </div>

              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="text-white font-bold truncate group-hover:text-indigo-300 transition-colors text-lg" title={item.title}>
                  {item.title}
                </h3>
                <div className="flex items-center mt-1.5 gap-1">
                  {renderStars(item.rating || 0)}
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="flex flex-col gap-3 mb-4">
                <div className="flex items-center justify-between text-xs text-slate-400 bg-gray-800/50 p-2 rounded-lg">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-500" /> Waktu Selesai</span>
                  <span className="font-bold text-slate-300">{calculateDays(item.start_date, item.end_date)} hari</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 bg-gray-800/50 p-2 rounded-lg">
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-500" /> Investasi Waktu</span>
                  <span className="font-bold text-indigo-400">{(item.time_invested || 0).toFixed(2)} jam</span>
                </div>
              </div>

              {item.review_text && (
                <div className="pt-3 border-t border-gray-800/80">
                  <p className="text-xs text-slate-400 italic line-clamp-3 leading-relaxed">"{item.review_text}"</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
