import React, { useState, useRef } from 'react';
import { IconFire, IconSparkles, IconCamera, IconX, IconCheckCircle } from '../ui/Icons';
import * as geminiService from '../services/geminiService';
import { useTranslation } from '../i18n/i18n';
import { FoodItem, FoodItemAnalysis } from '../types';

const FoodTracker = ({ logs = [], onAdd, onDelete, isProMember, onUpgradeClick }: any) => {
    const { t } = useTranslation();
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<FoodItemAnalysis[] | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAnalyze = async () => {
        if (!input && !loading) return;
        setLoading(true);
        try {
            const result = await geminiService.analyzeFoodInput(input);
            if (result && result.items) {
                setAnalysisResult(result.items);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = (reader.result as string).split(',')[1];
            try {
                const result = await geminiService.analyzeFoodInput("Analyze this image", base64);
                if (result && result.items) {
                    setAnalysisResult(result.items);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const confirmAdd = (items: FoodItemAnalysis[]) => {
        const foodLogs = items.map(item => ({
            name: item.name,
            portion: item.portion,
            macros: {
                calories: item.calories,
                protein: item.protein,
                carbs: item.carbs,
                fat: item.fat
            }
        }));
        onAdd(foodLogs);
        setAnalysisResult(null);
        setInput('');
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Input Section */}
            <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
                        <IconFire className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white">{t('foodTracker.title')}</h2>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">IA Intelligence Alimentaire</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('foodTracker.placeholderPro')}
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-3xl px-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all min-h-[120px] resize-none"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-4 right-4 p-3 bg-slate-700/50 hover:bg-slate-600 rounded-xl transition-all text-slate-300"
                        >
                            <IconCamera className="w-6 h-6" />
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={loading || (!input && !analysisResult)}
                        className="w-full py-5 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl shadow-xl shadow-orange-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <><IconSparkles className="w-6 h-6" /> {t('foodTracker.analyzeButton')}</>
                        )}
                    </button>
                </div>
            </div>

            {/* Analysis Modal/Result */}
            {analysisResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-white">{t('foodTracker.confirmModalTitle')}</h3>
                            <button onClick={() => setAnalysisResult(null)} className="text-slate-500 hover:text-white"><IconX className="w-6 h-6" /></button>
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {analysisResult.map((item, idx) => (
                                <div key={idx} className="bg-slate-800/50 p-5 rounded-2xl border border-white/5">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-bold text-white capitalize">{item.name}</h4>
                                        <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-1 rounded-lg">{item.portion}</span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        <div className="text-center bg-slate-700/30 p-2 rounded-xl">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase">Cal</p>
                                            <p className="text-sm font-black text-white">{item.calories}</p>
                                        </div>
                                        <div className="text-center bg-slate-700/30 p-2 rounded-xl">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase">Prot</p>
                                            <p className="text-sm font-black text-white">{item.protein}g</p>
                                        </div>
                                        <div className="text-center bg-slate-700/30 p-2 rounded-xl">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase">Gluc</p>
                                            <p className="text-sm font-black text-white">{item.carbs}g</p>
                                        </div>
                                        <div className="text-center bg-slate-700/30 p-2 rounded-xl">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase">Lip</p>
                                            <p className="text-sm font-black text-white">{item.fat}g</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => confirmAdd(analysisResult)}
                            className="w-full mt-8 py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3"
                        >
                            <IconCheckCircle className="w-6 h-6" /> {t('foodTracker.confirmAdd')}
                        </button>
                    </div>
                </div>
            )}

            {/* History Section */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-4">{t('foodTracker.mealsToday')}</h3>
                {logs.length === 0 ? (
                    <div className="bg-slate-900/50 border border-dashed border-slate-800 p-16 rounded-[2.5rem] text-center">
                        <IconFire className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold">{t('foodTracker.noMeals')}</p>
                    </div>
                ) : (
                    logs.map((meal: any) => (
                        <div key={meal.id} className="bg-slate-900 border border-white/5 p-6 rounded-3xl flex justify-between items-center group hover:border-orange-500/30 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                                    <IconFire className="w-7 h-7" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg capitalize">{meal.name}</h4>
                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mt-1">
                                        <span>{new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                        <span>{meal.portion}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <span className="text-2xl font-black text-white">{meal.macros.calories}</span>
                                    <span className="text-[10px] font-bold text-slate-500 ml-1 uppercase">kcal</span>
                                </div>
                                <button onClick={() => onDelete(meal.id)} className="p-3 text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
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

export default FoodTracker;
