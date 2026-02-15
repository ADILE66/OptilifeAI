import React, { useMemo, useState } from 'react';
import { WeightLog, UserGoals, UserProfile } from '../types';
import { IconActivity, IconPlus, IconTrash, IconChartBar, IconSparkles, IconLock, IconScale, IconTrendingUp, IconTrendingDown } from '../ui/Icons';
import { useTranslation } from '../i18n/i18n';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AIInsightsModal from '../components/AIInsightsModal';

interface WeightTrackerProps {
    logs: WeightLog[];
    onAdd: (weight: number) => void;
    onDelete: (id: string) => void;
    goals: UserGoals;
    profile: UserProfile;
    isProMember: boolean;
    onUpgradeClick: () => void;
}

const WeightTracker: React.FC<WeightTrackerProps> = ({ logs, onAdd, onDelete, goals, profile, isProMember, onUpgradeClick }) => {
    const { t } = useTranslation();
    const [weightInput, setWeightInput] = useState('');
    const [historyView, setHistoryView] = useState<'week' | 'month' | 'year'>('month');
    const [isInsightsOpen, setIsInsightsOpen] = useState(false);

    const sortedLogs = useMemo(() => [...logs].sort((a, b) => a.timestamp - b.timestamp), [logs]);
    const currentWeight = sortedLogs.length > 0 ? sortedLogs[sortedLogs.length - 1].weightKg : (profile.weightKg || 0);
    const startWeight = sortedLogs.length > 0 ? sortedLogs[0].weightKg : (profile.weightKg || 0);
    const weightDiff = currentWeight - startWeight;

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

            // Find the closest log before or at the end of this period
            const periodLogs = logs.filter(l => l.timestamp < end);
            const value = periodLogs.length > 0 ? periodLogs.sort((a, b) => b.timestamp - a.timestamp)[0].weightKg : null;

            return {
                label: historyView === 'year' ? d.toLocaleDateString('fr-FR', { month: 'short' }) : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
                value: value,
                goal: goals.weight
            };
        });
    }, [logs, historyView, goals.weight]);

    const handleAdd = () => {
        const val = parseFloat(weightInput);
        if (!isNaN(val) && val > 0) {
            onAdd(val);
            setWeightInput('');
        }
    };

    return (
        <div className="space-y-6">
            {/* Weight Status Board */}
            <div className="bg-slate-900 rounded-[2.5rem] border border-white/5 p-8 shadow-2xl relative overflow-hidden group">
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center">
                                <IconScale className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white italic uppercase tracking-tight italic">COMPOSITION CORPORELLE</h2>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">SUIVI BIOMÉTRIQUE</p>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-6xl font-black text-white italic leading-none">{currentWeight}</span>
                            <span className="text-xl font-bold text-slate-500 uppercase italic">kg</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-lg ${weightDiff <= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                {weightDiff <= 0 ? <IconTrendingDown className="w-3 h-3" /> : <IconTrendingUp className="w-3 h-3" />}
                                {Math.abs(weightDiff).toFixed(1)} KG DEPUIS LE DÉBUT
                            </div>
                            {goals.weight && (
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    OBJECTIF: {goals.weight} KG
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-black/20 rounded-[2rem] p-8 border border-white/5 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block ml-1">NOUVELLE MESURE (KG)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={weightInput}
                                onChange={e => setWeightInput(e.target.value)}
                                placeholder="00.0"
                                className="w-full bg-slate-800 border border-white/5 text-white p-4 rounded-2xl text-xl font-black focus:outline-none focus:border-brand-500 transition-all shadow-inner text-center italic"
                            />
                        </div>
                        <button onClick={handleAdd} className="w-full py-5 bg-white text-black font-black rounded-2xl hover:bg-brand-500 hover:text-white transition-all text-xs uppercase tracking-widest shadow-xl active:scale-95 flex items-center justify-center gap-3">
                            <IconPlus className="w-5 h-5" /> ENREGISTRER LE POIDS
                        </button>
                    </div>
                </div>
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full group-hover:bg-emerald-500/10 transition-colors" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] border border-white/5 p-8 shadow-2xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                                <IconChartBar className="w-5 h-5 text-brand-500" />
                                {t('common.history')}
                            </h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Analyse de la masse corporelle</p>
                        </div>
                        <div className="flex items-center bg-slate-800 p-1.5 rounded-2xl border border-white/5">
                            {(['week', 'month', 'year'] as const).map(view => (
                                <button
                                    key={view}
                                    onClick={() => setHistoryView(view)}
                                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${historyView === view ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    {t(`common.${view}`)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={historyData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff03" />
                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} />
                                <YAxis domain={['dataMin - 5', 'dataMax + 5']} axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '20px', border: '1px solid #ffffff10', backgroundColor: '#0f172a', color: '#fff' }}
                                    cursor={{ stroke: '#10b981', strokeWidth: 2 }}
                                    formatter={(value: number) => [`${value} kg`, 'Poids']}
                                />
                                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorWeight)" connectNulls />
                                {goals.weight && <Area type="monotone" dataKey="goal" stroke="#ffffff10" strokeDasharray="5 5" fill="transparent" />}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-[2.5rem] border border-white/5 p-8 shadow-2xl flex flex-col">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">HISTORIQUE DES MESURES</h3>
                    <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
                        {logs.length === 0 ? (
                            <div className="text-center py-12">
                                <IconScale className="w-8 h-8 text-slate-800 mx-auto mb-3" />
                                <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">AUCUNE MESURE</p>
                            </div>
                        ) : (
                            [...logs].sort((a, b) => b.timestamp - a.timestamp).map((log) => (
                                <div key={log.id} className="group/item flex gap-4 p-4 bg-slate-800/30 border border-white/5 rounded-2xl hover:bg-slate-800/50 transition-all">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                                        <IconScale className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-xs font-black text-white italic uppercase tracking-tight">{log.weightKg} KG</h4>
                                            <button onClick={() => onDelete(log.id)} className="opacity-0 group-hover/item:opacity-100 text-slate-600 hover:text-red-500 transition-all ml-2">
                                                <IconTrash className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">{new Date(log.timestamp).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <button onClick={() => setIsInsightsOpen(true)} className="mt-8 w-full py-4 bg-gradient-to-r from-brand-600 to-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-600/20 active:scale-95 flex items-center justify-center gap-2">
                        <IconSparkles className="w-4 h-4" /> COMPOSITION ANALYSIS
                    </button>
                </div>
            </div>

            <AIInsightsModal
                isOpen={isInsightsOpen}
                onClose={() => setIsInsightsOpen(false)}
                type="weight"
                dataSummary={logs.slice(-5).map(l => `${l.weightKg}kg`).join(', ')}
            />
        </div>
    );
};

export default WeightTracker;
