import React, { useState } from 'react';
import { IconActivity, IconFire } from '../ui/Icons';

const ActivityTracker = () => {
    const [activities, setActivities] = useState<any[]>([]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-slate-900 border border-white/5 p-8 rounded-3xl shadow-xl">
                <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                    <IconActivity className="w-6 h-6 text-emerald-500" />
                    Mouvement & Sport
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {['Marche', 'Course', 'Musculation', 'Yoga'].map(type => (
                        <button key={type} className="bg-slate-800 hover:bg-emerald-600/20 hover:border-emerald-500/50 border border-transparent p-6 rounded-2xl transition-all font-bold text-slate-300 hover:text-white">
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-slate-900 border border-white/5 p-8 rounded-3xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest text-white">Résumé hebdomadaire</h3>
                    <span className="text-emerald-500 text-xs font-black uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Actif</span>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-4xl font-black text-white">125</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Minutes cette semaine</p>
                    </div>
                    <div className="text-right">
                        <p className="text-4xl font-black text-white">2,450</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Kcal brûlées</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityTracker;
