'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star, Clock, Calendar, Bookmark } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function MediaDetail() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      if (!params?.id) return;
      
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .eq('id', params.id)
        .single();
        
      if (!error && data) {
        setMedia(data);
      }
      setLoading(false);
    };
    
    fetchMedia();
  }, [params, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!media) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Media tidak ditemukan</h1>
        <button onClick={() => router.push('/dashboard')} className="text-indigo-400 hover:text-indigo-300">
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      {/* Navbar Minimalis */}
      <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white truncate">Detail Media</h1>
        </div>
      </nav>

      {/* Konten Utama */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 shadow-2xl">
          {/* Poster */}
          <div className="w-full md:w-64 shrink-0 rounded-2xl overflow-hidden shadow-lg border border-gray-800 bg-gray-950">
            {media.cover_url ? (
              <img src={media.cover_url} alt={media.title} className="w-full aspect-[2/3] object-cover" />
            ) : (
              <div className="w-full aspect-[2/3] flex items-center justify-center text-slate-600">
                No Cover
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="px-3 py-1 text-xs uppercase font-bold tracking-wider rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3 inline-block">
                  {media.type}
                </span>
                <h2 className="text-3xl font-bold text-white leading-tight">{media.title}</h2>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800">
                <div className="text-slate-500 text-xs font-semibold uppercase mb-1 flex items-center gap-1.5"><Bookmark className="w-3.5 h-3.5" /> Status</div>
                <div className="text-white font-bold capitalize">{media.status}</div>
              </div>
              <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800">
                <div className="text-slate-500 text-xs font-semibold uppercase mb-1 flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /> Rating</div>
                <div className="text-amber-400 font-bold">{media.rating || '-'}/5</div>
              </div>
              <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800">
                <div className="text-slate-500 text-xs font-semibold uppercase mb-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Progres</div>
                <div className="text-white font-bold">{media.units_completed || 0} unit</div>
              </div>
              <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800">
                <div className="text-slate-500 text-xs font-semibold uppercase mb-1 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Mulai</div>
                <div className="text-white font-bold text-sm">
                  {media.start_date ? new Date(media.start_date).toLocaleDateString('id-ID') : '-'}
                </div>
              </div>
            </div>

            {media.review_text && (
              <div className="mt-auto bg-white/5 p-5 rounded-2xl border border-white/10">
                <h3 className="text-sm font-semibold text-indigo-300 mb-2 uppercase tracking-wide">Ulasan Jurnal</h3>
                <p className="text-slate-300 text-sm leading-relaxed italic">"{media.review_text}"</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
