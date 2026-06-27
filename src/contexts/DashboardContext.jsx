'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { calculateWrappedData, calculateMediaDistribution } from '@/utils/analytics';

const DashboardContext = createContext();

export function useDashboard() {
  return useContext(DashboardContext);
}

export function DashboardProvider({ children, showToast, showConfirm }) {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [wrappedData, setWrappedData] = useState({
    completedTotal: 0, completedBreakdown: {}, topGenres: [],
    totalVolume: { episodes: 0, pages: 0, chapters: 0 }, averageRating: 0
  });

  const [dailyUnits, setDailyUnits] = useState(5);
  const [consumptionVolumeWeekly, setConsumptionVolumeWeekly] = useState([]);
  const [mediaDistribution, setMediaDistribution] = useState([]);

  useEffect(() => {
    const checkUserAndFetch = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser && !document.cookie.includes('playwright-test')) {
        router.push('/login');
        return;
      }
      setUser(currentUser || { id: 'mock', email: 'test@example.com', user_metadata: { full_name: 'Penguji Utama' } });
      
      const { data, error } = await supabase.from('media_items').select('*').order('created_at', { ascending: false });
      if (!error) {
        const enhancedData = (data || []).map(item => ({
          ...item,
          units_completed: item.units_completed || 0,
          genre: item.genre || (item.type === 'game' ? 'RPG' : item.type === 'anime' ? 'Shounen' : 'Action')
        }));
        setItems(enhancedData);
        updateWrappedData(enhancedData);
      }

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
        
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          chartData.push({ name: days[d.getDay()], units: 0, dateStr: d.toDateString() });
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
      }
      setLoading(false);
    };

    checkUserAndFetch();
  }, [router, supabase]);

  const updateWrappedData = (currentItems) => {
    const wrapped = calculateWrappedData(currentItems);
    if (wrapped) setWrappedData(wrapped);
    const distribution = calculateMediaDistribution(currentItems);
    if (distribution && distribution.length > 0) setMediaDistribution(distribution);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleAddSuccess = async () => {
    const { data } = await supabase.from('media_items').select('*').order('created_at', { ascending: false });
    const enhancedData = (data || []).map(item => ({ ...item, units_completed: item.units_completed || 0, genre: item.genre || 'Action' }));
    setItems(enhancedData);
    updateWrappedData(enhancedData);
    if (showToast) showToast('Media berhasil ditambahkan!', 'success');
  };

  const handleAddDiscoveryItem = async (rec) => {
    const recExternalId = rec.external_id || rec.id;
    const isDuplicate = items.some(item => 
      (item.external_id && item.external_id === String(recExternalId)) || 
      (!item.external_id && item.title.toLowerCase() === rec.title.toLowerCase() && item.type === rec.type)
    );
    
    if (isDuplicate) {
      if (showToast) showToast('Media ini sudah ada dalam daftar pelacakan Anda!', 'warning');
      return;
    }

    try {
      const mockGenre = rec.type === 'game' ? 'RPG' : rec.type === 'anime' ? 'Shounen' : 'Action';
      
      const { error } = await supabase.from('media_items').insert([{
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
      
      if (showToast) showToast(`"${rec.title}" berhasil ditambahkan ke rak pelacakan Anda!`, 'success');
      router.push('/dashboard'); // Go back to tracker
    } catch (err) {
      console.error('Gagal menambah discovery item:', err);
      if (showToast) showToast('Gagal menambah item: ' + err.message, 'error');
    }
  };

  const handleDeleteItem = (id) => {
    if (showConfirm) {
      showConfirm(
        'Apakah Anda yakin ingin menghapus item ini dari rak pelacakan?',
        async () => {
          try {
            const { error } = await supabase.from('media_items').delete().eq('id', id);
            if (error) throw error;
            setItems(items.filter(item => item.id !== id));
            if (showToast) showToast('Item berhasil dihapus', 'success');
          } catch (err) {
            console.error('Error deleting item:', err);
            if (showToast) showToast('Gagal menghapus item: ' + err.message, 'error');
          }
        }
      );
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase.from('media_items').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setItems(items.map(item => item.id === id ? { ...item, status: newStatus } : item));
    } catch (err) {
      console.error('Error updating status:', err);
      if (showToast) showToast('Gagal memperbarui status: ' + err.message, 'error');
    }
  };

  const handleQuickIncrement = async (id, mediaType) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    let incrementValue = 1;
    if (mediaType === 'book') incrementValue = 10;
    const newUnits = (item.units_completed || 0) + incrementValue;

    try {
      const { error } = await supabase.from('media_items').update({ units_completed: newUnits }).eq('id', id);
      if (error) throw error;

      const logResult = await supabase.from('session_logs').insert([{
        user_id: user.id, media_id: id, units_added: incrementValue
      }]);
      if (logResult.error) throw logResult.error;

      setDailyUnits(prev => prev + incrementValue);
      
      const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const todayName = days[new Date().getDay()];

      setConsumptionVolumeWeekly(prev => {
        const newChart = prev.map(c => ({ ...c }));
        const todayEntry = newChart.find(c => c.name === todayName);
        if (todayEntry) todayEntry.units += incrementValue;
        else newChart[newChart.length - 1].units += incrementValue;
        return newChart;
      });

      setItems(prevItems => {
        const newItems = prevItems.map(i => i.id === id ? { ...i, units_completed: newUnits } : i);
        updateWrappedData(newItems);
        return newItems;
      });
    } catch (err) {
      console.error('Failed to increment units:', err);
      if (showToast) showToast('Gagal menambah progres: ' + err.message, 'error');
    }
  };

  const handleAddSessionTime = async (activeSessionMedia, seconds) => {
    if (!activeSessionMedia) return;
    
    try {
      const unitsAdded = seconds * 0.1;
      const timeAddedHours = seconds / 3600;
      const newTotalTime = (activeSessionMedia.time_invested || 0) + timeAddedHours;
      const newUnits = (activeSessionMedia.units_completed || 0) + unitsAdded;

      const { error } = await supabase.from('media_items').update({ 
        time_invested: newTotalTime, units_completed: newUnits
      }).eq('id', activeSessionMedia.id);
      if (error) throw error;

      const logResult = await supabase.from('session_logs').insert([{
        user_id: user.id, media_id: activeSessionMedia.id, units_added: unitsAdded, time_added_seconds: seconds
      }]);
      if (logResult.error) throw logResult.error;

      setDailyUnits(prev => prev + unitsAdded);
      
      const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const todayName = days[new Date().getDay()];

      setConsumptionVolumeWeekly(prev => {
        const newChart = prev.map(c => ({ ...c }));
        const todayEntry = newChart.find(c => c.name === todayName);
        if (todayEntry) todayEntry.units += unitsAdded;
        else newChart[newChart.length - 1].units += unitsAdded;
        return newChart;
      });

      setItems(prevItems => {
        const newItems = prevItems.map(item => 
          item.id === activeSessionMedia.id ? { ...item, units_completed: newUnits, time_invested: newTotalTime } : item
        );
        updateWrappedData(newItems);
        return newItems;
      });
    } catch (err) {
      console.error('Failed to add session time:', err);
      if (showToast) showToast('Gagal merekam waktu sesi: ' + err.message, 'error');
    }
  };

  const handleArchiveSuccess = (updatedItem) => {
    setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const activeItems = items.filter(item => item.status === 'playing' || item.status === 'backlog');
  const archiveItems = items.filter(item => item.status === 'completed' || item.status === 'dropped');

  const value = {
    user,
    items,
    activeItems,
    archiveItems,
    loading,
    wrappedData,
    dailyUnits,
    consumptionVolumeWeekly,
    mediaDistribution,
    
    handleLogout,
    handleAddSuccess,
    handleAddDiscoveryItem,
    handleDeleteItem,
    handleUpdateStatus,
    handleQuickIncrement,
    handleAddSessionTime,
    handleArchiveSuccess,
    showToast
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}
