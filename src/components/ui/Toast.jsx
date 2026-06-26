import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade out animation
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const typeConfig = {
    success: {
      icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
      bg: 'bg-emerald-950/80',
      border: 'border-emerald-500/30',
      text: 'text-emerald-200'
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-rose-400" />,
      bg: 'bg-rose-950/80',
      border: 'border-rose-500/30',
      text: 'text-rose-200'
    },
    warning: {
      icon: <AlertCircle className="w-5 h-5 text-amber-400" />,
      bg: 'bg-amber-950/80',
      border: 'border-amber-500/30',
      text: 'text-amber-200'
    },
    info: {
      icon: <Info className="w-5 h-5 text-fuchsia-400" />,
      bg: 'bg-slate-900/90',
      border: 'border-slate-700',
      text: 'text-slate-200'
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className={`fixed bottom-6 right-6 z-[100] transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
      <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl backdrop-blur-md border shadow-2xl ${config.bg} ${config.border}`}>
        {config.icon}
        <p className={`text-sm font-medium ${config.text} max-w-sm`}>{message}</p>
        <button 
          onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }}
          className="ml-2 p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className={`w-4 h-4 ${config.text} opacity-70`} />
        </button>
      </div>
    </div>
  );
}
