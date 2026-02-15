import React, { useState, useEffect, useMemo } from 'react';
import { FastingLog } from '../types';
import { IconClock, IconLock, IconPlus, IconStar, IconTrash, IconChartBar, IconActivity, IconCheckCircle, IconFire, IconSparkles, IconX } from '../ui/Icons';
import { useTranslation } from '../i18n/i18n';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AIInsightsModal from '../components/AIInsightsModal';

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
            titleColor: 'text-emerald-500',
            plans: [{ hours: 12, name: '12:12' }, { hours: 14, name: '14:10' }],
        },
        {
            category: t('fastingTracker.planCategoryIntermediate'),
            titleColor: 'text-orange-500',
            plans: [{ hours: 16, name: '16:8' }, { hours: 18, name: '18:6' }],
        },
        {
            category: t('fastingTracker.planCategoryPro'),
            titleColor: 'text-purple-500',
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

    const activeStage = [...metabolicStages].reverse().find(s => elapsedHours >= s.start);

    return (
        <div className="space-y-6">
            {!isProMember ? (
                <div className="bg-slate-900 rounded-[3rem] shadow-sm p-12 border border-white/5 text-center relative overflow-hidden flex flex-col items-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-slate-950 to-slate-950 -z-10 animate-gradient-slow"></div>
                    <div className="relative z-10 max-w-lg">
                        <div className="w-24 h-24 bg-purple-500/10 rounded-[2rem] flex items-center justify-center text-purple-400 mx-auto mb-8 border border-white/10 shadow-2xl">
                            <IconClock className="w-12 h-12" />
                        </div>
                        <h2 className="text-4xl font-black text-white mb-6 italic uppercase tracking-tight leading-none italic">{t('fastingTracker.title')}</h2>
                        <p className="text-slate-400 mb-10 font-bold uppercase tracking-widest text-[10px] leading-relaxed opacity-70 px-4">{t('fastingTracker.proFeatureDescription')}</p>

                        <div className="grid grid-cols-1 gap-3 mb-10 w-full">
                            {[
                                { text: "Plans personnalisables (16:8, 18:6, OMAD)", icon: IconCheckCircle },
                                { text: "Suivi métabolique en temps réel", icon: IconCheckCircle },
                                { text: "Statistiques d'autophagie et de cétose", icon: IconCheckCircle }
                            ].map((f, i) => (
                                <div key={i} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-300 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/5 text-left">
                                    <f.icon className="w-5 h-5 text-emerald-500 shrink-0" />
                                    {f.text}
                                </div>
                            ))}
                        </div>

                        <button onClick={onUpgradeClick} className="w-full py-5 bg-white text-black rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-brand-500 hover:text-white transition-all shadow-2xl shadow-brand-500/20 active:scale-95 group">
                            <IconStar className="w-5 h-5 text-amber-500 group-hover:text-white" fill="currentColor" /> {t('fastingTracker.proFeatureButton')}
                        </button>
                    </div>
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full" />
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500/5 blur-[120px] rounded-full" />
                </div>
            ) : (
                <>
                    {/* Active Fasting Status */}
                    <div className="bg-slate-900 rounded-[2.5rem] border border-white/5 p-8 shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center">
                                            <IconClock className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-white italic uppercase tracking-tight">{t('fastingTracker.title')}</h2>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                {activeFast ? `MODE PERSISTANCE ACTIVÉ (${activeFast.goalHours}h)` : 'PRÊT POUR LA SESSION'}
                                            </p>
                                        </div>
                                    </div>

                                    {activeFast ? (
                                        <div className="space-y-6">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-6xl font-black text-white italic leading-none tabular-nums">{hours}:{minutes}:{seconds}</span>
                                                <span className="text-xl font-bold text-slate-500 uppercase italic">ÉCOULE</span>
                                            </div>
                                            <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-white/5 p-1 max-w-md">
                                                <div
                                                    className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(147,51,234,0.4)]"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <div className="flex gap-4">
                                                <button onClick={onEnd} className="px-8 py-3 bg-red-500 text-white font-black rounded-2xl hover:bg-red-600 transition-all text-[10px] uppercase tracking-widest shadow-lg shadow-red-900/20 active:scale-95 flex items-center gap-2">
                                                    <IconX className="w-4 h-4" /> ARRÊTER LA SESSION
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="flex flex-wrap gap-2">
                                                {fastingPlans.map(cat => cat.plans.map(p => (
                                                    <button
                                                        key={p.hours}
                                                        onClick={() => setSelectedPlan(p.hours)}
                                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedPlan === p.hours ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}
                                                    >
                                                        {p.name}
                                                    </button>
                                                )))}
                                            </div>
                                            <button onClick={handleStart} className="w-full max-w-xs py-5 bg-white text-black font-black rounded-2xl hover:bg-brand-500 hover:text-white transition-all text-xs uppercase tracking-widest shadow-xl active:scale-95 flex items-center justify-center gap-3">
                                                <IconFire className="w-5 h-5" /> DÉMARRER LA SESSION
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {activeFast && activeStage && (
                                    <div className="w-full md:w-64 bg-black/30 backdrop-blur-xl rounded-[2rem] p-6 border border-white/5">
                                        <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 animation-pulse">
                                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span> ÉTAT MÉTABOLIQUE
                                        </p>
                                        <h4 className="text-xl font-black text-white italic uppercase tracking-tight mb-2 leading-tight">{t(activeStage.nameKey)}</h4>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed">{t(activeStage.descKey)}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full group-hover:bg-purple-500/10 transition-colors" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] border border-white/5 p-8 shadow-2xl">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                                        <IconChartBar className="w-5 h-5 text-brand-500" />
                                        {t('common.history')}
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Séquences de privation énergétique</p>
                                </div>
                                <div className="flex items-center bg-slate-800 p-1.5 rounded-2xl border border-white/5">
                                    {(['week', 'month', 'year'] as const).map(view => (
                                        <button
                                            key={view}
                                            onClick={() => setHistoryView(view)}
                                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${historyView === view ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
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
                                            formatter={(value: number) => [`${value} h`, historyView === 'year' ? 'Total heures' : 'Durée']}
                                        />
                                        <Bar dataKey="value" fill="#a855f7" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-[2.5rem] border border-white/5 p-8 shadow-2xl flex flex-col">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">{t('fastingTracker.historyTitle')}</h3>
                            <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
                                {fastingLogs.filter(l => l.status === 'completed').length === 0 ? (
                                    <div className="text-center py-12">
                                        <IconClock className="w-8 h-8 text-slate-800 mx-auto mb-3" />
                                        <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">AUCUN JEÛNE</p>
                                    </div>
                                ) : (
                                    fastingLogs.filter(l => l.status === 'completed').sort((a, b) => b.endTime! - a.endTime!).map(log => (
                                        <div key={log.id} className="flex items-center justify-between p-4 bg-slate-800/30 border border-white/5 rounded-2xl group/item">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                                    <IconClock className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-white italic tracking-tight">{((log.endTime! - log.startTime) / 3600000).toFixed(1)}H</p>
                                                    <p className="text-[9px] font-bold text-slate-500 uppercase">{new Date(log.endTime!).toLocaleDateString('fr-FR')}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => onDelete(log.id)} className="opacity-0 group-hover/item:opacity-100 p-2 text-slate-600 hover:text-red-500 transition-all">
                                                <IconTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                            <button onClick={() => setIsInsightsOpen(true)} className="mt-8 w-full py-4 bg-gradient-to-r from-brand-600 to-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-600/20 active:scale-95 flex items-center justify-center gap-2">
                                <IconSparkles className="w-4 h-4" /> RECOMMANDATIONS IA
                            </button>
                        </div>
                    </div>
                </>
            )}
            <AIInsightsModal
                isOpen={isInsightsOpen}
                onClose={() => setIsInsightsOpen(false)}
                type="fasting"
                dataSummary={fastingLogs.slice(0, 5).map(l => `${((l.endTime! - l.startTime) / 3600000).toFixed(1)}h`).join(', ')}
            />
        </div>
    );
};

export default FastingTracker;
