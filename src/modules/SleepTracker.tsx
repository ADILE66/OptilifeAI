import React, { useState } from 'react';
import { IconMoon, IconX, IconCheckCircle, IconStar } from '../ui/Icons';
import { useTranslation } from '../i18n/i18n';

const SleepTracker = ({ logs = [], onAdd, onDelete }: any) => {
    const { t } = useTranslation();
    const [bedtime, setBedtime] = useState('');
    const [waketime, setWaketime] = useState('');
    const [quality, setQuality] = useState<'bad' | 'average' | 'good' | 'excellent'>('good');

    const handleAdd = () => {
        if (!bedtime || !waketime) return;

        // Calcul simple durée (min)
        const start = new Date(`2000-01-01T${bedtime}`);
        let end = new Date(`2000-01-01T${waketime}`);
        if (end < start) end = new Date(`2000-01-02T${waketime}`);

        const diff = (end.getTime() - start.getTime()) / (1000 * 60);

        onAdd({
            startTime: bedtime,
            endTime: waketime,
            durationMinutes: diff,
            quality: quality,
            timestamp: Date.now()
        });

        setBedtime('');
        setWaketime('');
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] shadow-xl">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
                        <IconMoon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white">{t('sleepTracker.title')}</h2>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Optimisation du repos</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">{t('sleepTracker.bedtime')}</label>
                        <input type="time" value={bedtime} onChange={e => setBedtime(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">{t('sleepTracker.waketime')}</label>
                        <input type="time" value={waketime} onChange={e => setWaketime(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">{t('sleepTracker.quality')}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {(['bad', 'average', 'good', 'excellent'] as const).map(q => (
                            <button
                                key={q}
                                onClick={() => setQuality(q)}
                                className={`py-4 rounded-xl font-bold text-xs uppercase tracking-tighter transition-all ${quality === q ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}
                            >
                                {t(`sleepTracker.qualityOptions.${q}`)}
                            </button>
                        ))}
                    </div>
                </div>

                <button onClick={handleAdd} disabled={!bedtime || !waketime} className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-2xl shadow-xl shadow-purple-500/20 transition-all disabled:opacity-50 uppercase tracking-widest text-sm">
                    {t('sleepTracker.addButton')}
                </button>
            </div>

            <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-4">{t('sleepTracker.historyTitle')}</h3>
                {logs.length === 0 ? (
                    <div className="bg-slate-900/50 border border-dashed border-slate-800 p-16 rounded-[2.5rem] text-center">
                        <IconMoon className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold">{t('sleepTracker.noEntries')}</p>
                    </div>
                ) : (
                    logs.map((log: any) => (
                        <div key={log.id} className="bg-slate-900 border border-white/5 p-6 rounded-3xl flex justify-between items-center group hover:border-purple-500/30 transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${log.quality === 'excellent' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-purple-500/10 text-purple-500'}`}>
                                    <IconMoon className="w-7 h-7" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">{Math.floor(log.durationMinutes / 60)}h {log.durationMinutes % 60}m</h4>
                                    <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">{log.startTime} - {log.endTime}</p>
                                </div>
                            </div>
                            <button onClick={() => onDelete(log.id)} className="p-3 text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                <IconX className="w-5 h-5" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SleepTracker;
