import React, { useState, useMemo } from 'react';
import { WaterLog } from '../types';
import { IconPlus, IconWater, IconTrash, IconChartBar, IconSparkles, IconLock, IconMic, IconStar } from '../ui/Icons';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useTranslation } from '../i18n/i18n';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AIInsightsModal from '../components/AIInsightsModal';

interface WaterTrackerProps {
    logs: WaterLog[];
    onAdd: (amount: number) => void;
    onDelete: (id: string) => void;
    isProMember: boolean;
    onUpgradeClick: () => void;
    goal: number;
}

const WaterTracker: React.FC<WaterTrackerProps> = ({ logs, onAdd, onDelete, isProMember, onUpgradeClick, goal }) => {
    const [customAmount, setCustomAmount] = useState<string>('');
    const [historyView, setHistoryView] = useState<'week' | 'month' | 'year'>('week');
    const [isInsightsOpen, setIsInsightsOpen] = useState(false);
    const { t } = useTranslation();

    const todayStart = new Date().setHours(0, 0, 0, 0);
    const todayLogs = logs.filter(l => l.timestamp >= todayStart);
    const totalToday = todayLogs.reduce((acc, log) => acc + log.amountMl, 0);
    const percentage = Math.min(100, Math.max(0, (totalToday / goal) * 100));

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

    const getSummaryString = () => {
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
            {/* Stats Today */}
            <div className="bg-slate-900 rounded-[2.5rem] border border-white/5 p-8 shadow-2xl overflow-hidden relative group">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
                                <IconWater className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">{t('waterTracker.title')}</h2>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('common.today')}</p>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-white italic">{totalToday}</span>
                            <span className="text-xl font-bold text-slate-500">/ {goal} ml</span>
                        </div>
                    </div>

                    <div className="flex-1 max-w-sm">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-xs font-black text-blue-400 uppercase tracking-widest">{percentage.toFixed(0)}% OXYGÉNATION</span>
                            <span className="text-[10px] font-bold text-slate-500">{totalToday >= goal ? 'OBJECTIF ATTEINT' : `${goal - totalToday}ml RESTANTS`}</span>
                        </div>
                        <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-white/5 p-1">
                            <div
                                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {[100, 250, 500].map(amt => (
                            <button key={amt} onClick={() => onAdd(amt)} className="px-5 py-3 bg-slate-800 border border-white/5 rounded-2xl font-black text-white hover:bg-brand-500 hover:border-brand-500/50 transition-all text-xs active:scale-95 shadow-lg">
                                +{amt}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full group-hover:bg-blue-500/10 transition-colors" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] border border-white/5 p-8 shadow-2xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                                <IconChartBar className="w-5 h-5 text-brand-500" />
                                {t('common.history')}
                            </h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Analyse des cycles d'hydratation</p>
                        </div>
                        <div className="flex items-center bg-slate-800 p-1.5 rounded-2xl border border-white/5">
                            {(['week', 'month', 'year'] as const).map(view => (
                                <button
                                    key={view}
                                    onClick={() => setHistoryView(view)}
                                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${historyView === view ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
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
                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} interval={historyView === 'month' ? 4 : 0} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '20px', border: '1px solid #ffffff10', backgroundColor: '#0f172a', color: '#fff' }}
                                    cursor={{ fill: '#ffffff05' }}
                                    formatter={(value: number) => [`${value} ml`, 'Eau']}
                                />
                                <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="bg-slate-900 rounded-[2.5rem] border border-white/5 p-8 shadow-2xl h-full flex flex-col justify-between">
                        <div>
                            <div className="flex gap-2 mb-6">
                                <input
                                    type="number"
                                    placeholder="Quantité ml"
                                    value={customAmount}
                                    onChange={(e) => setCustomAmount(e.target.value)}
                                    className="flex-1 bg-slate-800 border border-white/5 text-white p-4 rounded-2xl text-xs font-bold focus:outline-none focus:border-brand-500 transition-all placeholder:text-slate-600 shadow-inner"
                                />
                                <button onClick={handleCustomAdd} className="w-14 bg-brand-600 text-white rounded-2xl hover:bg-brand-500 transition-all flex items-center justify-center shadow-lg shadow-brand-600/20 active:scale-95">
                                    <IconPlus className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="flex gap-3">
                                {hasSupport && (
                                    <button
                                        onClick={handleVoiceClick}
                                        className={`flex-1 p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isListening ? 'bg-red-500 border-red-500 text-white animate-pulse shadow-lg' : 'bg-slate-800 border-white/5 text-slate-400 hover:text-white hover:border-white/20'}`}
                                    >
                                        {isProMember ? <><IconMic className="w-4 h-4" /> VOCAL</> : <><IconLock className="w-4 h-4" /> PRO ONLY</>}
                                    </button>
                                )}
                                <button
                                    onClick={handleAnalyze}
                                    className="flex-1 p-4 bg-gradient-to-r from-brand-600 to-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-600/20 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <IconSparkles className="w-4 h-4" /> {t('common.analyze')}
                                </button>
                            </div>
                        </div>

                        <div className="mt-8">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">{t('waterTracker.historyTitle')}</p>
                            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                                {todayLogs.length === 0 ? (
                                    <p className="text-[10px] font-bold text-slate-600 italic">AUCUNE ENTRÉE AUJOURD'HUI</p>
                                ) : (
                                    todayLogs.map((log) => (
                                        <div key={log.id} className="flex items-center justify-between p-4 bg-slate-800/50 border border-white/5 rounded-2xl group/item">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                    <IconWater className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-white">{log.amountMl} ml</p>
                                                    <p className="text-[9px] font-bold text-slate-500">{new Date(log.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => onDelete(log.id)} className="opacity-0 group-hover/item:opacity-100 p-2 text-slate-600 hover:text-red-500 transition-all">
                                                <IconTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
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
