import React, { useState, useMemo } from 'react';
import { WaterLog } from '../types';
import { IconPlus, IconWater, IconTrash, IconMic, IconLock, IconChartBar, IconSparkles } from './Icons';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useTranslation } from '../i18n/i18n';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AIInsightsModal from './AIInsightsModal';

interface WaterTrackerProps {
  logs: WaterLog[];
  onAdd: (amount: number) => void;
  onDelete: (id: string) => void;
  isProMember: boolean;
  onUpgradeClick: () => void;
}

const WaterTracker: React.FC<WaterTrackerProps> = ({ logs, onAdd, onDelete, isProMember, onUpgradeClick }) => {
  const [customAmount, setCustomAmount] = useState<string>('');
  const [historyView, setHistoryView] = useState<'week' | 'month' | 'year'>('week');
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const { t } = useTranslation();

  const total = logs.reduce((acc, log) => acc + log.amountMl, 0);
  const goal = 2500;
  const percentage = Math.min(100, Math.max(0, (total / goal) * 100));

  const handleVoiceResult = (transcript: string) => {
    const numbers = transcript.match(/\d+/);
    if (numbers && numbers[0]) {
      const amount = parseInt(numbers[0], 10);
      if (!isNaN(amount) && amount > 0) {
        onAdd(amount);
      }
    }
  };

  const { isListening, startListening, hasSupport } = useVoiceRecognition({
    onResult: handleVoiceResult,
    lang: 'fr-FR'
  });

  const handleVoiceClick = () => {
    if (!isProMember) {
      onUpgradeClick();
      return;
    }
    startListening();
  }

  const handleCustomAdd = () => {
    const amount = parseInt(customAmount);
    if (!isNaN(amount) && amount > 0) {
      onAdd(amount);
      setCustomAmount('');
    }
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
        return {
          label: day.toLocaleDateString('fr-FR', { weekday: 'short' }),
          value: dailyLogs.reduce((acc, l) => acc + l.amountMl, 0)
        };
      });
    } else if (historyView === 'month') {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => {
        const dayNum = i + 1;
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), dayNum).getTime();
        const endOfDay = startOfDay + 86400000;
        const dailyLogs = logs.filter(l => l.timestamp >= startOfDay && l.timestamp < endOfDay);
        return {
          label: String(dayNum),
          value: dailyLogs.reduce((acc, l) => acc + l.amountMl, 0)
        };
      });
    } else {
      return Array.from({ length: 12 }, (_, i) => {
        const startOfMonth = new Date(now.getFullYear(), i, 1).getTime();
        const endOfMonth = new Date(now.getFullYear(), i + 1, 0).getTime() + 86400000;
        const monthlyLogs = logs.filter(l => l.timestamp >= startOfMonth && l.timestamp < endOfMonth);
        return {
          label: new Date(now.getFullYear(), i, 1).toLocaleDateString('fr-FR', { month: 'short' }),
          value: monthlyLogs.reduce((acc, l) => acc + l.amountMl, 0)
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
    // Generate a summary string of the last 7 days for the AI
    const now = new Date();
    const summary = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      const startOfDay = new Date(d).setHours(0, 0, 0, 0);
      const endOfDay = new Date(d).setHours(23, 59, 59, 999);
      const dailyTotal = logs
        .filter(l => l.timestamp >= startOfDay && l.timestamp <= endOfDay)
        .reduce((acc, l) => acc + l.amountMl, 0);
      return `${d.toLocaleDateString('fr-FR')}: ${dailyTotal}ml`;
    }).join('\n');
    return summary;
  };

  const handleAnalyze = () => {
    if (!isProMember) {
      onUpgradeClick();
      return;
    }
    setIsInsightsOpen(true);
  };


  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-2xl shadow-sm p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <IconWater className="w-6 h-6 text-brand-500" />
            {t('waterTracker.title')}
          </h2>
          <span className="text-2xl font-bold text-brand-600">{total} <span className="text-sm font-normal text-slate-400">{t('waterTracker.goal', { goal })}</span></span>
        </div>

        <div className="relative h-6 bg-slate-700 rounded-full overflow-hidden mb-6">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[100, 250, 500, 1000].map((amt) => (
            <button
              key={amt}
              onClick={() => onAdd(amt)}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-700 hover:border-brand-500 hover:bg-brand-500/10 transition-colors"
            >
              <span className="text-lg font-bold text-slate-300">+{amt}</span>
              <span className="text-xs text-slate-400">ml</span>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="number"
            placeholder={t('waterTracker.placeholder')}
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-500"
          />
          <button
            onClick={handleCustomAdd}
            className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-500 transition-colors"
            aria-label={t('waterTracker.add')}
          >
            <IconPlus className="w-6 h-6" />
          </button>
          {hasSupport && (
            <button
              onClick={handleVoiceClick}
              disabled={isListening}
              className={`px-4 py-2 rounded-lg transition-colors relative ${isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              title={t('waterTracker.addByVoice')}
            >
              {isProMember ? <IconMic className="w-6 h-6" /> : <IconLock className="w-6 h-6" />}
            </button>
          )}
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl shadow-sm p-6 border border-slate-800">
        <h3 className="text-lg font-semibold text-slate-300 mb-4">{t('waterTracker.historyTitle')}</h3>
        {todaysLogs.length === 0 ? (
          <p className="text-slate-500 text-center py-4">{t('waterTracker.noEntries')}</p>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {todaysLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500">
                    <IconWater className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-200">{log.amountMl} ml</p>
                    <p className="text-xs text-slate-400">
                      {new Date(log.timestamp).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })} {new Date(log.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <button onClick={() => onDelete(log.id)} className="text-slate-400 hover:text-red-400 p-2">
                  <IconTrash className="w-4 h-4" />
                </button>
              </div>
            ))}
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
              onClick={handleAnalyze}
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
                cursor={{ fill: 'rgba(14, 165, 233, 0.1)' }}
                formatter={(value: number) => [`${value} ml`, 'Eau']}
              />
              <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <AIInsightsModal
        isOpen={isInsightsOpen}
        onClose={() => setIsInsightsOpen(false)}
        type="water"
        dataSummary={getSummaryString()}
      />
    </div>
  );
};

export default WaterTracker;
