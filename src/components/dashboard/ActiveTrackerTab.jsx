import React from 'react';
import Link from 'next/link';
import { Gamepad2, Tv, Film, BookOpen, Compass, Check, Clock, Plus, Trash2, LibraryBig } from 'lucide-react';
import SessionTimer from './SessionTimer';

export default function ActiveTrackerTab({ 
  activeItems, 
  handleUpdateStatus, 
  handleDeleteItem, 
  promptArchive, 
  setActiveSessionMedia, 
  activeSessionMedia,
  handleAddSessionTime,
  handleQuickIncrement
}) {
  const getMediaIcon = (mediaType) => {
    switch(mediaType) {
      case 'game': return <Gamepad2 className="w-4 h-4 text-emerald-400" />;
      case 'tv': return <Tv className="w-4 h-4 text-blue-400" />;
      case 'movie': return <Film className="w-4 h-4 text-purple-400" />;
      case 'book': return <BookOpen className="w-4 h-4 text-amber-400" />;
      case 'comic': return <LibraryBig className="w-4 h-4 text-pink-400" />;
      default: return <Compass className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'playing') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(251,191,36,0.2)]">ACTIVE</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30">BACKLOG</span>;
  };

  const renderQuickAction = (item) => {
    if (item.status === 'backlog') return null;

    let actionLabel = '';
    let isFinishAction = false;
    
    switch(item.type) {
      case 'anime':
      case 'tv':
        actionLabel = '+1 Episode';
        break;
      case 'comic':
        actionLabel = '+1 Chapter';
        break;
      case 'book':
        actionLabel = '+10 Halaman';
        break;
      case 'game':
      case 'movie':
        actionLabel = 'Tandai Selesai';
        isFinishAction = true;
        break;
      default:
        actionLabel = '+1 Unit';
    }

    return (
      <button
        onClick={() => {
          if (isFinishAction) {
            promptArchive(item);
          } else {
            handleQuickIncrement(item.id, item.type);
          }
        }}
        className={`w-full py-1.5 mt-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
          isFinishAction 
            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/50' 
            : 'bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50 border border-indigo-500/30'
        }`}
      >
        {isFinishAction ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        {actionLabel}
      </button>
    );
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
      {/* Tracker Grid */}
      <div className="xl:col-span-3 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            Active Tracker
          </h2>
          <span className="text-xs font-medium text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            {activeItems.length} media dilacak
          </span>
        </div>

        {activeItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-2xl border-dashed">
            <Compass className="w-16 h-16 text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Belum ada media</h3>
            <p className="text-slate-400 text-center max-w-md">
              Tambahkan film, seri TV, buku, komik, atau game yang sedang kamu ikuti di menu pencarian.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeItems.map((item) => (
              <div 
                key={item.id}
                className={`p-4 rounded-2xl bg-gray-900/50 backdrop-blur-md border transition-all duration-300 flex flex-col group relative overflow-hidden shadow-lg ${
                  activeSessionMedia?.id === item.id ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex gap-4 mb-3">
                  {/* Left side: Cover Image */}
                  <div className="w-20 h-28 bg-gray-950 rounded-xl overflow-hidden shrink-0 border border-gray-700 relative shadow-md">
                    {item.cover_url || item.coverUrl ? (
                      <img 
                        src={item.cover_url || item.coverUrl} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-gray-900/80">
                        {getMediaIcon(item.type)}
                      </div>
                    )}
                  </div>

                  {/* Right side: Media info & Actions */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 capitalize text-[10px] text-slate-400 font-bold tracking-wider">
                          {getMediaIcon(item.type)}
                          <span>{item.type}</span>
                        </div>
                        {getStatusBadge(item.status)}
                      </div>

                      <Link href={`/media/${item.id}`}>
                        <h4 className="text-sm font-bold text-white hover:text-indigo-400 group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug cursor-pointer" title={item.title}>
                          {item.title}
                        </h4>
                      </Link>
                      
                      <p className="text-xs text-indigo-400/80 mt-1.5 font-medium flex items-center gap-1">
                        <span className="text-slate-500">Unit:</span> 
                        <span className="text-indigo-300 font-bold">{item.units_completed || 0}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-800 pt-2 mt-2">
                      <div className="flex items-center gap-1.5">
                        {item.status !== 'completed' && (
                          <button
                            onClick={() => promptArchive(item)}
                            title="Arsipkan (Selesai/Dropped)"
                            className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {item.status === 'playing' && (
                          <button
                            onClick={() => setActiveSessionMedia(item)}
                            title="Lacak Waktu"
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              activeSessionMedia?.id === item.id 
                                ? 'bg-amber-500/20 text-amber-400' 
                                : 'text-amber-400/70 hover:bg-amber-500/20 hover:text-amber-400'
                            }`}
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}
                        {item.status === 'backlog' && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'playing')}
                            title="Mulai Lacak"
                            className="p-1.5 rounded-lg text-indigo-400/70 hover:bg-indigo-500/20 hover:text-indigo-400 transition-colors cursor-pointer"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        title="Hapus"
                        className="p-1.5 rounded-lg text-red-400/60 hover:bg-red-500/20 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {renderQuickAction(item)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Column: Session Timer */}
      <div className="xl:col-span-1">
        <SessionTimer 
          activeMedia={activeSessionMedia}
          onSessionEnd={handleAddSessionTime}
        />
      </div>
    </div>
  );
}
