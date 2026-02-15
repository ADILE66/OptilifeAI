import React, { useState, useEffect } from 'react';
import { IconActivity, IconX, IconCheckCircle, IconFire, IconSparkles } from '../ui/Icons';
import { useTranslation } from '../i18n/i18n';

const ActivityTracker = ({ logs = [], onAdd, onDelete, isProMember, onUpgradeClick }: any) => {
    const { t } = useTranslation();
    const [mode, setMode] = useState<'manual' | 'live'>('manual');
    const [name, setName] = useState('');
    const [duration, setDuration] = useState('');
    const [calories, setCalories] = useState('');

    const handleAddManual = () => {
        if (!name || !duration || !calories) return;
        onAdd({
            activityName: name,
            durationMinutes: parseInt(duration),
            caloriesBurned: parseInt(calories)
        });
        setName('');
        setDuration('');
        setCalories('');
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Mode Toggle */}
            <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-white/5 w-full max-w-sm mx-auto">
                <button
                    onClick={() => setMode('manual')}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${mode === 'manual' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    {t('activityTracker.manualMode')}
                </button>
                <button
                    onClick={() => setMode('live')}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${mode === 'live' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <div className={`w-2 h-2 rounded-full ${mode === 'live' ? 'bg-white animate-pulse' : 'bg-slate-700'}`} />
                    {t('activityTracker.liveMode')}
                </button>
            </div>

            {mode === 'manual' ? (
                <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] shadow-xl space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">{t('activityTracker.manualNamePlaceholder')}</label>
                            <input
                                value={name} onChange={e => setName(e.target.value)}
                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                placeholder="Marche, Yoga, Musculation..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Min</label>
                                <input
                                    type="number" value={duration} onChange={e => setDuration(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Kcal</label>
                                <input
                                    type="number" value={calories} onChange={e => setCalories(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleAddManual}
                        disabled={!name || !duration || !calories}
                        className="w-full py-5 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl transition-all disabled:opacity-50"
                    >
                        {t('activityTracker.addButton')}
                    </button>
                </div>
            ) : (
                <div className="bg-slate-900 border border-white/5 p-12 rounded-[2.5rem] shadow-xl text-center space-y-8">
                    {!isProMember ? (
                        <div className="space-y-6 py-8">
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center text-emerald-500 mx-auto">
                                <IconSparkles className="w-10 h-10" />
                            </div>
                            <div className="max-w-xs mx-auto space-y-2">
                                <h3 className="text-2xl font-black text-white">{t('common.proFeature')}</h3>
                                <p className="text-slate-500 font-medium text-sm leading-relaxed">{t('activityTracker.proLockMessage')}</p>
                            </div>
                            <button
                                onClick={onUpgradeClick}
                                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 transition-all uppercase tracking-wider text-sm"
                            >
                                {t('dashboard.proFeatureButton')}
                            </button>
                        </div>
                    ) : (
                        <div className="py-12 flex flex-col items-center">
                            <div className="w-48 h-48 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 flex flex-col items-center justify-center animate-spin-slow">
                                <span className="text-4xl font-black text-white italic">GO</span>
                            </div>
                            <p className="mt-8 text-slate-500 font-bold uppercase tracking-[0.2em] animate-pulse">Prêt pour le GPS Live...</p>
                        </div>
                    )}
                </div>
            )}

            {/* History */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-4">{t('activityTracker.historyTitle')}</h3>
                {logs.length === 0 ? (
                    <div className="bg-slate-900/50 border border-dashed border-slate-800 p-16 rounded-[2.5rem] text-center">
                        <IconActivity className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold">{t('activityTracker.noActivity')}</p>
                    </div>
                ) : (
                    logs.map((log: any) => (
                        <div key={log.id} className="bg-slate-900 border border-white/5 p-6 rounded-3xl flex justify-between items-center group hover:border-emerald-500/30 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                                    <IconActivity className="w-7 h-7" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg capitalize">{log.activityName}</h4>
                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mt-1">
                                        <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                        <span>{log.durationMinutes} min</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <span className="text-2xl font-black text-white">{log.caloriesBurned}</span>
                                    <span className="text-[10px] font-bold text-slate-500 ml-1 uppercase">kcal</span>
                                </div>
                                <button onClick={() => onDelete(log.id)} className="p-3 text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                    <IconX className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ActivityTracker;
