'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Compass, Plus, Star, Info, ChevronDown, CheckCircle2 } from 'lucide-react';
import { getRecommendations } from '@/services/apiService';

export default function DiscoveryTab({ allItems = [], onAddDiscoveryItem }) {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const dropdownRef = useRef(null);

  // Auto-select item pertama jika belum ada yang terpilih
  useEffect(() => {
    if (allItems.length > 0 && !selectedMedia) {
      setSelectedMedia(allItems[0]);
    }
  }, [allItems, selectedMedia]);

  // Handle klik di luar dropdown untuk menutupnya
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch recommendations saat selectedMedia berubah
  useEffect(() => {
    let isMounted = true;
    const fetchRecommendations = async () => {
      if (!selectedMedia) return;
      
      setLoading(true);
      setRecommendations([]);
      
      try {
        const results = await getRecommendations(selectedMedia.type, selectedMedia.id, selectedMedia.title);
        if (isMounted) {
          setRecommendations(results);
        }
      } catch (error) {
        console.error("Failed to fetch recommendations", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRecommendations();
    return () => { isMounted = false; };
  }, [selectedMedia]);

  const handleSelectChange = (item) => {
    setSelectedMedia(item);
    setIsDropdownOpen(false);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'playing':
      case 'backlog':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 flex-shrink-0">[Active]</span>;
      case 'completed':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex-shrink-0">[Completed]</span>;
      case 'dropped':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 flex-shrink-0">[Dropped]</span>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in">
      {/* Header & Dropdown Section */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl relative z-30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Compass className="w-6 h-6 text-fuchsia-400" />
              <h2 className="text-2xl font-bold text-white">Discovery</h2>
            </div>
            <p className="text-sm text-slate-400">
              Cari rekomendasi serupa dari histori Anda (Aktif maupun Selesai).
            </p>
          </div>
          
          {/* Custom Dropdown UI */}
          <div className="flex-shrink-0 w-full md:w-96 relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={allItems.length === 0}
              className="w-full flex items-center justify-between bg-slate-950/80 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 hover:bg-slate-900 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-2 truncate overflow-hidden">
                {selectedMedia ? (
                  <>
                    <span className="truncate">{selectedMedia.title}</span>
                    {getStatusBadge(selectedMedia.status)}
                  </>
                ) : (
                  <span>Belum ada media</span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 flex-shrink-0 ml-2 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Options List */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto z-50 py-2 custom-scrollbar">
                {allItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectChange(item)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-0 ${
                      selectedMedia?.id === item.id ? 'bg-fuchsia-900/20 text-fuchsia-300' : 'text-slate-300'
                    }`}
                  >
                    <span className="truncate pr-4 font-medium">{item.title}</span>
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">{item.type}</span>
                      {getStatusBadge(item.status)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full relative z-10">
        {allItems.length === 0 ? (
          <div className="bg-slate-900/20 border border-slate-800/50 rounded-2xl p-12 text-center flex flex-col items-center">
            <Info className="w-12 h-12 text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-400">Rak Masih Kosong</h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">
              Tambahkan media ke rak Anda terlebih dahulu agar mesin Discovery dapat memberikan rekomendasi.
            </p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(skeleton => (
              <div key={skeleton} className="bg-slate-900/30 border border-slate-800 rounded-2xl p-4 h-64 animate-pulse flex flex-col">
                <div className="w-full h-32 bg-slate-800 rounded-xl mb-4"></div>
                <div className="h-4 bg-slate-800 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-800 rounded w-1/2 mb-auto"></div>
                <div className="h-10 bg-slate-800 rounded-xl w-full mt-4"></div>
              </div>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="bg-slate-900/20 border border-slate-800/50 rounded-2xl p-12 text-center flex flex-col items-center">
            <Info className="w-12 h-12 text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-400">Rekomendasi Tidak Ditemukan</h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">
              Kami tidak dapat menemukan konten yang mirip dengan "{selectedMedia?.title}".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map(rec => {
              const isDup = allItems.some(item => item.title.toLowerCase() === rec.title.toLowerCase() && item.type === rec.type);
              
              return (
              <div key={rec.id} className="group relative bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden hover:border-fuchsia-500/30 transition-all duration-300 shadow-lg flex flex-col">
                {/* Image & Overlay */}
                <div className="h-48 w-full overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10"></div>
                  <img 
                    src={rec.coverUrl} 
                    alt={rec.title} 
                    className={`w-full h-full object-cover transition-transform duration-500 ${isDup ? '' : 'transform group-hover:scale-105'}`}
                    loading="lazy"
                  />
                  {rec.rating && (
                    <div className="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-white">{rec.rating}</span>
                    </div>
                  )}
                  {isDup && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-15 flex flex-col items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2" />
                      <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">Sudah Terlacak</span>
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-white line-clamp-1 mb-1">{rec.title}</h3>
                  <p className="text-xs text-slate-400 mb-3">{rec.authorOrStudio}</p>
                  
                  <div className="mt-auto pt-4 border-t border-slate-800/50">
                    <button 
                      onClick={() => !isDup && onAddDiscoveryItem(rec)}
                      disabled={isDup}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors duration-300 ${
                        isDup 
                          ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed' 
                          : 'bg-slate-800 hover:bg-fuchsia-600 text-white'
                      }`}
                    >
                      {isDup ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Terlacak ✓
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Ikut Melacak
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}
