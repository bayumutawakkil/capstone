import { useState } from 'react';
import { Sparkles, LogIn, UserPlus } from 'lucide-react';

export default function HeroSection({ onNavigate }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <section 
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden select-none"
    >
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Dynamic tracking cursor glow */}
        <div
          className="absolute w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none transition-opacity duration-300"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
            transform: 'translate(-50%, -50%)',
            opacity: isHovered ? 1 : 0,
          }}
        />
        {/* Static decorative glows */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      {/* Badge */}
      <div className="relative inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm animate-fade-in">
        <Sparkles className="w-3.5 h-3.5" />
        Active Media &amp; Lifestyle Tracker
      </div>

      {/* Headline */}
      <h1 className="relative max-w-4xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight text-white mb-6 animate-fade-in">
        Kuasai{' '}
        <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
          Hiburanmu,
        </span>
        <br />
        Seimbangkan{' '}
        <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
          Gaya Hidupmu.
        </span>
      </h1>

      {/* Sub-headline */}
      <p className="relative max-w-2xl text-base sm:text-lg text-slate-400 mb-10 leading-relaxed animate-fade-in">
        Lacak game, anime, dan film yang sedang kamu nikmati sekarang — tanpa
        cemas dengan tumpukan backlog. NowPlaying membantumu fokus pada{' '}
        <em className="text-slate-300 not-italic">sekarang</em>.
      </p>

      {/* CTA Buttons */}
      <div className="relative flex flex-col sm:flex-row items-center gap-4 animate-fade-in">
        <button
          onClick={() => onNavigate('register')}
          className="group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Daftar Sekarang
        </button>

        <button 
          onClick={() => onNavigate('login')}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-slate-300 border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 hover:text-white transition-all duration-200 backdrop-blur-sm active:scale-95 cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          Masuk ke Akun
        </button>
      </div>
    </section>
  );
}
