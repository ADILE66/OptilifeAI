import React, { useState, useMemo } from 'react';
import { SleepLog, UserGoals } from '../types';
import { IconMoon, IconPlus, IconTrash, IconChartBar, IconSparkles, IconLock, IconCheckCircle, IconX } from '../ui/Icons';
import { useTranslation } from '../i18n/i18n';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AIInsightsModal from '../components/AIInsightsModal';

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
        if (durationMinutes === 0) return;
        onAdd({ startTime, endTime, durationMinutes, quality });
    };

    const historyData = useMemo(() => {
        const now = new Date(); now.setHours(0, 0, 0, 0);
        const labelsCount = historyView === 'week' ? 7 : (historyView === 'month' ? 30 : 12);

        return Array.from({ length: labelsCount }, (_, i) => {
            const d = new Date(now);
            if (historyView === 'week') d.setDate(d.getDate() - (6 - i));
            else if (historyView === 'month') d.setDate(d.getDate() - ((labelsCount - 1) - i));
            else d.setMonth(d.getMonth() - (11 - i));

            const start = d.getTime();
            const end = start + (historyView === 'year' ? 86400000 * 30 : 86400000);
            const dailyLogs = logs.filter(l => l.timestamp >= start && l.timestamp < end);
            const totalMinutes = dailyLogs.reduce((acc, l) => acc + l.durationMinutes, 0);

            return {
                label: historyView === 'year' ? d.toLocaleDateString('fr-FR', { month: 'short' }) : d.toLocaleDateString('fr-FR', { weekday: 'short' }),
                value: parseFloat((totalMinutes / 60).toFixed(1))
            };
        });
    }, [logs, historyView]);

    const todaysLogs = useMemo(() => {
        const start = new Date().setHours(0, 0, 0, 0);
        return logs.filter(log => log.timestamp >= start).sort((a, b) => b.timestamp - a.timestamp);
    }, [logs]);

    const lastSleep = todaysLogs[0] || logs.sort((a, b) => b.timestamp - a.timestamp)[0];
    const totalTodayH = lastSleep ? (lastSleep.durationMinutes / 60).toFixed(1) : "0";

    const qualityColors = {
        bad: 'bg-red-500/10 text-red-500 border-red-500/20',
        average: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
        good: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
        excellent: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    };

    return (
        <div className="space-y-6">
            {/* Sleep Status Board */}
            <div className="bg-slate-900 rounded-[2.5rem] border border-white/5 p-8 shadow-2xl relative overflow-hidden group">
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center">
                                <IconMoon className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white italic uppercase tracking-tight italic">RECOVERY LAB</h2>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('common.today')}</p>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2 mb-6">
                            <span className="text-6xl font-black text-white italic leading-none">{totalTodayH}</span>
                            <span className="text-xl font-bold text-slate-500 uppercase italic">/ {goals.sleepHours} h</span>
                        </div>
                        <div className="h-6 bg-slate-800 rounded-full overflow-hidden border border-white/5 p-1.5 max-w-md">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                                style={{ width: `${Math.min(100, (parseFloat(totalTodayH) / (goals.sleepHours || 8)) * 100)}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-black/20 rounded-[2rem] p-8 border border-white/5 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">COUCHER</label>
                                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-slate-800 border border-white/5 text-white p-3 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500 transition-all shadow-inner" />
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">RÉVEIL</label>
                                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-slate-800 border border-white/5 text-white p-3 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500 transition-all shadow-inner" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {(['bad', 'average', 'good', 'excellent'] as const).map(q => (
                                <button key={q} onClick={() => setQuality(q)} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${quality === q ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-800 border-white/5 text-slate-500 hover:text-white'}`}>
                                    {t(`sleepTracker.qualityOptions.${q}`).slice(0, 4)}
                                </button>
                            ))}
                        </div>
                        <button onClick={handleAdd} className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-brand-500 hover:text-white transition-all text-xs uppercase tracking-widest shadow-xl active:scale-95 flex items-center justify-center gap-3">
                            <IconPlus className="w-5 h-5" /> AJOUTER LA NUIT
                        </button>
                    </div>
                </div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full group-hover:bg-indigo-500/10 transition-colors" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] border border-white/5 p-8 shadow-2xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                                <IconChartBar className="w-5 h-5 text-brand-500" />
                                {t('common.history')}
                            </h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Stabilité des cycles circadiens</p>
                        </div>
                        <div className="flex items-center bg-slate-800 p-1.5 rounded-2xl border border-white/5">
                            {(['week', 'month', 'year'] as const).map(view => (
                                <button
                                    key={view}
                                    onClick={() => setHistoryView(view)}
                                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${historyView === view ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    {t(`common.${view}`)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={historyData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff03" />
                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '20px', border: '1px solid #ffffff10', backgroundColor: '#0f172a', color: '#fff' }}
                                    cursor={{ fill: '#ffffff05' }}
                                    formatter={(value: number) => [`${value} h`, 'Sommeil']}
                                />
                                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-[2.5rem] border border-white/5 p-8 shadow-2xl flex flex-col">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">{t('sleepTracker.historyTitle')}</h3>
                    <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
                        {todaysLogs.length === 0 ? (
                            <div className="text-center py-12">
                                <IconMoon className="w-8 h-8 text-slate-800 mx-auto mb-3" />
                                <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">AUCUNE NUIT</p>
                            </div>
                        ) : (
                            todaysLogs.map((log) => (
                                <div key={log.id} className="group/item flex gap-4 p-4 bg-slate-800/30 border border-white/5 rounded-2xl hover:bg-slate-800/50 transition-all">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                                        <IconMoon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-xs font-black text-white italic uppercase tracking-tight">{(log.durationMinutes / 60).toFixed(1)}H</h4>
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${qualityColors[log.quality]}`}>{log.quality}</span>
                                            </div>
                                            <button onClick={() => onDelete(log.id)} className="opacity-0 group-hover/item:opacity-100 text-slate-600 hover:text-red-500 transition-all ml-2">
                                                <IconTrash className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">{log.startTime} - {log.endTime} &middot; {new Date(log.timestamp).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <button onClick={() => setIsInsightsOpen(true)} className="mt-8 w-full py-4 bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-600/20 active:scale-95 flex items-center justify-center gap-2">
                        <IconSparkles className="w-4 h-4" /> BIO-RHYTHM ANALYSIS
                    </button>
                </div>
            </div>

            <AIInsightsModal
                isOpen={isInsightsOpen}
                onClose={() => setIsInsightsOpen(false)}
                type="sleep"
                dataSummary={logs.slice(0, 7).map(l => `${(l.durationMinutes / 60).toFixed(1)}h (${l.quality})`).join(', ')}
            />
        </div>
    );
};

export default SleepTracker;
