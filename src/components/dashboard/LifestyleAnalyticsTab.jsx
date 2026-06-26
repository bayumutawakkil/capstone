import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, Target } from 'lucide-react';

/**
 * Komponen Tab Lifestyle Analytics.
 * Menampilkan visualisasi data metrik konsumsi media menggunakan Recharts, berbasis kuantitas/volume.
 * 
 * @param {Object} props
 * @param {Array<Object>} props.consumptionVolumeWeekly - Data tren mingguan (satuan unit)
 * @param {Array<Object>} props.mediaDistribution - Data sebaran tipe media dari database
 * @param {number} props.dailyUnits - Total unit yang dicapai hari ini
 * @param {number} props.dailyTarget - Target konsumsi unit harian
 * @returns {JSX.Element} UI Komponen LifestyleAnalyticsTab
 */
export default function LifestyleAnalyticsTab({ 
  consumptionVolumeWeekly, 
  mediaDistribution, 
  dailyUnits, 
  dailyTarget = 20 
}) {
  const COLORS = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#f472b6'];

  const progressPercentage = Math.min((dailyUnits / dailyTarget) * 100, 100);
  const isGoalReached = dailyUnits >= dailyTarget;

  return (
    <div className="bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl w-full">
      <div className="flex items-center gap-3 mb-8">
        <Activity className="w-6 h-6 text-indigo-400" />
        <h2 className="text-2xl font-bold text-white">Lifestyle Analytics</h2>
      </div>

      {/* Daily Milestone Progress */}
      <div className="mb-10 p-6 bg-gray-800/40 rounded-2xl border border-gray-700/50 relative overflow-hidden group">
        <div className={`absolute -inset-1 blur-2xl opacity-20 transition-all duration-1000 rounded-2xl ${isGoalReached ? 'bg-emerald-500' : 'bg-transparent'}`}></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${isGoalReached ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Daily Consumption Milestone</h3>
                <p className="text-sm text-slate-400 mt-0.5">Target Konsumsi Harian: {dailyTarget} Unit</p>
              </div>
            </div>
            <div className={`text-3xl font-black transition-colors duration-500 ${isGoalReached ? 'text-emerald-400' : 'text-white'}`}>
              {Math.floor(dailyUnits)} <span className="text-lg font-bold text-slate-500">/ {dailyTarget}</span>
            </div>
          </div>
          <div className="w-full h-4 bg-gray-950/80 rounded-full overflow-hidden shadow-inner border border-gray-800">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                isGoalReached ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 'bg-gradient-to-r from-indigo-500 to-blue-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          {isGoalReached && (
            <p className="text-sm text-emerald-400 mt-4 font-bold flex items-center gap-2 animate-fade-in">
              🎉 Luar biasa! Kamu telah mencapai target literasi dan hiburan hari ini.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-80">
        {/* Media Distribution (Quantity) */}
        <div className="flex flex-col h-full bg-gray-800/30 rounded-2xl p-6 border border-gray-700/30">
          <h3 className="text-sm font-bold text-slate-300 mb-4 text-center tracking-wide uppercase">Volume Distribusi Media</h3>
          <div className="flex-1 w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mediaDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={6}
                  dataKey="value"
                  stroke="none"
                >
                  {mediaDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.4))' }} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(51, 65, 85, 0.8)', borderRadius: '1rem', color: '#fff', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="bottom" height={40} iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Consumption Volume Weekly */}
        <div className="flex flex-col h-full bg-gray-800/30 rounded-2xl p-6 border border-gray-700/30">
          <h3 className="text-sm font-bold text-slate-300 mb-4 text-center tracking-wide uppercase">Tren Konsumsi 7 Hari (Unit)</h3>
          <div className="flex-1 w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consumptionVolumeWeekly} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={13} tickLine={false} axisLine={false} dy={10} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(51, 65, 85, 0.8)', borderRadius: '1rem', color: '#fff', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}
                />
                <Bar dataKey="units" radius={[6, 6, 0, 0]} barSize={32}>
                  {
                    consumptionVolumeWeekly.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.units > 0 ? '#818cf8' : '#334155'} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
