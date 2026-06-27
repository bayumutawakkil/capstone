'use client';

import { useState } from 'react';
import { Gamepad2, Tv, Film, BookOpen, LibraryBig, Search, X, Plus, Star } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { 
  searchMovieOrTV, searchAnime, searchGame, searchBooks, searchComics 
} from '@/services/apiService';

export default function AddMediaForm({ user, items, onClose, onAddSuccess, showToast }) {
  const supabase = createClient();

  const [title, setTitle] = useState('');
  const [type, setType] = useState('game');
  const [status, setStatus] = useState('playing');
  const [progress, setProgress] = useState('');
  const [rating, setRating] = useState('5');
  const [coverUrl, setCoverUrl] = useState('');
  const [externalId, setExternalId] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    setSelectedMedia(null);

    try {
      let results = [];
      if (type === 'game') results = await searchGame(searchQuery);
      else if (type === 'anime') results = await searchAnime(searchQuery);
      else if (type === 'movie' || type === 'tv') results = await searchMovieOrTV(searchQuery);
      else if (type === 'book') results = await searchBooks(searchQuery);
      else if (type === 'comic') results = await searchComics(searchQuery);
      
      if (results.length === 0) {
        showToast('Tidak ada hasil yang ditemukan untuk pencarian tersebut.', 'info');
      }
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
      showToast('Pencarian gagal, silakan coba beberapa saat lagi.', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectMedia = (media) => {
    setTitle(media.title);
    setCoverUrl(media.coverUrl);
    setType(media.type);
    setExternalId(media.external_id || media.id);
    setSelectedMedia(media);
    setSearchResults([]);
  };

  const handleAddItem = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!title) return;
    
    // Duplication Check
    const isDuplicate = items.some(item => 
      (item.external_id && item.external_id === String(externalId)) || 
      (!item.external_id && item.title.toLowerCase() === title.toLowerCase() && item.type === type)
    );
    
    if (isDuplicate) {
      showToast('Media ini sudah ada dalam daftar pelacakan Anda!', 'warning');
      return;
    }

    try {
      const mockGenre = type === 'game' ? 'RPG' : type === 'anime' ? 'Shounen' : 'Action';

      const { error } = await supabase
        .from('media_items')
        .insert([{
          user_id: user.id,
          external_id: String(externalId),
          title,
          type,
          status,
          progress,
          rating: parseInt(rating),
          cover_url: coverUrl,
          units_completed: 0,
          time_invested: 0,
          genre: mockGenre
        }]);

      if (error) throw error;
      
      setTitle(''); setProgress(''); setCoverUrl(''); setSearchQuery('');
      setSelectedMedia(null); setSearchResults([]);
      
      if (onAddSuccess) onAddSuccess();
    } catch (err) {
      console.error('Gagal menambah item:', err);
      showToast('Terjadi kesalahan saat menambah item: ' + err.message, 'error');
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-3xl p-6 md:p-8 mb-10 shadow-2xl relative overflow-hidden animate-fade-in">
      <div className="absolute top-0 right-0 p-4">
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors bg-white/5 rounded-full p-2">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Tambah Media Baru</h2>
        <p className="text-slate-400 text-sm">Cari dan tambahkan entri ke daftar pelacakanmu.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 space-y-5">
          <div className="bg-gray-950 p-1.5 rounded-2xl border border-gray-800 flex flex-wrap gap-1">
            {[
              { id: 'game', icon: <Gamepad2 className="w-4 h-4"/>, label: 'Game' },
              { id: 'anime', icon: <Tv className="w-4 h-4"/>, label: 'Anime' },
              { id: 'movie', icon: <Film className="w-4 h-4"/>, label: 'Film' },
              { id: 'tv', icon: <Tv className="w-4 h-4"/>, label: 'TV' },
              { id: 'book', icon: <BookOpen className="w-4 h-4"/>, label: 'Buku' },
              { id: 'comic', icon: <LibraryBig className="w-4 h-4"/>, label: 'Komik' }
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => { setType(t.id); setSearchQuery(''); setSearchResults([]); setSelectedMedia(null); }}
                className={`flex-1 min-w-[30%] py-2.5 px-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold ${
                  type === t.id ? 'bg-indigo-500/20 text-indigo-300 shadow-sm border border-indigo-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Cari judul ${type}...`}
              className="w-full bg-gray-950 border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            />
            <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <button type="submit" disabled={!searchQuery.trim() || isSearching} className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl disabled:opacity-50 transition-colors">
              {isSearching ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Search className="w-4 h-4" />}
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className="bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden max-h-64 overflow-y-auto shadow-inner">
              {searchResults.map(res => {
                const isDup = items.some(item => item.title.toLowerCase() === res.title.toLowerCase() && item.type === res.type);
                return (
                <div key={res.id} onClick={() => !isDup && handleSelectMedia(res)} className={`flex items-center gap-4 p-3 border-b border-gray-800/50 last:border-0 transition-colors group ${isDup ? 'opacity-50 cursor-not-allowed bg-gray-900/50' : 'hover:bg-white/5 cursor-pointer'}`}>
                  {res.coverUrl ? (
                    <img src={res.coverUrl} alt={res.title} className={`w-12 h-16 object-cover rounded-lg shadow-md transition-transform ${isDup ? '' : 'group-hover:scale-105'}`} />
                  ) : (
                    <div className="w-12 h-16 bg-gray-900 rounded-lg flex flex-col items-center justify-center text-slate-600">
                      <Search className="w-4 h-4 mb-1" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-bold truncate transition-colors ${isDup ? 'text-gray-500' : 'text-white group-hover:text-indigo-300'}`}>{res.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {isDup ? (
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 border border-slate-700 px-2 py-0.5 rounded-full">Sudah di Inventory</span>
                      ) : (
                        <>
                          {res.year && <span className="text-xs text-slate-400 bg-gray-800 px-2 py-0.5 rounded-full">{res.year}</span>}
                          {res.score && <span className="text-xs text-amber-400 font-medium flex items-center gap-1"><Star className="w-3 h-3 fill-current"/> {res.score}</span>}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>

        <div className="md:col-span-7">
          {selectedMedia ? (
            <form onSubmit={handleAddItem} className="bg-gray-950 p-6 rounded-3xl border border-gray-800 flex flex-col h-full shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full blur-2xl"></div>
              <div className="flex gap-6 mb-8 relative z-10">
                {coverUrl && (
                  <div className="w-28 h-40 shrink-0 bg-gray-900 rounded-xl overflow-hidden shadow-xl border border-gray-700">
                    <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2 leading-tight">{title}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {type}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-auto relative z-10">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none appearance-none">
                    <option value="playing">Sedang Aktif (Playing/Watching/Reading)</option>
                    <option value="backlog">Daftar Tunggu (Backlog)</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full bg-white text-slate-900 hover:bg-indigo-50 font-bold py-3 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" /> Simpan ke Tracker
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-3xl p-8 bg-gray-950/50">
              <Search className="w-12 h-12 text-slate-700 mb-4" />
              <p className="text-slate-500 text-center font-medium">Cari dan pilih media dari panel kiri untuk melihat detail dan menambahkannya ke tracker.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
