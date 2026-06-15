import { useState } from 'react';
import HeroSection from './components/HeroSection';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  if (currentPage === 'login') {
    return <LoginPage onNavigate={setCurrentPage} />;
  }

  if (currentPage === 'register') {
    return <RegisterPage onNavigate={setCurrentPage} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30 selection:text-white">
      <HeroSection onNavigate={setCurrentPage} />
    </div>
  );
}

