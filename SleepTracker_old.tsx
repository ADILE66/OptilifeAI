import React, { useState, useMemo } from 'react';
import { SleepLog, UserGoals } from '../types';
import { IconMoon, IconPlus, IconTrash, IconChartBar, IconSparkles, IconLock } from './Icons';
import { useTranslation } from '../i18n/i18n';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AIInsightsModal from './AIInsightsModal';

interface SleepTrackerProps {
  logs: SleepLog[];
  onAdd: (log: Omit<SleepLog, 'id' | 'timestamp'>) => void;
  onDelete: (id: string) => void;
  goals: UserGoals;
  isProMember: boolean;
  onUpgradeClick: () => void;
}

const SleepTracker: React.FC<SleepTrackerProps> = ({ logs, onAdd, onDelete, goals, isProMember, onUpgradeClick }) => {
  const { t } = useTranslation();
  const [startTime, setStartTime] = useState('23:00');
  const [endTime, setEndTime] = useState('07:00');
  const [quality, setQuality] = useState<SleepLog['quality']>('good');
  const [historyView, setHistoryView] = useState<'week' | 'month' | 'year'>('week');
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);

  const calculateDuration = (start: string, end: string): number => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    if (durationMinutes < 0) durationMinutes += 24 * 60; // Crosses midnight
    return durationMinutes;
  };

  const handleAdd = () => {
    const durationMinutes = calculateDuration(startTime, endTime);
    if (durationMinutes === 0) return; // Prevent adding 0 duration
    onAdd({
      startTime,
      endTime,
      durationMinutes,
      quality
    });
  };

  const historyData = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (historyView === 'week') {
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        return d;
      });
      return days.map(day => {
        const startOfDay = day.getTime();
        const endOfDay = startOfDay + 86400000;
        const dailyLogs = logs.filter(l => l.timestamp >= startOfDay && l.timestamp < endOfDay);
        const totalMinutes = dailyLogs.reduce((acc, l) => acc + l.durationMinutes, 0);
        return {
          label: day.toLocaleDateString('fr-FR', { weekday: 'short' }),
          value: parseFloat((totalMinutes / 60).toFixed(1))
        };
      });
    } else if (historyView === 'month') {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => {
        const dayNum = i + 1;
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), dayNum).getTime();
        const endOfDay = startOfDay + 86400000;
        const dailyLogs = logs.filter(l => l.timestamp >= startOfDay && l.timestamp < endOfDay);
        const totalMinutes = dailyLogs.reduce((acc, l) => acc + l.durationMinutes, 0);
        return {
          label: String(dayNum),
          value: parseFloat((totalMinutes / 60).toFixed(1))
        };
      });
    } else {
      return Array.from({ length: 12 }, (_, i) => {
        const startOfMonth = new Date(now.getFullYear(), i, 1).getTime();
        const endOfMonth = new Date(now.getFullYear(), i + 1, 0).getTime() + 86400000;
        const monthlyLogs = logs.filter(l => l.timestamp >= startOfMonth && l.timestamp < endOfMonth);
        const totalMinutes = monthlyLogs.reduce((acc, l) => acc + l.durationMinutes, 0);
        return {
          label: new Date(now.getFullYear(), i, 1).toLocaleDateString('fr-FR', { month: 'short' }),
          value: parseFloat((totalMinutes / 60).toFixed(1))
        };
      });
    }
  }, [logs, historyView]);

  const todaysLogs = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return logs.filter(log => log.timestamp >= startOfToday.getTime()).sort((a, b) => b.timestamp - a.timestamp);
  }, [logs]);

  const getSummaryString = () => {
    const now = new Date();
    const summary = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      const startOfDay = new Date(d).setHours(0, 0, 0, 0);
      const endOfDay = new Date(d).setHours(23, 59, 59, 999);
      const dailyLogs = logs.filter(l => l.timestamp >= startOfDay && l.timestamp <= endOfDay);
      const duration = dailyLogs.reduce((acc, l) => acc + l.durationMinutes, 0);
      return `${d.toLocaleDateString('fr-FR')}: ${(duration / 60).toFixed(1)}h`;
    }).join('\n');
    return summary;
  };

  const handleInsights = () => {
    if (!isProMember) {
      onUpgradeClick();
      return;
    }
    setIsInsightsOpen(true);
  };

  const qualityColors = {
    bad: 'bg-red-500/10 text-red-400 border-red-500/20',
    average: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    good: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    excellent: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  };

  const currentDurationMinutes = calculateDuration(startTime, endTime);
  const currentDurationH = Math.floor(currentDurationMinutes / 60);
  const currentDurationM = currentDurationMinutes % 60;

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-2xl shadow-sm p-6 border border-slate-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
          <IconMoon className="w-6 h-6 text-indigo-500" />
          {t('sleepTracker.title')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">{t('sleepTracker.bedtime')}</label>
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full px-4 py-2 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-800 text-white fill-current" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">{t('sleepTracker.waketime')}</label>
            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full px-4 py-2 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-800 text-white" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">{t('sleepTracker.quality')}</label>
            <select value={quality} onChange={e => setQuality(e.target.value as SleepLog['quality'])} className="w-full px-4 py-2 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-800 text-white">
              <option value="bad">{t('sleepTracker.qualityOptions.bad')}</option>
              <option value="average">{t('sleepTracker.qualityOptions.average')}</option>
              <option value="good">{t('sleepTracker.qualityOptions.good')}</option>
              <option value="excellent">{t('sleepTracker.qualityOptions.excellent')}</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20 gap-4">
          <div className="text-indigo-300">
            <span className="text-sm font-medium">{t('sleepTracker.totalHours')}: </span>
            <span className="text-2xl font-bold ml-2 text-indigo-100">
              {currentDurationH}h {currentDurationM > 0 ? `${currentDurationM}min` : ''}
            </span>
          </div>
          <button onClick={handleAdd} className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2">
            <IconPlus className="w-5 h-5" /> {t('sleepTracker.addButton')}
          </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl shadow-sm p-6 border border-slate-800">
        <h3 className="text-lg font-semibold text-white mb-4">{t('sleepTracker.historyTitle')}</h3>
        {todaysLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500 bg-slate-800/50 rounded-2xl border border-slate-800 border-dashed">
            <IconMoon className="w-10 h-10 mb-2 opacity-20" />
            <p>{t('sleepTracker.noEntries')}</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {todaysLogs.map((log) => {
              const h = Math.floor(log.durationMinutes / 60);
              const m = log.durationMinutes % 60;
              return (
                <div key={log.id} className="flex items-center justify-between p-3 bg-slate-800 border border-slate-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <IconMoon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{t('sleepTracker.duration', { hours: h, minutes: String(m).padStart(2, '0') })}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(log.timestamp).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })} &middot; {log.startTime} - {log.endTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs font-bold rounded uppercase border ${qualityColors[log.quality]}`}>
                      {t(`sleepTracker.qualityOptions.${log.quality}`)}
                    </span>
                    <button onClick={() => onDelete(log.id)} className="text-slate-500 hover:text-red-400 p-2">
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-slate-900 rounded-2xl shadow-sm p-6 border border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <IconChartBar className="w-6 h-6 text-brand-500" />
            {t('common.history')}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleInsights}
              className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-brand-600 to-purple-600 text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
            >
              {isProMember ? <IconSparkles className="w-3 h-3" /> : <IconLock className="w-3 h-3" />}
              {t('common.analyze')}
            </button>
            <div className="bg-slate-800 p-1 rounded-lg flex text-xs">
              {(['week', 'month', 'year'] as const).map(view => (
                <button
                  key={view}
                  onClick={() => setHistoryView(view)}
                  className={`px-3 py-1 rounded-md transition-colors ${historyView === view ? 'bg-slate-700 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {t(`common.${view}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={historyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                interval={historyView === 'month' ? 4 : 0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #1e293b', backgroundColor: '#0f172a', color: '#fff' }}
                cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                formatter={(value: number) => [`${value} h`, 'Sommeil']}
              />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <AIInsightsModal
        isOpen={isInsightsOpen}
        onClose={() => setIsInsightsOpen(false)}
        type="sleep"
        dataSummary={getSummaryString()}
      />
    </div>
  );
};

export default SleepTracker;
