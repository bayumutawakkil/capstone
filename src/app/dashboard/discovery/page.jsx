'use client';

import DiscoveryTab from '@/components/dashboard/DiscoveryTab';
import { useDashboard } from '@/contexts/DashboardContext';

export default function DiscoveryPage() {
  const { items, handleAddDiscoveryItem, loading } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <DiscoveryTab 
        allItems={items}
        onAddDiscoveryItem={handleAddDiscoveryItem}
      />
    </div>
  );
}
