import { useState, useEffect } from 'react';
import { Play, Square, Clock, Pause } from 'lucide-react';

export default function SessionTimer({ activeMedia, onSessionEnd }) {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const stopTimer = () => {
    setIsActive(false);
    if (seconds > 0) {
      // Return seconds. For demo purposes, we can treat 1 real second as 1 minute or something so the chart moves fast
      // Or we can just pass raw seconds
      onSessionEnd(seconds);
      setSeconds(0);
    }
  };

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-2xl p-6 shadow-xl w-full flex flex-col h-full transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-5 h-5 text-indigo-400" />
        <h2 className="text-xl font-bold text-white">Session Timer</h2>
      </div>
      
      {activeMedia ? (
        <div className="flex-1 flex flex-col items-center justify-center py-4">
          <p className="text-sm text-slate-400 mb-2 truncate max-w-xs text-center">
            Tracking: <span className="text-white font-medium">{activeMedia.title}</span>
          </p>
          <div className="text-6xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-8 tracking-wider transition-all duration-300 drop-shadow-md">
            {formatTime(seconds)}
          </div>
          <div className="flex gap-4">
            <button
              onClick={toggleTimer}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                isActive 
                  ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/50' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/30'
              }`}
            >
              {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              {isActive ? 'Pause' : 'Mulai'}
            </button>
            <button
              onClick={stopTimer}
              disabled={seconds === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Square className="w-5 h-5 fill-current" />
              Stop & Simpan
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-10 text-center opacity-70">
          <Clock className="w-12 h-12 text-slate-600 mb-3" />
          <p className="text-slate-400 max-w-[200px]">Pilih media dari daftar untuk mulai melacak waktu.</p>
        </div>
      )}
    </div>
  );
}
