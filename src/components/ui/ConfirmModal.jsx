import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in px-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl animate-scale-in">
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex flex-col items-center text-center mt-4">
          <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Konfirmasi Tindakan</h3>
          <p className="text-slate-400 mb-8 text-sm">
            {message}
          </p>
          
          <div className="flex w-full gap-3">
            <button 
              onClick={onCancel}
              className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
            >
              Batal
            </button>
            <button 
              onClick={() => {
                onConfirm();
              }}
              className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium shadow-lg shadow-rose-900/20 transition-all hover:-translate-y-0.5"
            >
              Ya, Lanjutkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
