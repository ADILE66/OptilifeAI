import React, { useState } from 'react';
import { IconFire, IconSparkles } from '../ui/Icons';

const FoodTracker = () => {
    const [meals, setMeals] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        setLoading(true);
        // Simulation IA pour la démo stable
        setTimeout(() => {
            const newMeal = {
                id: Date.now(),
                name: input,
                cal: Math.floor(Math.random() * 500) + 200,
                time: new Date().toLocaleTimeString([], { hour: '2d', minute: '2d' })
            };
            setMeals([newMeal, ...meals]);
            setInput('');
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-slate-900 border border-white/5 p-8 rounded-3xl shadow-xl">
                <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                    <IconFire className="w-6 h-6 text-orange-500" />
                    Journal Alimentaire
                </h2>

                <div className="flex gap-4">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Qu'avez-vous mangé ? (ex: Salade César)"
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    />
                    <button
                        onClick={handleAnalyze}
                        disabled={!input || loading}
                        className="bg-orange-600 hover:bg-orange-500 text-white font-black px-8 rounded-2xl transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <><IconSparkles className="w-5 h-5" /> ANALYSER</>}
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Repas d'aujourd'hui</h3>
                {meals.length === 0 ? (
                    <div className="bg-slate-900/50 border border-dashed border-slate-800 p-12 rounded-3xl text-center text-slate-500 font-bold">
                        Aucun repas enregistré pour le moment.
                    </div>
                ) : (
                    meals.map(meal => (
                        <div key={meal.id} className="bg-slate-900 border border-white/5 p-6 rounded-2xl flex justify-between items-center group hover:border-orange-500/30 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
                                    <IconFire className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white capitalize">{meal.name}</h4>
                                    <p className="text-xs text-slate-500 font-bold">{meal.time}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xl font-black text-white">{meal.cal}</span>
                                <span className="text-xs font-bold text-slate-500 ml-1 uppercase">kcal</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FoodTracker;
