'use client';

import LifestyleAnalyticsTab from '@/components/dashboard/LifestyleAnalyticsTab';
import { useDashboard } from '@/contexts/DashboardContext';

export default function AnalyticsPage() {
  const { 
    dailyUnits,
    mediaDistribution,
    consumptionVolumeWeekly,
    loading
  } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <LifestyleAnalyticsTab 
        dailyUnits={dailyUnits}
        dailyTarget={20}
        mediaDistribution={mediaDistribution}
        consumptionVolumeWeekly={consumptionVolumeWeekly}
      />
    </div>
  );
}
