import React, { useState, useEffect } from 'react';
import { IconClock } from '../ui/Icons';

const FastingTracker = () => {
    const [isFasting, setIsFasting] = useState(false);
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        let interval: any;
        if (isFasting) {
            interval = setInterval(() => setSeconds(s => s + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isFasting]);

    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-slate-900 border border-white/5 p-12 rounded-[3rem] shadow-xl flex flex-col items-center text-center">
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-8 transition-all duration-500 ${isFasting ? 'bg-purple-500 shadow-lg shadow-purple-500/20' : 'bg-slate-800 text-slate-500'}`}>
                    <IconClock className="w-12 h-12" />
                </div>

                <h2 className="text-3xl font-black text-white mb-2">{isFasting ? 'Jeûne en cours' : 'Prêt à jeûner ?'}</h2>
                <div className="text-5xl font-mono font-black text-white tracking-widest mb-12">
                    {formatTime(seconds)}
                </div>

                <div className="flex gap-4 w-full max-w-sm">
                    {isFasting ? (
                        <button
                            onClick={() => setIsFasting(false)}
                            className="flex-1 py-5 bg-red-600/10 border border-red-500/20 text-red-500 font-black rounded-2xl hover:bg-red-600 hover:text-white transition-all text-lg"
                        >
                            ARRÊTER
                        </button>
                    ) : (
                        <button
                            onClick={() => { setIsFasting(true); setSeconds(0); }}
                            className="flex-1 py-5 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-2xl shadow-xl shadow-purple-500/20 transition-all text-lg active:scale-95"
                        >
                            DÉMARRER LE JEÛNE (16h)
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Phase actuelle</h4>
                    <p className="text-white font-bold">Cétose (Brûlage de graisses)</p>
                    <div className="w-full h-1 bg-slate-800 mt-4 rounded-full overflow-hidden">
                        <div className="w-2/3 h-full bg-purple-500" />
                    </div>
                </div>
                <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Dernier jeûne</h4>
                    <p className="text-white font-bold">16h 32m - Hier</p>
                </div>
            </div>
        </div>
    );
};

export default FastingTracker;
