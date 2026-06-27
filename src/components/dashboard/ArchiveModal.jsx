'use client';

import { useState, useEffect } from 'react';
import { X, Check, Trash2, Star } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function ArchiveModal({ archiveItem, onClose, onArchiveSuccess, showToast }) {
  const supabase = createClient();
  
  const [archiveStatus, setArchiveStatus] = useState('completed');
  const [archiveRating, setArchiveRating] = useState(5);
  const [archiveReview, setArchiveReview] = useState('');

  useEffect(() => {
    if (archiveItem) {
      setArchiveStatus('completed');
      setArchiveRating(archiveItem.rating || 5);
      setArchiveReview('');
    }
  }, [archiveItem]);

  const handleArchiveMedia = async (e) => {
    e.preventDefault();
    if (!archiveItem) return;

    try {
      const endDate = new Date().toISOString();
      const startDate = archiveItem.start_date || new Date(Date.now() - 1000*60*60*24*15).toISOString(); // Mock start 15 days ago

      // Update DB
      const { error } = await supabase
        .from('media_items')
        .update({
          status: archiveStatus,
          rating: archiveRating,
          review_text: archiveReview,
          start_date: startDate,
          end_date: endDate
        })
        .eq('id', archiveItem.id);

      if (error) throw error;

      const updatedItem = {
        ...archiveItem,
        status: archiveStatus,
        rating: archiveRating,
        review_text: archiveReview,
        start_date: startDate,
        end_date: endDate
      };

      if (onArchiveSuccess) onArchiveSuccess(updatedItem);
      showToast('Media berhasil diarsipkan ke History Journal!', 'success');
    } catch (err) {
      console.error('Failed to archive to DB:', err);
      showToast('Gagal mengarsipkan: ' + err.message, 'error');
    }
  };

  if (!archiveItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-gray-900 border border-gray-700 rounded-3xl shadow-2xl p-6 md:p-8 animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Arsipkan Media</h3>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        
        <form onSubmit={handleArchiveMedia} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">Status Akhir</label>
            <div className="flex gap-4">
              <label className="flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-2xl cursor-pointer border-2 transition-all bg-gray-950 hover:bg-gray-800"
                style={{ borderColor: archiveStatus === 'completed' ? '#10b981' : '#1f2937' }}
                onClick={() => setArchiveStatus('completed')}
              >
                <Check className={`w-8 h-8 ${archiveStatus === 'completed' ? 'text-emerald-500' : 'text-slate-600'}`} />
                <span className={`font-bold ${archiveStatus === 'completed' ? 'text-emerald-500' : 'text-slate-400'}`}>Completed</span>
              </label>
              <label className="flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-2xl cursor-pointer border-2 transition-all bg-gray-950 hover:bg-gray-800"
                style={{ borderColor: archiveStatus === 'dropped' ? '#ef4444' : '#1f2937' }}
                onClick={() => setArchiveStatus('dropped')}
              >
                <Trash2 className={`w-8 h-8 ${archiveStatus === 'dropped' ? 'text-red-500' : 'text-slate-600'}`} />
                <span className={`font-bold ${archiveStatus === 'dropped' ? 'text-red-500' : 'text-slate-400'}`}>Dropped</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Rating Apresiasi</label>
            <div className="flex gap-2 justify-center py-2 bg-gray-950 rounded-2xl border border-gray-800">
              {[1,2,3,4,5].map(s => (
                <Star 
                  key={s} 
                  className={`w-8 h-8 cursor-pointer transition-colors ${s <= archiveRating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} 
                  onClick={() => setArchiveRating(s)}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Ulasan / Jurnal Singkat</label>
            <textarea 
              value={archiveReview}
              onChange={(e) => setArchiveReview(e.target.value)}
              placeholder="Tuliskan pengalaman atau pendapatmu tentang media ini..."
              className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-4 py-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all h-28 resize-none"
            ></textarea>
          </div>

          <div className="pt-2">
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]">
              Simpan ke Arsip Jurnal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
