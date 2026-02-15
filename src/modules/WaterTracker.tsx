import React, { useState, useEffect } from 'react';
import { IconWater, IconStar } from '../ui/Icons';

const WaterTracker = () => {
    const [ml, setMl] = useState(0);
    const goal = 2500;

    const addWater = (amount: number) => {
        setMl(prev => Math.min(prev + amount, 5000));
    };

    const percentage = Math.round((ml / goal) * 100);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-slate-900 border border-white/5 p-8 rounded-3xl shadow-xl flex flex-col items-center">
                <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={553} strokeDashoffset={553 - (553 * Math.min(ml, goal)) / goal} className="text-blue-500 transition-all duration-1000 ease-out" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-white">{ml}</span>
                        <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">ml / {goal}</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-12 w-full">
                    {[250, 500, 750].map(amount => (
                        <button
                            key={amount}
                            onClick={() => addWater(amount)}
                            className="bg-slate-800 hover:bg-blue-600/20 hover:border-blue-500/50 border border-transparent p-4 rounded-2xl transition-all group"
                        >
                            <IconWater className="w-6 h-6 mx-auto mb-2 text-blue-400 group-hover:scale-110 transition-transform" />
                            <span className="block text-sm font-bold text-white">+{amount}ml</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 p-6 rounded-3xl flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                    <IconStar className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-white">Conseil IA</h4>
                    <p className="text-sm text-blue-200/70 italic">"Boire un verre d'eau dès le réveil booste votre métabolisme de 24%."</p>
                </div>
            </div>
        </div>
    );
};

export default WaterTracker;
