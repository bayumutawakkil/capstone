'use client';

import { useState } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import Toast from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';
import NowPlayingWrappedModal from '@/components/dashboard/NowPlayingWrappedModal';
import TabNavigation from '@/components/dashboard/TabNavigation';
import { DashboardProvider, useDashboard } from '@/contexts/DashboardContext';

export default function DashboardLayout({ children }) {
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: () => {} });
  const [isWrappedOpen, setIsWrappedOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const showConfirm = (message, onConfirm) => {
    setConfirmDialog({
      isOpen: true,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <DashboardProvider showToast={showToast} showConfirm={showConfirm}>
      <div 
        className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden relative flex flex-col"
        onMouseMove={handleMouseMove}
      >
        <div 
          className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
          style={{ background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.05), transparent 40%)` }}
        />
        
        {/* We need to use a wrapper component that accesses context for the Header */}
        <DashboardHeaderWrapper onOpenWrapped={() => setIsWrappedOpen(true)} />

        <main className="relative z-10 flex-1 overflow-y-auto pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <TabNavigation onOpenWrapped={() => setIsWrappedOpen(true)} />
            {children}
          </div>
        </main>

        {/* We need to pass wrappedData to the modal, so we'll wrap it too */}
        <WrappedModalWrapper isOpen={isWrappedOpen} onClose={() => setIsWrappedOpen(false)} />
      
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />
        <ConfirmModal 
          isOpen={confirmDialog.isOpen} 
          message={confirmDialog.message} 
          onConfirm={confirmDialog.onConfirm} 
          onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })} 
        />
      </div>
    </DashboardProvider>
  );
}

// Helper component to access Context for Header
function DashboardHeaderWrapper({ onOpenWrapped }) {
  const { user, handleLogout } = useDashboard();
  return <DashboardHeader user={user} onLogout={handleLogout} onOpenWrapped={onOpenWrapped} />;
}

// Helper component to access Context for Wrapped Modal
function WrappedModalWrapper({ isOpen, onClose }) {
  const { wrappedData } = useDashboard();
  return <NowPlayingWrappedModal isOpen={isOpen} onClose={onClose} wrapData={wrappedData} />;
}
