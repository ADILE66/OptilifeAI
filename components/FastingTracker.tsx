import React, { useState, useEffect, useMemo } from 'react';
import { FastingLog } from '../types';
import { IconClock, IconLock, IconPlus, IconStar, IconTrash, IconChartBar, IconActivity, IconCheckCircle, IconFire, IconSparkles } from './Icons';
import { useTranslation } from '../i18n/i18n';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AIInsightsModal from './AIInsightsModal';

interface FastingTrackerProps {
    fastingLogs: FastingLog[];
    onStart: (goalHours: number) => void;
    onEnd: () => void;
    onAdd: (log: Omit<FastingLog, 'id'>) => void;
    onDelete: (id: string) => void;
    goalHours: number;
    isProMember: boolean;
    onUpgradeClick: () => void;
}

const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return { hours, minutes, seconds };
};

const FastingTracker: React.FC<FastingTrackerProps> = ({ fastingLogs, onStart, onEnd, onAdd, onDelete, goalHours, isProMember, onUpgradeClick }) => {
    const { t } = useTranslation();
    const [mode, setMode] = useState<'timer' | 'manual'>('timer');
    const [selectedPlan, setSelectedPlan] = useState(goalHours);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [historyView, setHistoryView] = useState<'week' | 'month' | 'year'>('week');
    const [isInsightsOpen, setIsInsightsOpen] = useState(false);

    const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
    const [manualStartTime, setManualStartTime] = useState('20:00');
    const [manualEndTime, setManualEndTime] = useState('12:00');

    const fastingPlans = useMemo(() => [
        {
            category: t('fastingTracker.planCategoryBeginner'),
            titleColor: 'text-emerald-600',
            plans: [{ hours: 12, name: '12:12' }, { hours: 14, name: '14:10' }],
        },
        {
            category: t('fastingTracker.planCategoryIntermediate'),
            titleColor: 'text-orange-600',
            plans: [{ hours: 16, name: '16:8' }, { hours: 18, name: '18:6' }],
        },
        {
            category: t('fastingTracker.planCategoryPro'),
            titleColor: 'text-purple-600',
            plans: [{ hours: 20, name: '20:4' }, { hours: 24, name: 'OMAD' }],
        },
    ], [t]);

    const activeFast = useMemo(() => fastingLogs.find(f => f.status === 'active'), [fastingLogs]);

    useEffect(() => {
        if (activeFast) {
            setElapsedTime(Date.now() - activeFast.startTime);
            const interval = setInterval(() => setElapsedTime(Date.now() - activeFast.startTime), 1000);
            return () => clearInterval(interval);
        } else setElapsedTime(0);
    }, [activeFast]);

    const handleStart = () => isProMember ? onStart(selectedPlan) : onUpgradeClick();
    const handleManualAdd = () => {
        if (!isProMember) return onUpgradeClick();
        const start = new Date(`${manualDate}T${manualStartTime}`);
        let end = new Date(`${manualDate}T${manualEndTime}`);
        if (end <= start) end.setDate(end.getDate() + 1);
        onAdd({ startTime: start.getTime(), endTime: end.getTime(), goalHours: Math.round((end.getTime() - start.getTime()) / 3600000), status: 'completed' });
    };

    const progress = activeFast ? Math.min(100, (elapsedTime / (activeFast.goalHours * 3600000)) * 100) : 0;
    const { hours, minutes, seconds } = formatTime(elapsedTime);
    const elapsedHours = elapsedTime / 3600000;

    const metabolicStages = [
        { start: 0, end: 4, nameKey: 'fastingTracker.stages.sugarRise', descKey: 'fastingTracker.stages.sugarRiseDesc' },
        { start: 4, end: 12, nameKey: 'fastingTracker.stages.gluconeogenesis', descKey: 'fastingTracker.stages.gluconeogenesisDesc' },
        { start: 12, end: 18, nameKey: 'fastingTracker.stages.ketosis', descKey: 'fastingTracker.stages.ketosisDesc', icon: IconFire },
        { start: 18, end: 24, nameKey: 'fastingTracker.stages.autophagy', descKey: 'fastingTracker.stages.autophagyDesc' },
    ];

    const historyData = useMemo(() => {
        const now = new Date(); now.setHours(0, 0, 0, 0);

        if (historyView === 'year') {
            return Array.from({ length: 12 }, (_, i) => {
                const year = now.getFullYear();
                const startOfMonth = new Date(year, i, 1).getTime();
                const endOfMonth = new Date(year, i + 1, 0, 23, 59, 59, 999).getTime();
                const monthlyTotal = fastingLogs
                    .filter(l => l.status === 'completed' && l.endTime! >= startOfMonth && l.endTime! <= endOfMonth)
                    .reduce((acc, l) => acc + (l.endTime! - l.startTime) / 3600000, 0);
                return {
                    label: new Date(year, i, 1).toLocaleDateString('fr-FR', { month: 'short' }),
                    value: Math.round(monthlyTotal)
                };
            });
        }

        const labelsCount = historyView === 'week' ? 7 : 30;
        return Array.from({ length: labelsCount }, (_, i) => {
            const d = new Date(now);
            d.setDate(d.getDate() - ((labelsCount - 1) - i));
            const startOfDay = d.getTime();
            const endOfDay = startOfDay + 86400000;
            return {
                label: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
                value: fastingLogs.filter(l => l.status === 'completed' && l.endTime! >= startOfDay && l.endTime! < endOfDay).reduce((acc, l) => acc + (l.endTime! - l.startTime) / 3600000, 0)
            };
        });
    }, [fastingLogs, historyView]);

    return (
        <div className="space-y-6">
            {!isProMember ? (
                <div className="bg-slate-900 rounded-3xl shadow-sm p-8 border border-slate-800 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-slate-900 -z-10"></div>
                    <div className="relative z-10 max-w-md mx-auto">
                        <div className="w-20 h-20 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 mx-auto mb-6 border border-purple-500/20">
                            <IconClock className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">{t('fastingTracker.title')}</h2>
                        <p className="text-slate-400 mb-8 leading-relaxed">{t('fastingTracker.proFeatureDescription')}</p>
                        <div className="space-y-3 mb-8">
                            <div className="flex items-center gap-3 text-sm text-slate-300 bg-slate-800/50 p-3 rounded-xl border border-slate-700"><IconCheckCircle className="w-5 h-5 text-emerald-500" /> Plans personnalisables (16:8, 18:6, OMAD)</div>
                            <div className="flex items-center gap-3 text-sm text-slate-300 bg-slate-800/50 p-3 rounded-xl border border-slate-700"><IconCheckCircle className="w-5 h-5 text-emerald-500" /> Suivi métabolique en temps réel</div>
                            <div className="flex items-center gap-3 text-sm text-slate-300 bg-slate-800/50 p-3 rounded-xl border border-slate-700"><IconCheckCircle className="w-5 h-5 text-emerald-500" /> Statistiques d'autophagie et de cétose</div>
                        </div>
                        <button onClick={onUpgradeClick} className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-500 transition-all shadow-xl shadow-brand-900/20">
                            <IconStar className="w-5 h-5 text-yellow-400" fill="currentColor" /> {t('fastingTracker.proFeatureButton')}
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="bg-slate-900 rounded-2xl shadow-sm p-6 border border-slate-800 animate-in fade-in">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4"><IconClock className="w-6 h-6 text-purple-500" />{t('fastingTracker.title')}</h2>
                        <div className="bg-slate-800 p-1 rounded-lg flex items-center text-sm w-full mb-6">
                            <button onClick={() => setMode('timer')} className={`w-1/2 py-2 rounded-md transition-colors font-semibold ${mode === 'timer' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>{t('activityTracker.liveMode')}</button>
                            <button onClick={() => setMode('manual')} className={`w-1/2 py-2 rounded-md transition-colors font-semibold ${mode === 'manual' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>{t('activityTracker.manualMode')}</button>
                        </div>

                        {mode === 'timer' ? (
                            activeFast ? (
                                <div className="text-center py-4">
                                    <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
                                        <svg className="absolute w-full h-full" viewBox="0 0 100 100"><circle className="text-slate-800" strokeWidth="6" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" /><circle className="text-purple-500" strokeWidth="6" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" style={{ strokeDasharray: 283, strokeDashoffset: 283 - (progress / 100) * 283, transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.5s' }} /></svg>
                                        <div className="relative"><p className="text-4xl font-bold tracking-tighter text-white">{hours}:{minutes}:{seconds}</p><p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Jeûne Actif</p></div>
                                    </div>
                                    <button onClick={onEnd} className="w-full max-w-xs py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-900/20">{t('fastingTracker.endButton')}</button>
                                    <div className="mt-10 border-t border-slate-800 pt-8 text-left"><h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2"><IconActivity className="w-4 h-4" /> {t('fastingTracker.metabolicTitle')}</h3><div className="space-y-4">{metabolicStages.map((s, i) => { const isAct = elapsedHours >= s.start && (elapsedHours < s.end || !s.end); const isPass = elapsedHours >= s.end; return <div key={i} className={`flex gap-4 p-3 rounded-xl border transition-all ${isAct ? 'bg-purple-500/10 border-purple-500/20 scale-105' : isPass ? 'opacity-50 grayscale border-slate-800' : 'opacity-30 border-slate-800'}`}><div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isAct ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'}`}>{isPass ? <IconCheckCircle className="w-4 h-4" /> : <IconActivity className="w-4 h-4" />}</div><div><p className="font-bold text-sm text-white">{t(s.nameKey)}</p><p className="text-xs text-slate-400">{t(s.descKey)}</p></div></div>; })}</div></div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4">{fastingPlans.map((cat) => <div key={cat.category}><p className={`text-xs font-bold uppercase tracking-wider mb-3 ${cat.titleColor}`}>{cat.category}</p><div className="grid grid-cols-2 gap-3">{cat.plans.map(p => <button key={p.hours} onClick={() => setSelectedPlan(p.hours)} className={`p-4 rounded-xl border transition-all text-center ${selectedPlan === p.hours ? 'border-purple-500 bg-purple-500/10' : 'border-slate-800 bg-slate-800 hover:bg-slate-700'}`}><p className="font-bold text-lg text-white">{p.name}</p><p className="text-xs text-slate-400">{p.hours}h</p></button>)}</div></div>)}</div>
                                    <button onClick={handleStart} className="w-full py-4 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-500 transition-all shadow-lg">{t('fastingTracker.startButton', { hours: selectedPlan })}</button>
                                </div>
                            )
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1"><label className="text-xs font-bold text-slate-400 uppercase">Date</label><input type="date" value={manualDate} onChange={e => setManualDate(e.target.value)} className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" /></div>
                                    <div className="space-y-1"><label className="text-xs font-bold text-slate-400 uppercase">Début</label><input type="time" value={manualStartTime} onChange={e => setManualStartTime(e.target.value)} className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" /></div>
                                    <div className="space-y-1"><label className="text-xs font-bold text-slate-400 uppercase">Fin</label><input type="time" value={manualEndTime} onChange={e => setManualEndTime(e.target.value)} className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" /></div>
                                </div>
                                <button onClick={handleManualAdd} className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-500 transition-all flex items-center justify-center gap-2"><IconPlus className="w-5 h-5" /> {t('fastingTracker.addLog')}</button>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-900 rounded-2xl shadow-sm p-6 border border-slate-800 animate-in slide-in-from-bottom-4">
                        <h3 className="text-lg font-bold text-white mb-4">{t('fastingTracker.historyTitle')}</h3>
                        {fastingLogs.filter(l => l.status === 'completed').length === 0 ? <p className="text-slate-500 text-center py-4">{t('fastingTracker.noFasts')}</p> : (
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                                {fastingLogs.filter(l => l.status === 'completed').sort((a, b) => b.endTime! - a.endTime!).map(log => (
                                    <div key={log.id} className="flex items-center justify-between p-3 bg-slate-800 border border-slate-700 rounded-lg">
                                        <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400"><IconClock className="w-4 h-4" /></div><div><p className="font-bold text-white">{((log.endTime! - log.startTime) / 3600000).toFixed(1)} heures</p><p className="text-xs text-slate-400">{new Date(log.endTime!).toLocaleDateString('fr-FR')} &middot; Goal: {log.goalHours}h</p></div></div>
                                        <button onClick={() => onDelete(log.id)} className="text-slate-500 hover:text-red-400 p-2"><IconTrash className="w-4 h-4" /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-900 rounded-2xl shadow-sm p-6 border border-slate-800">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2"><IconChartBar className="w-6 h-6 text-brand-500" />{t('common.history')}</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsInsightsOpen(true)} className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-brand-600 to-purple-600 text-white rounded-lg text-xs font-bold hover:opacity-90"><IconSparkles className="w-3 h-3" /> {t('common.analyze')}</button>
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
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #1e293b', backgroundColor: '#0f172a', color: '#fff' }}
                                        cursor={{ fill: 'rgba(168, 85, 247, 0.1)' }}
                                        formatter={(value: number) => [`${value} h`, historyView === 'year' ? 'Total heures' : 'Durée']}
                                    />
                                    <Bar dataKey="value" fill="#a855f7" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}
            <AIInsightsModal isOpen={isInsightsOpen} onClose={() => setIsInsightsOpen(false)} type="fasting" dataSummary={fastingLogs.slice(0, 5).map(l => `${((l.endTime! - l.startTime) / 3600000).toFixed(1)}h`).join(', ')} />
        </div>
    );
};

export default FastingTracker;