'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import ActiveTrackerTab from '@/components/dashboard/ActiveTrackerTab';
import AddMediaForm from '@/components/dashboard/AddMediaForm';
import ArchiveModal from '@/components/dashboard/ArchiveModal';
import { useDashboard } from '@/contexts/DashboardContext';

export default function DashboardPage() {
  const { 
    user,
    items,
    activeItems,
    loading,
    handleUpdateStatus,
    handleDeleteItem,
    handleAddSessionTime,
    handleQuickIncrement,
    handleAddSuccess,
    handleArchiveSuccess,
    showToast
  } = useDashboard();

  const [isAdding, setIsAdding] = useState(false);
  const [activeSessionMedia, setActiveSessionMedia] = useState(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveItem, setArchiveItem] = useState(null);

  const promptArchive = (item) => {
    setArchiveItem(item);
    setIsArchiving(true);
  };

  const internalHandleArchiveSuccess = (updatedItem) => {
    handleArchiveSuccess(updatedItem);
    setIsArchiving(false);
    setArchiveItem(null);
  };

  const internalHandleAddSuccess = () => {
    handleAddSuccess();
    setIsAdding(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-6">
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 hover:bg-indigo-50 rounded-xl font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all duration-300"
          >
            <Plus className="w-5 h-5" /> Tambah Media Baru
          </button>
        )}
      </div>

      {isAdding && (
        <AddMediaForm 
          user={user} 
          items={items} 
          onClose={() => setIsAdding(false)} 
          onAddSuccess={internalHandleAddSuccess}
          showToast={showToast}
        />
      )}

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

      {isArchiving && archiveItem && (
        <ArchiveModal 
          archiveItem={archiveItem} 
          onClose={() => { setIsArchiving(false); setArchiveItem(null); }} 
          onArchiveSuccess={internalHandleArchiveSuccess}
          showToast={showToast}
        />
      )}
    </>
  );
}
