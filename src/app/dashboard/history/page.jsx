'use client';

import ArchiveJournal from '@/components/dashboard/ArchiveJournal';
import { useDashboard } from '@/contexts/DashboardContext';

export default function HistoryPage() {
  const { archiveItems, loading } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <ArchiveJournal archives={archiveItems} />
    </div>
  );
}
