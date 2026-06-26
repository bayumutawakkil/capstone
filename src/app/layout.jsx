import './globals.css';

export const metadata = {
  title: 'NowPlaying - Active Media & Lifestyle Tracker',
  description: 'Lacak game, anime, dan film yang sedang kamu nikmati sekarang — tanpa cemas dengan tumpukan backlog.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-950 text-white antialiased selection:bg-indigo-500/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
