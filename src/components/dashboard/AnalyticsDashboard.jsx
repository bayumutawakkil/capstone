import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity } from 'lucide-react';

export default function AnalyticsDashboard({ timeSpentWeekly, mediaDistribution, dailyHours, quotaLimit = 3 }) {
  // Colors for the charts
  const COLORS = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#f472b6'];

  const progressPercentage = Math.min((dailyHours / quotaLimit) * 100, 100);
  const isDanger = dailyHours > quotaLimit;
  const isWarning = dailyHours > quotaLimit * 0.8 && !isDanger;

  let progressColor = 'bg-emerald-400';
  if (isDanger) progressColor = 'bg-red-500 animate-pulse';
  else if (isWarning) progressColor = 'bg-yellow-400';

  return (
    <div className="bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-2xl p-6 shadow-xl w-full transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-5 h-5 text-indigo-400" />
        <h2 className="text-xl font-bold text-white">Lifestyle Sync & Analytics</h2>
      </div>

      {/* Daily Entertainment Quota */}
      <div className="mb-8 p-5 bg-gray-800/40 rounded-xl border border-gray-700/50 relative overflow-hidden group">
        {/* Glow effect in background */}
        <div className={`absolute -inset-1 blur-2xl opacity-20 transition-all duration-500 rounded-xl ${isDanger ? 'bg-red-500' : 'bg-transparent'}`}></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Daily Entertainment Quota</h3>
              <p className="text-xs text-slate-400 mt-1">Goal: Max {quotaLimit} hours / day</p>
            </div>
            <div className={`text-2xl font-bold transition-colors duration-300 ${isDanger ? 'text-red-400' : 'text-emerald-400'}`}>
              {dailyHours.toFixed(2)} <span className="text-sm font-normal text-slate-500">/ {quotaLimit} h</span>
            </div>
          </div>
          <div className="w-full h-3 bg-gray-900/80 rounded-full overflow-hidden shadow-inner border border-gray-800">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${progressColor} ${isDanger ? 'shadow-[0_0_15px_rgba(239,68,68,0.7)]' : 'shadow-[0_0_10px_rgba(52,211,153,0.3)]'}`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          {isDanger && (
            <p className="text-xs text-red-400 mt-3 font-medium flex items-center gap-1">
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Kamu sudah melebihi batas waktu hiburan harian! Istirahatlah sejenak.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-72">
        {/* Media Distribution Chart */}
        <div className="flex flex-col h-full bg-gray-800/20 rounded-xl p-4 border border-gray-700/30">
          <h3 className="text-sm font-semibold text-slate-300 mb-2 text-center">Media Distribution (Total Hours)</h3>
          <div className="flex-1 w-full min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mediaDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {mediaDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ filter: 'drop-shadow(0px 0px 4px rgba(0,0,0,0.5))' }} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: '1px solid rgba(55, 65, 81, 0.8)', borderRadius: '0.75rem', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time Spent Weekly Chart */}
        <div className="flex flex-col h-full bg-gray-800/20 rounded-xl p-4 border border-gray-700/30">
          <h3 className="text-sm font-semibold text-slate-300 mb-2 text-center">Weekly Time Spent (Hours)</h3>
          <div className="flex-1 w-full min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSpentWeekly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: '1px solid rgba(55, 65, 81, 0.8)', borderRadius: '0.75rem', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                />
                <Bar dataKey="hours" fill="#818cf8" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
