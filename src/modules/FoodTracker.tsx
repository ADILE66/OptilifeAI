import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FoodItem, AIAnalysisResult, UserGoals, Recipe } from '../types';
import { analyzeFoodInput, suggestRecipes, generateRecipeImage } from '../services/geminiService';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useTranslation } from '../i18n/i18n';
import { IconCamera, IconLoader, IconPlus, IconFire, IconTrash, IconX, IconMic, IconLock, IconChartBar, IconSparkles, IconChefHat, IconClock } from '../ui/Icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AIInsightsModal from '../components/AIInsightsModal';

type EditableItem = AIAnalysisResult['items'][0] & {
    tempId: string;
    isSelected: boolean;
};

interface FoodTrackerProps {
    logs: FoodItem[];
    onAdd: (items: Omit<FoodItem, 'id' | 'timestamp'>[]) => void;
    onDelete: (id: string) => void;
    goals: UserGoals;
    isProMember: boolean;
    onUpgradeClick: () => void;
}

const FoodTracker: React.FC<FoodTrackerProps> = ({ logs, onAdd, onDelete, goals, isProMember, onUpgradeClick }) => {
    const { t, language } = useTranslation();
    const [activeTab, setActiveTab] = useState<'journal' | 'recipes'>('journal');

    // Journal State
    const [inputText, setInputText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [historyView, setHistoryView] = useState<'week' | 'month' | 'year'>('week');
    const [isInsightsOpen, setIsInsightsOpen] = useState(false);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [editableResults, setEditableResults] = useState<EditableItem[]>([]);
    const [isFlashing, setIsFlashing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Recipe State
    const [recipeQuery, setRecipeQuery] = useState('');
    const [isGeneratingRecipes, setIsGeneratingRecipes] = useState(false);
    const [suggestedRecipes, setSuggestedRecipes] = useState<Recipe[]>([]);
    const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
    const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const { todayCalories, todayProtein, todayCarbs, todayFat } = useMemo(() => {
        const startOfToday = new Date().setHours(0, 0, 0, 0);
        const todayLogs = logs.filter(log => log.timestamp >= startOfToday);

        return {
            todayCalories: todayLogs.reduce((acc, log) => acc + log.macros.calories, 0),
            todayProtein: todayLogs.reduce((acc, log) => acc + log.macros.protein, 0),
            todayCarbs: todayLogs.reduce((acc, log) => acc + log.macros.carbs, 0),
            todayFat: todayLogs.reduce((acc, log) => acc + log.macros.fat, 0),
        };
    }, [logs]);

    const handleVoiceResult = (finalTranscript: string) => {
        setInputText(prev => (prev ? prev + ' ' : '') + finalTranscript);
    };

    const { isListening, transcript, startListening, stopListening, hasSupport } = useVoiceRecognition({
        onResult: handleVoiceResult,
        continuous: true,
        lang: language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'en-US'
    });

    const toggleListening = () => {
        if (!isProMember) {
            onUpgradeClick();
            return;
        }
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    useEffect(() => {
        if (isCameraOpen && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [isCameraOpen, stream]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isProMember) {
            onUpgradeClick();
            return;
        }
        const file = e.target.files?.[0];
        if (file) {
            setError(null);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const openCamera = async () => {
        if (!isProMember) {
            onUpgradeClick();
            return;
        }
        setError(null);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setStream(mediaStream);
            setIsCameraOpen(true);
        } catch (err) {
            console.error("Erreur d'accès à la caméra: ", err);
            setError(t('foodTracker.errorCamera'));
        }
    };

    const closeCamera = () => {
        stream?.getTracks().forEach(track => track.stop());
        setStream(null);
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            setIsFlashing(true);

            const { videoWidth, videoHeight } = videoRef.current;
            canvasRef.current.width = videoWidth;
            canvasRef.current.height = videoHeight;
            canvasRef.current.getContext('2d')?.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
            setPreviewImage(canvasRef.current.toDataURL('image/jpeg'));

            setTimeout(() => {
                closeCamera();
                setIsFlashing(false);
            }, 100);
        }
    };

    const handleAnalyze = async () => {
        if (!isProMember) {
            onUpgradeClick();
            return;
        }
        if (!inputText && !previewImage) return;

        setError(null);
        setIsAnalyzing(true);
        try {
            const base64Data = previewImage?.split(',')[1];
            const result = await analyzeFoodInput(inputText, base64Data);

            if (result && result.items && result.items.length > 0) {
                setEditableResults(result.items.map(item => ({
                    ...item,
                    tempId: crypto.randomUUID(),
                    isSelected: true,
                })));
                setIsConfirmationModalOpen(true);
            } else {
                setError(t('foodTracker.errorAnalysis'));
            }
        } catch (error) {
            setError(t('foodTracker.errorGeneric'));
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleConfirmAdd = () => {
        const itemsToAdd = editableResults
            .filter(item => item.isSelected)
            .map(({ name, portion, calories, protein, carbs, fat }) => ({
                name,
                portion,
                macros: { calories, protein, carbs, fat },
                image: previewImage || undefined,
            }));

        if (itemsToAdd.length > 0) {
            onAdd(itemsToAdd);
        }

        setIsConfirmationModalOpen(false);
        setEditableResults([]);
        setInputText('');
        setPreviewImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleItemChange = (tempId: string, field: keyof EditableItem, value: string | number) => {
        setEditableResults(prev => prev.map(item =>
            item.tempId === tempId ? { ...item, [field]: value } : item
        ));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAnalyze();
        }
    }

    const handleUploadClick = () => {
        if (!isProMember) {
            onUpgradeClick();
            return;
        }
        fileInputRef.current?.click();
    }

    // --- Recipe Logic ---
    const handleGenerateRecipes = async () => {
        if (!isProMember) {
            onUpgradeClick();
            return;
        }
        setIsGeneratingRecipes(true);
        setSuggestedRecipes([]);
        try {
            const recipes = await suggestRecipes(recipeQuery, language);
            setSuggestedRecipes(recipes);
        } catch (e) {
            console.error(e);
            setError("Impossible de générer des recettes.");
        } finally {
            setIsGeneratingRecipes(false);
        }
    };

    const handleGenerateIndividualImage = async (recipeId: string, recipeName: string) => {
        if (!isProMember) return onUpgradeClick();
        setLoadingImages(prev => ({ ...prev, [recipeId]: true }));
        try {
            const imageUrl = await generateRecipeImage(recipeName);
            if (imageUrl) {
                setSuggestedRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, imageUrl } : r));
            }
        } catch (e) {
            console.error("Erreur image:", e);
        } finally {
            setLoadingImages(prev => ({ ...prev, [recipeId]: false }));
        }
    };

    const handleAddRecipeToLog = (recipe: Recipe) => {
        onAdd([{
            name: recipe.name,
            portion: '1 portion',
            macros: recipe.macros,
            image: recipe.imageUrl
        }]);
        setActiveTab('journal');
    };

    // --- Stats & Helpers ---
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
                    label: day.toLocaleDateString(language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'en-US', { weekday: 'short' }),
                    value: dailyLogs.reduce((acc, l) => acc + l.macros.calories, 0)
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
                    value: dailyLogs.reduce((acc, l) => acc + l.macros.calories, 0)
                };
            });
        } else {
            return Array.from({ length: 12 }, (_, i) => {
                const startOfMonth = new Date(now.getFullYear(), i, 1).getTime();
                const endOfMonth = new Date(now.getFullYear(), i + 1, 0).getTime() + 86400000;
                const monthlyLogs = logs.filter(l => l.timestamp >= startOfMonth && l.timestamp < endOfMonth);
                return {
                    label: new Date(now.getFullYear(), i, 1).toLocaleDateString(language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'en-US', { month: 'short' }),
                    value: monthlyLogs.reduce((acc, l) => acc + l.macros.calories, 0)
                };
            });
        }
    }, [logs, historyView, language]);

    const todaysLogs = useMemo(() => {
        const startOfToday = new Date().setHours(0, 0, 0, 0);
        return logs.filter(log => log.timestamp >= startOfToday).sort((a, b) => b.timestamp - a.timestamp);
    }, [logs]);

    const getSummaryString = () => {
        const now = new Date();
        const summary = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(now);
            d.setDate(d.getDate() - (6 - i));
            const startOfDay = new Date(d).setHours(0, 0, 0, 0);
            const endOfDay = new Date(d).setHours(23, 59, 59, 999);
            const dailyLogs = logs.filter(l => l.timestamp >= startOfDay && l.timestamp <= endOfDay);
            const cal = dailyLogs.reduce((acc, l) => acc + l.macros.calories, 0);
            const prot = dailyLogs.reduce((acc, l) => acc + l.macros.protein, 0);
            const carb = dailyLogs.reduce((acc, l) => acc + l.macros.carbs, 0);
            const fat = dailyLogs.reduce((acc, l) => acc + l.macros.fat, 0);

            return `${d.toLocaleDateString(language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'en-US')}: ${cal}kcal (P:${prot}g, G:${carb}g, L:${fat}g)`;
        }).join('\n');
        return summary;
    };

    const handleInsights = () => {
        if (!isProMember) {
            onUpgradeClick();
            return;
        }
        setIsInsightsOpen(true);
    };

    const MacroCircle: React.FC<{ label: string, current: number, goal: number, color: string, colorBar: string }> = ({ label, current, goal, color, colorBar }) => {
        const pct = Math.min(100, Math.round((current / goal) * 100));
        return (
            <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 flex items-center justify-center mb-2">
                    <svg className="absolute w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-800" />
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={28 * 2 * Math.PI} strokeDashoffset={(28 * 2 * Math.PI) * (1 - pct / 100)} className={`${colorBar} transition-all duration-1000`} />
                    </svg>
                    <span className="text-xs font-black text-white">{pct}%</span>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${color}`}>{label}</span>
                <span className="text-[10px] font-bold text-slate-500 mt-0.5">{current}g</span>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Camera & Confirmation Modals (Same as before but polished) */}
            {isConfirmationModalOpen && (
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[60] flex justify-center items-center p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="p-8 border-b border-white/5">
                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">{t('foodTracker.confirmModalTitle')}</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{t('foodTracker.confirmModalDescription')}</p>
                        </div>
                        <div className="px-8 py-6 space-y-4 overflow-y-auto custom-scrollbar">
                            {editableResults.map((item) => (
                                <div key={item.tempId} className="bg-slate-800/50 p-6 rounded-3xl border border-white/5 relative">
                                    <div className="flex items-start gap-4">
                                        <input
                                            type="checkbox"
                                            checked={item.isSelected}
                                            onChange={() => setEditableResults(prev => prev.map(r => r.tempId === item.tempId ? { ...r, isSelected: !r.isSelected } : r))}
                                            className="mt-1 h-6 w-6 rounded-lg border-white/10 bg-slate-700 text-brand-600 focus:ring-brand-500"
                                        />
                                        <div className="flex-1 grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Nom</label>
                                                <input type="text" value={item.name} onChange={e => handleItemChange(item.tempId, 'name', e.target.value)} className="w-full bg-transparent border-b border-white/10 text-white font-black p-0 focus:border-brand-500 focus:outline-none" />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Calories</label>
                                                <input type="number" value={item.calories} onChange={e => handleItemChange(item.tempId, 'calories', +e.target.value)} className="w-full bg-transparent border-b border-white/10 text-white font-black p-0 focus:border-brand-500 focus:outline-none" />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Portion</label>
                                                <input type="text" value={item.portion} onChange={e => handleItemChange(item.tempId, 'portion', e.target.value)} className="w-full bg-transparent border-b border-white/10 text-white font-black p-0 focus:border-brand-500 focus:outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-8 border-t border-white/5 flex gap-4">
                            <button onClick={() => setIsConfirmationModalOpen(false)} className="flex-1 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 bg-slate-800 hover:text-white transition-all">{t('foodTracker.cancel')}</button>
                            <button onClick={handleConfirmAdd} className="flex-2 px-8 py-4 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-500 transition-all text-[10px] uppercase tracking-widest shadow-lg shadow-brand-600/20">{t('foodTracker.confirmAdd')}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Today Card */}
            <div className="bg-slate-900 rounded-[2.5rem] border border-white/5 p-8 shadow-2xl relative overflow-hidden group">
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center">
                                <IconFire className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight italic">FUEL & PERFORMANCE</h2>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('common.today')}</p>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2 mb-6">
                            <span className="text-6xl font-black text-white italic leading-none">{todayCalories}</span>
                            <span className="text-xl font-bold text-slate-500 uppercase leading-none">/ {goals.calories} kcal</span>
                        </div>
                        <div className="h-6 bg-slate-800 rounded-full overflow-hidden border border-white/5 p-1.5 max-w-md">
                            <div
                                className="h-full bg-gradient-to-r from-orange-600 to-amber-500 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                                style={{ width: `${Math.min(100, (todayCalories / goals.calories) * 100)}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex justify-around items-center lg:col-span-2 bg-black/20 rounded-[2rem] p-6 border border-white/5">
                        <MacroCircle label="Protéines" current={todayProtein} goal={goals.protein} color="text-emerald-400" colorBar="text-emerald-500" />
                        <MacroCircle label="Glucides" current={todayCarbs} goal={goals.carbs} color="text-amber-400" colorBar="text-amber-500" />
                        <MacroCircle label="Lipides" current={todayFat} goal={goals.fat} color="text-red-400" colorBar="text-red-500" />
                    </div>
                </div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500/5 blur-[100px] rounded-full group-hover:bg-orange-500/10 transition-colors" />
            </div>

            {/* Input Section */}
            <div className="bg-slate-900 rounded-[2.5rem] border border-white/5 p-8 shadow-2xl overflow-hidden">
                <div className="flex gap-4 mb-6 bg-slate-800/50 p-1.5 rounded-2xl w-fit">
                    {(['journal', 'recipes'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                            {tab === 'journal' ? 'JOURNAL DE BORD' : 'ALGORITHME RECETTES'}
                        </button>
                    ))}
                </div>

                {activeTab === 'journal' ? (
                    <div className="space-y-6">
                        <div className="relative">
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Qu'avez-vous consommé ? (Ex: Poulet grillé, 200g de riz...)"
                                className="w-full bg-slate-800/80 border border-white/5 text-white p-6 rounded-[2rem] h-32 focus:outline-none focus:border-brand-500/50 transition-all font-bold placeholder:text-slate-600 shadow-inner"
                            />
                            <div className="absolute bottom-6 right-6 flex items-center gap-3">
                                <button onClick={handleUploadClick} className="p-3 bg-slate-900 border border-white/5 rounded-2xl text-slate-500 hover:text-white transition-all">
                                    <IconCamera className="w-5 h-5" />
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                </button>
                                {hasSupport && (
                                    <button onClick={toggleListening} className={`p-4 rounded-2xl border transition-all ${isListening ? 'bg-red-500 border-red-500 text-white animate-pulse' : 'bg-slate-900 border-white/5 text-slate-500 hover:text-white'}`}>
                                        <IconMic className="w-6 h-6" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {previewImage && (
                            <div className="relative w-40 h-40 group">
                                <img src={previewImage} alt="Preview" className="w-full h-full object-cover rounded-3xl border border-white/10" />
                                <button onClick={() => setPreviewImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <IconX className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || (!inputText && !previewImage)}
                            className="w-full py-5 bg-white text-black font-black rounded-2xl hover:bg-brand-500 hover:text-white transition-all text-xs uppercase tracking-widest shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {isAnalyzing ? <><IconLoader className="w-5 h-5 animate-spin" /> ANALYSE EN COURS...</> : <><IconSparkles className="w-5 h-5" /> ANALYSER LE REPAS</>}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={recipeQuery}
                                    onChange={(e) => setRecipeQuery(e.target.value)}
                                    placeholder="De quoi avez-vous envie ? (Ex: repas rapide protéiné...)"
                                    className="w-full bg-slate-800 border border-white/5 text-white p-5 rounded-2xl text-sm font-bold focus:outline-none focus:border-brand-500 transition-all placeholder:text-slate-600 shadow-inner"
                                />
                                <button
                                    onClick={handleGenerateRecipes}
                                    disabled={isGeneratingRecipes}
                                    className="absolute right-2 top-2 bottom-2 px-6 bg-brand-600 text-white font-black rounded-xl hover:bg-brand-500 transition-all text-[10px] uppercase tracking-widest disabled:opacity-50"
                                >
                                    {isGeneratingRecipes ? <IconLoader className="w-4 h-4 animate-spin" /> : 'GÉNÉRER'}
                                </button>
                            </div>
                        </div>

                        {suggestedRecipes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {suggestedRecipes.map((recipe) => (
                                    <div key={recipe.id} className="bg-slate-800/30 border border-white/5 rounded-[2rem] overflow-hidden group hover:border-brand-500/30 transition-all flex flex-col">
                                        <div className="aspect-[4/3] bg-slate-800 relative overflow-hidden">
                                            {recipe.imageUrl ? (
                                                <img src={recipe.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={recipe.name} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <button
                                                        onClick={() => handleGenerateIndividualImage(recipe.id, recipe.name)}
                                                        disabled={loadingImages[recipe.id]}
                                                        className="flex flex-col items-center gap-2 text-slate-500 hover:text-brand-500 transition-colors"
                                                    >
                                                        {loadingImages[recipe.id] ? <IconLoader className="w-8 h-8 animate-spin" /> : <IconCamera className="w-8 h-8" />}
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Générer l'image</span>
                                                    </button>
                                                </div>
                                            )}
                                            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                                                <IconClock className="w-3 h-3 text-brand-400" />
                                                <span className="text-[10px] font-black text-white">{recipe.prepTimeMinutes} MIN</span>
                                            </div>
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <h4 className="text-sm font-black text-white uppercase italic mb-2 tracking-tight line-clamp-1">{recipe.name}</h4>
                                            <p className="text-[10px] font-medium text-slate-500 line-clamp-2 mb-4 flex-1">{recipe.description}</p>

                                            <div className="flex justify-between items-center mb-6 pt-4 border-t border-white/5">
                                                <div className="text-center">
                                                    <p className="text-[10px] font-black text-white">{recipe.macros.calories}</p>
                                                    <p className="text-[8px] font-bold text-slate-600 uppercase">KCAL</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[10px] font-black text-white">{recipe.macros.protein}g</p>
                                                    <p className="text-[8px] font-bold text-slate-600 uppercase">PROT</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[10px] font-black text-white">{recipe.macros.carbs}g</p>
                                                    <p className="text-[8px] font-bold text-slate-600 uppercase">GLU</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[10px] font-black text-white">{recipe.macros.fat}g</p>
                                                    <p className="text-[8px] font-bold text-slate-600 uppercase">LIP</p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleAddRecipeToLog(recipe)}
                                                className="w-full py-4 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-600 transition-all flex items-center justify-center gap-2 group/btn"
                                            >
                                                <IconPlus className="w-3 h-3" /> Consommer
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 px-8 border border-white/5 border-dashed rounded-[2.5rem] bg-slate-800/10">
                                <IconChefHat className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                                <h3 className="text-sm font-black text-white uppercase italic mb-1">Générateur de Repas Haute Performance</h3>
                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Entrez vos envies ci-dessus pour commencer l'algorithme.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* History & Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] border border-white/5 p-8 shadow-2xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                                <IconChartBar className="w-5 h-5 text-brand-500" />
                                {t('common.history')}
                            </h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Évolution de l'apport énergétique</p>
                        </div>
                        <div className="flex items-center bg-slate-800 p-1.5 rounded-2xl border border-white/5">
                            {(['week', 'month', 'year'] as const).map(view => (
                                <button
                                    key={view}
                                    onClick={() => setHistoryView(view)}
                                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${historyView === view ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
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
                                    formatter={(value: number) => [`${value} kcal`, 'Énergie']}
                                />
                                <Bar dataKey="value" fill="#f97316" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="flex flex-col gap-6 h-full">
                    <div className="bg-slate-900 rounded-[2.5rem] border border-white/5 p-8 shadow-2xl flex-1 max-h-[500px] flex flex-col">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">{t('foodTracker.mealsToday')}</h3>
                        <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
                            {todaysLogs.length === 0 ? (
                                <div className="text-center py-12">
                                    <IconFire className="w-8 h-8 text-slate-800 mx-auto mb-3" />
                                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">RIEN ENCORE</p>
                                </div>
                            ) : (
                                todaysLogs.map((log) => (
                                    <div key={log.id} className="group/item flex gap-4 p-4 bg-slate-800/30 border border-white/5 rounded-2xl hover:bg-slate-800/50 transition-all">
                                        <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 shrink-0">
                                            {log.image ? <img src={log.image} className="w-full h-full object-cover rounded-xl" /> : <IconFire className="w-6 h-6" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h4 className="text-xs font-black text-white truncate uppercase italic">{log.name}</h4>
                                                <button onClick={() => onDelete(log.id)} className="opacity-0 group-hover/item:opacity-100 text-slate-600 hover:text-red-500 transition-all ml-2">
                                                    <IconTrash className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-black text-orange-400">{log.macros.calories} kcal</span>
                                                <span className="text-[10px] text-slate-600 font-bold tracking-tight uppercase">{new Date(log.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AIInsightsModal
                isOpen={isInsightsOpen}
                onClose={() => setIsInsightsOpen(false)}
                type="food"
                dataSummary={getSummaryString()}
            />
        </div>
    );
};

export default FoodTracker;
