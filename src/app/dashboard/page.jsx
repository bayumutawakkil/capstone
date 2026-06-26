'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LogOut, Plus, Trash2, Check, X, Star, 
  Gamepad2, Tv, Film, Compass, Clock, ListFilter,
  Search, BookOpen, Layers, Activity, Sparkles, Archive, LibraryBig
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { 
  searchMovieOrTV, searchAnime, searchGame, searchBooks, searchComics 
} from '@/services/apiService';
import ActiveTrackerTab from '@/components/dashboard/ActiveTrackerTab';
import LifestyleAnalyticsTab from '@/components/dashboard/LifestyleAnalyticsTab';
import ArchiveJournal from '@/components/dashboard/ArchiveJournal';
import DiscoveryTab from '@/components/dashboard/DiscoveryTab';
import NowPlayingWrappedModal from '@/components/dashboard/NowPlayingWrappedModal';
import Toast from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { calculateWrappedData, calculateMediaDistribution } from '@/utils/analytics';

// --- CLIENT COMPONENT ---

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState(null);
  
  // Custom UI State
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: () => {} });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Tabbing System State
  const [activeTab, setActiveTab] = useState('tracker'); // 'tracker', 'analytics', 'history'

  // Wrapped State
  const [isWrappedOpen, setIsWrappedOpen] = useState(false);
  const [wrappedData, setWrappedData] = useState({
    completedTotal: 0,
    completedBreakdown: {},
    topGenres: [],
    totalVolume: { episodes: 0, pages: 0, chapters: 0 },
    averageRating: 0
  });

  // Form states for adding new media
  const [title, setTitle] = useState('');
  const [type, setType] = useState('game');
  const [status, setStatus] = useState('playing');
  const [progress, setProgress] = useState('');
  const [rating, setRating] = useState('5');
  const [coverUrl, setCoverUrl] = useState('');
  const [externalId, setExternalId] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // API-First Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Ambient cursor pos
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Modul B: Lifestyle Sync & Analytics State (Mocked & Reactive)
  const [dailyUnits, setDailyUnits] = useState(5);
  const [consumptionVolumeWeekly, setConsumptionVolumeWeekly] = useState([
    { name: 'Sen', units: 12 },
    { name: 'Sel', units: 8 },
    { name: 'Rab', units: 25 },
    { name: 'Kam', units: 5 },
    { name: 'Jum', units: 30 },
    { name: 'Sab', units: 0 },
    { name: 'Min', units: 0 },
  ]);
  const [mediaDistribution, setMediaDistribution] = useState([
    { name: 'Game', value: 2 },
    { name: 'Anime', value: 8 },
    { name: 'Movie', value: 3 },
    { name: 'TV', value: 5 },
    { name: 'Comic', value: 12 },
    { name: 'Book', value: 4 },
  ]);
  const [activeSessionMedia, setActiveSessionMedia] = useState(null);

  // Modul C: Archive Modal State
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveItem, setArchiveItem] = useState(null);
  const [archiveStatus, setArchiveStatus] = useState('completed');
  const [archiveRating, setArchiveRating] = useState(5);
  const [archiveReview, setArchiveReview] = useState('');

  useEffect(() => {
    const checkUserAndFetch = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser && !document.cookie.includes('playwright-test')) {
        router.push('/login');
        return;
      }
      setUser(currentUser || { id: 'mock', email: 'test@example.com', user_metadata: { full_name: 'Penguji Utama' } });
      
      // Fetch media items
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching items:', error);
      } else {
        const enhancedData = (data || []).map(item => ({
          ...item,
          units_completed: item.units_completed || 0,
          genre: item.genre || (item.type === 'game' ? 'RPG' : item.type === 'anime' ? 'Shounen' : 'Action') // Mock genre
        }));
        setItems(enhancedData);
        updateWrappedData(enhancedData);
      }

      // Fetch session logs for the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: logsData, error: logsError } = await supabase
        .from('session_logs')
        .select('*')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (!logsError && logsData) {
        const todayStr = new Date().toDateString();
        let todayUnits = 0;
        
        const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        const chartData = [];
        
        // Populate chart structure (last 7 days)
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          chartData.push({
            name: days[d.getDay()],
            units: 0,
            dateStr: d.toDateString()
          });
        }
        
        logsData.forEach(log => {
          const logDate = new Date(log.created_at);
          const logDateStr = logDate.toDateString();
          
          if (logDateStr === todayStr) {
            todayUnits += (log.units_added || 0);
          }
          
          const chartEntry = chartData.find(c => c.dateStr === logDateStr);
          if (chartEntry) {
            chartEntry.units += (log.units_added || 0);
          }
        });
        
        setDailyUnits(todayUnits);
        setConsumptionVolumeWeekly(chartData.map(({name, units}) => ({name, units})));
      } else {
        console.error('Logs error', logsError);
      }

      setLoading(false);
    };

    checkUserAndFetch();
  }, [router, supabase]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    setSelectedMedia(null);

    try {
      let results = [];
      if (type === 'game') results = await searchGame(searchQuery);
      else if (type === 'anime') results = await searchAnime(searchQuery);
      else if (type === 'movie' || type === 'tv') results = await searchMovieOrTV(searchQuery);
      else if (type === 'book') results = await searchBooks(searchQuery);
      else if (type === 'comic') results = await searchComics(searchQuery);
      if (results.length === 0) {
        showToast('Tidak ada hasil yang ditemukan untuk pencarian tersebut.', 'info');
      }
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
      showToast('Pencarian gagal, silakan coba beberapa saat lagi.', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectMedia = (media) => {
    setTitle(media.title);
    setCoverUrl(media.coverUrl);
    setType(media.type);
    setExternalId(media.external_id || media.id);
    setSelectedMedia(media);
    setSearchResults([]);
  };

  /**
   * Menambahkan item baru dari hasil pencarian API.
   * Dilengkapi pencegahan duplikasi berbasis external_id (seperti TMDB_ID, MAL_ID).
   */
  const handleAddItem = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!title) return;
    
    // Duplication Check (Memprioritaskan external_id, fallback ke kombinasi judul & tipe)
    const isDuplicate = items.some(item => 
      (item.external_id && item.external_id === String(externalId)) || 
      (!item.external_id && item.title.toLowerCase() === title.toLowerCase() && item.type === type)
    );
    
    if (isDuplicate) {
      showToast('Media ini sudah ada dalam daftar pelacakan Anda!', 'warning');
      return;
    }

    try {
      const mockGenre = type === 'game' ? 'RPG' : type === 'anime' ? 'Shounen' : 'Action';

      const { error } = await supabase
        .from('media_items')
        .insert([{
          user_id: user.id,
          external_id: String(externalId),
          title,
          type,
          status,
          progress,
          rating: parseInt(rating),
          cover_url: coverUrl,
          units_completed: 0,
          time_invested: 0,
          genre: mockGenre
        }]);

      if (error) throw error;
      
      setTitle(''); setProgress(''); setCoverUrl(''); setSearchQuery('');
      setSelectedMedia(null); setSearchResults([]); setIsAdding(false);
      
      const { data } = await supabase.from('media_items').select('*').order('created_at', { ascending: false });
      const enhancedData = (data || []).map(item => ({ ...item, units_completed: 0, genre: 'Action' }));
      setItems(enhancedData);
      updateWrappedData(enhancedData);
    } catch (err) {
      console.error('Gagal menambah item:', err);
      showToast('Terjadi kesalahan saat menambah item: ' + err.message, 'error');
    }
  };

  /**
   * Menambahkan item baru dari Tab Discovery.
   */
  const handleAddDiscoveryItem = async (rec) => {
    const recExternalId = rec.external_id || rec.id;
    // Duplication Check
    const isDuplicate = items.some(item => 
      (item.external_id && item.external_id === String(recExternalId)) || 
      (!item.external_id && item.title.toLowerCase() === rec.title.toLowerCase() && item.type === rec.type)
    );
    
    if (isDuplicate) {
      showToast('Media ini sudah ada dalam daftar pelacakan Anda!', 'warning');
      return;
    }

    try {
      const mockGenre = rec.type === 'game' ? 'RPG' : rec.type === 'anime' ? 'Shounen' : 'Action';
      
      const { error } = await supabase
        .from('media_items')
        .insert([{
          user_id: user.id,
          external_id: String(recExternalId),
          title: rec.title,
          type: rec.type,
          status: 'playing',
          progress: '0',
          rating: 5,
          cover_url: rec.coverUrl,
          units_completed: 0,
          time_invested: 0,
          genre: mockGenre
        }]);

      if (error) throw error;
      
      const { data } = await supabase.from('media_items').select('*').order('created_at', { ascending: false });
      const enhancedData = (data || []).map(item => ({ ...item, units_completed: 0, genre: 'Action' }));
      setItems(enhancedData);
      updateWrappedData(enhancedData);
      setActiveTab('tracker');
      showToast(`"${rec.title}" berhasil ditambahkan ke rak pelacakan Anda!`, 'success');
    } catch (err) {
      console.error('Gagal menambah discovery item:', err);
      showToast('Gagal menambah item: ' + err.message, 'error');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus item ini?')) return;
    try {
      const { error } = await supabase.from('media_items').delete().eq('id', id);
      if (error) throw error;
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting item:', err);
      showToast('Gagal menghapus item: ' + err.message, 'error');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase.from('media_items').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setItems(items.map(item => item.id === id ? { ...item, status: newStatus } : item));
    } catch (err) {
      console.error('Error updating status:', err);
      showToast('Gagal memperbarui status: ' + err.message, 'error');
    }
  };

  // --- NEW MECHANICS ---
  /**
   * Fungsi penambahan progres cepat, divalidasi berdasarkan tipe media
   */
  const handleQuickIncrement = async (id, mediaType) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    let incrementValue = 1;
    if (mediaType === 'book') incrementValue = 10;

    const newUnits = (item.units_completed || 0) + incrementValue;

    try {
      const { error } = await supabase
        .from('media_items')
        .update({ units_completed: newUnits })
        .eq('id', id);

      if (error) throw error;

      // Insert log
      const logResult = await supabase.from('session_logs').insert([{
        user_id: user.id,
        media_id: id,
        units_added: unitsToAdd
      }]);
      
      if (logResult.error) throw logResult.error;

      setDailyUnits(prev => prev + unitsToAdd);
      
      // Update weekly chart immediately
      const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const todayName = days[new Date().getDay()];

      setConsumptionVolumeWeekly(prev => {
        const newChart = prev.map(c => ({ ...c }));
        const todayEntry = newChart.find(c => c.name === todayName);
        if (todayEntry) {
           todayEntry.units += unitsToAdd;
        } else {
           newChart[newChart.length - 1].units += unitsToAdd;
        }
        return newChart;
      });

      setItems(prevItems => {
        const newItems = prevItems.map(item => 
          item.id === id ? { ...item, units_completed: newUnits } : item
        );
        updateWrappedData(newItems);
        return newItems;
      });
    } catch (err) {
      console.error('Failed to increment units:', err);
      showToast('Gagal menambah progres: ' + err.message, 'error');
    }
  };

  const handleAddSessionTime = async (seconds) => {
    if (!activeSessionMedia) return;
    
    try {
      const unitsAdded = seconds * 0.1; // Demo: 10 seconds = 1 unit
      const timeAddedHours = seconds / 3600;
      
      const newTotalTime = (activeSessionMedia.time_invested || 0) + timeAddedHours;
      const newUnits = (activeSessionMedia.units_completed || 0) + unitsAdded;

        // Update DB
      const { error } = await supabase
        .from('media_items')
        .update({ 
          time_invested: newTotalTime,
          units_completed: newUnits
        })
        .eq('id', activeSessionMedia.id);
        
      if (error) throw error;

      const logResult = await supabase.from('session_logs').insert([{
        user_id: user.id,
        media_id: activeSessionMedia.id,
        units_added: unitsAdded,
        time_added_seconds: seconds
      }]);
      
      if (logResult.error) throw logResult.error;

      setDailyUnits(prev => prev + unitsAdded);
      
      const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const todayName = days[new Date().getDay()];

      setConsumptionVolumeWeekly(prev => {
        const newChart = prev.map(c => ({ ...c }));
        const todayEntry = newChart.find(c => c.name === todayName);
        if (todayEntry) {
           todayEntry.units += unitsAdded;
        } else {
           newChart[newChart.length - 1].units += unitsAdded;
        }
        return newChart;
      });

      setItems(prevItems => {
        const newItems = prevItems.map(item => 
          item.id === activeSessionMedia.id ? { ...item, units_completed: newUnits, time_invested: newTotalTime } : item
        );
        updateWrappedData(newItems);
        return newItems;
      });
      
      setActiveSessionMedia(null);
    } catch (err) {
      console.error('Failed to add session time:', err);
      showToast('Gagal merekam waktu sesi: ' + err.message, 'error');
    }
  };

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

      setItems(items.map(item => item.id === archiveItem.id ? updatedItem : item));
      setIsArchiving(false);
      setArchiveItem(null);
      setArchiveReview('');
      
      showToast('Media berhasil diarsipkan ke History Journal!', 'success');
    } catch (err) {
      console.error('Failed to archive to DB:', err);
      showToast('Gagal mengarsipkan: ' + err.message, 'error');
    }
  };

  const promptArchive = (item) => {
    setArchiveItem(item);
    setArchiveStatus('completed');
    setArchiveRating(item.rating || 5);
    setArchiveReview('');
    setIsArchiving(true);
  };

  /**
   * Mengumpulkan dan mengkalkulasi ulang data statistik berdasarkan item yang ada
   * Memanggil fungsi murni dari analytics.js untuk efisiensi render
   * @param {Array<Object>} currentItems - Seluruh data pelacakan
   */
  const updateWrappedData = (currentItems) => {
    const wrapped = calculateWrappedData(currentItems);
    if (wrapped) setWrappedData(wrapped);
    
    const distribution = calculateMediaDistribution(currentItems);
    if (distribution && distribution.length > 0) {
      setMediaDistribution(distribution);
    }
  };

  const activeItems = items.filter(item => item.status === 'playing' || item.status === 'backlog');
  const archiveItems = items.filter(item => item.status === 'completed' || item.status === 'dropped');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden relative flex flex-col"
      onMouseMove={handleMouseMove}
    >
      {/* Background Effects */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.05), transparent 40%)`
        }}
      />
      
      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push('/')}>
              <div className="bg-indigo-600 p-2.5 rounded-xl group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-300">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                  NowPlaying
                </h1>
                <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-bold">Media & Literacy Tracker</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsWrappedOpen(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 shadow-[0_0_15px_rgba(147,51,234,0.4)] hover:shadow-[0_0_25px_rgba(147,51,234,0.6)] transition-all duration-300 transform hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                <span>Lihat NowPlaying Wrapped Anda!</span>
              </button>

              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                  {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-slate-200 leading-tight">
                    {user?.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-slate-500">Premium Member</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all"
                title="Keluar"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 overflow-y-auto pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          
          {/* Tabbing Navigation */}
          <div className="flex p-1 bg-gray-900/60 backdrop-blur-md rounded-2xl border border-gray-800 mb-8 inline-flex mx-auto md:mx-0 overflow-x-auto w-full md:w-auto hide-scrollbar shadow-lg">
            <button
              onClick={() => setActiveTab('tracker')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap ${
                activeTab === 'tracker' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Compass className="w-4 h-4" />
              Active Tracker
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap ${
                activeTab === 'analytics' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Activity className="w-4 h-4" />
              Lifestyle Analytics
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap ${
                activeTab === 'history' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Archive className="w-4 h-4" />
              History Journal
            </button>
            <button
              onClick={() => setActiveTab('discovery')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap ${
                activeTab === 'discovery' ? 'bg-fuchsia-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Search className="w-4 h-4" />
              Discovery
            </button>
          </div>

          <div className="md:hidden mb-6 flex justify-center">
             <button
                onClick={() => setIsWrappedOpen(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 w-full rounded-full font-bold text-white bg-gradient-to-r from-purple-600 to-blue-500 shadow-[0_0_15px_rgba(147,51,234,0.4)]"
              >
                <Sparkles className="w-5 h-5" />
                <span>NowPlaying Wrapped 2026</span>
              </button>
          </div>

          {/* Add Media Button (Global) */}
          <div className="flex justify-end mb-6">
            {!isAdding && activeTab === 'tracker' && (
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 hover:bg-indigo-50 rounded-xl font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all duration-300"
              >
                <Plus className="w-5 h-5" /> Tambah Media Baru
              </button>
            )}
          </div>

          {/* Add Media Form */}
          {isAdding && activeTab === 'tracker' && (
            <div className="bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-3xl p-6 md:p-8 mb-10 shadow-2xl relative overflow-hidden animate-fade-in">
              <div className="absolute top-0 right-0 p-4">
                <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-white transition-colors bg-white/5 rounded-full p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Tambah Media Baru</h2>
                <p className="text-slate-400 text-sm">Cari dan tambahkan entri ke daftar pelacakanmu.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-5 space-y-5">
                  <div className="bg-gray-950 p-1.5 rounded-2xl border border-gray-800 flex flex-wrap gap-1">
                    {[
                      { id: 'game', icon: <Gamepad2 className="w-4 h-4"/>, label: 'Game' },
                      { id: 'anime', icon: <Tv className="w-4 h-4"/>, label: 'Anime' },
                      { id: 'movie', icon: <Film className="w-4 h-4"/>, label: 'Film' },
                      { id: 'tv', icon: <Tv className="w-4 h-4"/>, label: 'TV' },
                      { id: 'book', icon: <BookOpen className="w-4 h-4"/>, label: 'Buku' },
                      { id: 'comic', icon: <LibraryBig className="w-4 h-4"/>, label: 'Komik' }
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => { setType(t.id); setSearchQuery(''); setSearchResults([]); setSelectedMedia(null); }}
                        className={`flex-1 min-w-[30%] py-2.5 px-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold ${
                          type === t.id ? 'bg-indigo-500/20 text-indigo-300 shadow-sm border border-indigo-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                        }`}
                      >
                        {t.icon}
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSearch} className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={`Cari judul ${type}...`}
                      className="w-full bg-gray-950 border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    />
                    <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <button type="submit" disabled={!searchQuery.trim() || isSearching} className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl disabled:opacity-50 transition-colors">
                      {isSearching ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Search className="w-4 h-4" />}
                    </button>
                  </form>

                  {searchResults.length > 0 && (
                    <div className="bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden max-h-64 overflow-y-auto shadow-inner">
                      {searchResults.map(res => {
                        const isDup = items.some(item => item.title.toLowerCase() === res.title.toLowerCase() && item.type === res.type);
                        return (
                        <div key={res.id} onClick={() => !isDup && handleSelectMedia(res)} className={`flex items-center gap-4 p-3 border-b border-gray-800/50 last:border-0 transition-colors group ${isDup ? 'opacity-50 cursor-not-allowed bg-gray-900/50' : 'hover:bg-white/5 cursor-pointer'}`}>
                          {res.coverUrl ? (
                            <img src={res.coverUrl} alt={res.title} className={`w-12 h-16 object-cover rounded-lg shadow-md transition-transform ${isDup ? '' : 'group-hover:scale-105'}`} />
                          ) : (
                            <div className="w-12 h-16 bg-gray-900 rounded-lg flex flex-col items-center justify-center text-slate-600">
                              <Search className="w-4 h-4 mb-1" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-bold truncate transition-colors ${isDup ? 'text-gray-500' : 'text-white group-hover:text-indigo-300'}`}>{res.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              {isDup ? (
                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 border border-slate-700 px-2 py-0.5 rounded-full">Sudah di Inventory</span>
                              ) : (
                                <>
                                  {res.year && <span className="text-xs text-slate-400 bg-gray-800 px-2 py-0.5 rounded-full">{res.year}</span>}
                                  {res.score && <span className="text-xs text-amber-400 font-medium flex items-center gap-1"><Star className="w-3 h-3 fill-current"/> {res.score}</span>}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )})}
                    </div>
                  )}
                </div>

                <div className="md:col-span-7">
                  {selectedMedia ? (
                    <form onSubmit={handleAddItem} className="bg-gray-950 p-6 rounded-3xl border border-gray-800 flex flex-col h-full shadow-inner relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full blur-2xl"></div>
                      <div className="flex gap-6 mb-8 relative z-10">
                        {coverUrl && (
                          <div className="w-28 h-40 shrink-0 bg-gray-900 rounded-xl overflow-hidden shadow-xl border border-gray-700">
                            <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2 leading-tight">{title}</h3>
                          <div className="flex items-center gap-2 mb-4">
                            <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              {type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-auto relative z-10">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Status</label>
                          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none appearance-none">
                            <option value="playing">Sedang Aktif (Playing/Watching/Reading)</option>
                            <option value="backlog">Daftar Tunggu (Backlog)</option>
                          </select>
                        </div>
                        <div className="flex items-end">
                          <button type="submit" className="w-full bg-white text-slate-900 hover:bg-indigo-50 font-bold py-3 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2">
                            <Plus className="w-5 h-5" /> Simpan ke Tracker
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-3xl p-8 bg-gray-950/50">
                      <Search className="w-12 h-12 text-slate-700 mb-4" />
                      <p className="text-slate-500 text-center font-medium">Cari dan pilih media dari panel kiri untuk melihat detail dan menambahkannya ke tracker.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENTS */}
          {activeTab === 'tracker' && (
            <div className="animate-fade-in">
              <ActiveTrackerTab 
                activeItems={activeItems}
                handleUpdateStatus={handleUpdateStatus}
                handleDeleteItem={handleDeleteItem}
                promptArchive={promptArchive}
                setActiveSessionMedia={setActiveSessionMedia}
                activeSessionMedia={activeSessionMedia}
                handleAddSessionTime={handleAddSessionTime}
                handleQuickIncrement={handleQuickIncrement}
              />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="animate-fade-in">
              <LifestyleAnalyticsTab 
                dailyUnits={dailyUnits}
                dailyTarget={20}
                mediaDistribution={mediaDistribution}
                consumptionVolumeWeekly={consumptionVolumeWeekly}
              />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="animate-fade-in">
              <ArchiveJournal archives={archiveItems} onOpenWrapped={() => setIsWrappedOpen(true)} />
            </div>
          )}

          {activeTab === 'discovery' && (
            <div className="animate-fade-in">
              <DiscoveryTab 
                allItems={items}
                onAddDiscoveryItem={handleAddDiscoveryItem}
              />
            </div>
          )}

        </div>
      </main>

      {/* Archive Modal */}
      {isArchiving && archiveItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsArchiving(false)}></div>
          <div className="relative w-full max-w-md bg-gray-900 border border-gray-700 rounded-3xl shadow-2xl p-6 md:p-8 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Arsipkan Media</h3>
              <button onClick={() => setIsArchiving(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
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
      )}

      <NowPlayingWrappedModal 
        isOpen={isWrappedOpen}
        onClose={() => setIsWrappedOpen(false)}
        wrapData={wrappedData}
      />
    
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />
      <ConfirmModal 
        isOpen={confirmDialog.isOpen} 
        message={confirmDialog.message} 
        onConfirm={confirmDialog.onConfirm} 
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })} 
      />
</div>
  );
}
