import { useState } from 'react';
import { Tv2, Mail, Lock, Eye, EyeOff, ArrowLeft, User, Check, X } from 'lucide-react';

export default function RegisterPage({ onNavigate }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Interaktivitas Glow
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Validasi Real-time
  const [emailError, setEmailError] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleEmailChange = (val) => {
    setEmail(val);
    if (emailTouched) {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      setEmailError(!isValid);
    }
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setEmailError(!isValid);
  };

  // Hitung Kekuatan Password
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'Kosong', color: 'bg-slate-700', textClass: 'text-slate-500' };
    let score = 0;
    
    // Syarat 1: Panjang minimal 6 karakter
    if (pass.length >= 6) score++;
    
    // Syarat 2: Mengandung kombinasi huruf & angka
    const hasAlpha = /[a-zA-Z]/.test(pass);
    const hasNum = /[0-9]/.test(pass);
    if (hasAlpha && hasNum) score++;
    
    // Syarat 3: Mengandung karakter spesial atau huruf besar
    const hasSpecialOrUpper = /[^a-z0-9]/.test(pass);
    if (hasSpecialOrUpper) score++;

    if (score <= 1) {
      return { score: 1, label: 'Lemah', color: 'bg-rose-500', textClass: 'text-rose-400', width: 'w-1/3' };
    } else if (score === 2) {
      return { score: 2, label: 'Sedang', color: 'bg-amber-500', textClass: 'text-amber-400', width: 'w-2/3' };
    } else {
      return { score: 3, label: 'Kuat', color: 'bg-emerald-500', textClass: 'text-emerald-400', width: 'w-full' };
    }
  };

  const strength = getPasswordStrength(password);

  // Status Kecocokan Kata Sandi
  const isPasswordMatch = confirmPassword.length > 0 && password === confirmPassword;
  const isPasswordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = (e) => {
    e.preventDefault();
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passStrength = getPasswordStrength(password);
    
    if (!isEmailValid || passStrength.score < 2 || password !== confirmPassword || !agreeTerms) {
      setEmailTouched(true);
      if (!isEmailValid) setEmailError(true);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    alert(`Mencoba mendaftar dengan Nama: ${name}, Email: ${email}`);
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="min-h-screen bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden selection:bg-indigo-500/30 selection:text-white select-none"
    >
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
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
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] animate-pulse-slow" />
      </div>

      {/* Top Header / Back Button */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => onNavigate('landing')}
          className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Kembali ke Beranda
        </button>

        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400">
            <Tv2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            NowPlaying
          </span>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-slate-900/40 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl shadow-indigo-500/5 hover:border-indigo-500/20 transition-all duration-300 animate-fade-in">
          
          {/* Header Form */}
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Daftar Akun Baru
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Mulai atur hiburan dan gaya hidup Anda hari ini
            </p>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              onClick={() => alert('Daftar dengan Google')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-300 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              {/* Google SVG Icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.03-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
            <button
              onClick={() => alert('Daftar dengan GitHub')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-300 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              {/* GitHub SVG Icon */}
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              GitHub
            </button>
          </div>

          <div className="relative flex items-center justify-center my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <span className="relative px-3 text-xs bg-slate-950/80 text-slate-500 uppercase tracking-wider">
              atau gunakan email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wide">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  Email
                </label>
                {emailTouched && emailError && (
                  <span className="text-[10px] text-rose-400 font-medium">Format email tidak valid</span>
                )}
              </div>
              <div className="relative">
                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${emailTouched ? (emailError ? 'text-rose-500' : 'text-emerald-500') : 'text-slate-500'}`} />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={handleEmailBlur}
                  className={`w-full bg-slate-900/60 border rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    emailTouched
                      ? emailError
                        ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/10'
                        : 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/10'
                      : 'border-white/10 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  Password
                </label>
                {password && (
                  <span className={`text-[10px] font-semibold ${strength.textClass}`}>
                    Kekuatan: {strength.label}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength Meter Bar */}
              {password && (
                <div className="w-full h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                  <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  Konfirmasi Password
                </label>
                {confirmPassword && (
                  <span className={`text-[10px] font-semibold flex items-center gap-1 ${isPasswordMatch ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPasswordMatch ? (
                      <>
                        <Check className="w-3 h-3" /> Cocok
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3" /> Tidak cocok
                      </>
                    )}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full bg-slate-900/60 border rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    confirmPassword.length > 0
                      ? isPasswordMatch
                        ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/10'
                        : 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-white/10 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-start pt-1">
              <input
                id="terms"
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500/30 focus:ring-offset-0 focus:ring-2 cursor-pointer"
              />
              <label htmlFor="terms" className="ml-2 text-xs text-slate-400 select-none cursor-pointer leading-tight">
                Saya menyetujui <a href="#" onClick={(e) => {e.preventDefault(); alert('Syarat & Ketentuan');}} className="text-indigo-400 hover:underline">Syarat & Ketentuan</a> serta <a href="#" onClick={(e) => {e.preventDefault(); alert('Kebijakan Privasi');}} className="text-indigo-400 hover:underline">Kebijakan Privasi</a> NowPlaying
              </label>
            </div>

            <button
              type="submit"
              className={`w-full relative inline-flex items-center justify-center py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${isShaking ? 'animate-shake' : ''}`}
            >
              Daftar
            </button>
          </form>

          {/* Bottom Link */}
          <div className="mt-6 text-center text-xs sm:text-sm text-slate-500">
            Sudah punya akun?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              Masuk
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-slate-600 border-t border-white/5 bg-slate-950/50">
        © 2026 NowPlaying. Dilindungi undang-undang.
      </footer>
    </div>
  );
}
