import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FoodItem, AIAnalysisResult, UserGoals, Recipe } from '../types';
import { analyzeFoodInput, suggestRecipes, generateRecipeImage } from '../services/geminiService';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useTranslation } from '../i18n/i18n';
import { IconCamera, IconLoader, IconPlus, IconFire, IconTrash, IconX, IconMic, IconLock, IconChartBar, IconSparkles, IconChefHat, IconClock } from './Icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AIInsightsModal from './AIInsightsModal';

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
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayLogs = logs.filter(log => log.timestamp >= startOfToday.getTime());

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
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return logs.filter(log => log.timestamp >= startOfToday.getTime()).sort((a, b) => b.timestamp - a.timestamp);
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

  const MacroProgress: React.FC<{ label: string, color: string, current: number, goal: number, unit: string }> = ({ label, color, current, goal, unit }) => (
    <div>
      <div className="flex justify-between items-baseline mb-1"><span className="text-sm font-medium text-slate-300">{label}</span><span className="text-xs text-slate-400">{current}{unit} / {goal}{unit}</span></div>
      <div className="w-full bg-slate-700 rounded-full h-2.5"><div className={`h-2.5 rounded-full ${color}`} style={{ width: `${Math.min((current / goal) * 100, 100)}%` }}></div></div>
    </div>
  );

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col">
          {isFlashing && <div className="absolute inset-0 bg-white z-20"></div>}
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover z-0" />
          <button onClick={closeCamera} className="absolute top-4 right-4 text-white bg-black/50 p-3 rounded-full z-10" aria-label="Fermer la caméra"><IconX className="w-6 h-6" /></button>
          <div className="absolute bottom-0 inset-x-0 p-6 flex justify-center z-10">
            <button onClick={capturePhoto} className="w-20 h-20 rounded-full bg-white flex items-center justify-center border-4 border-slate-300" aria-label="Prendre une photo"><div className="w-16 h-16 rounded-full bg-white ring-2 ring-inset ring-slate-900" /></button>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmationModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 flex justify-center items-center p-4">
          <div className="bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col border border-slate-700">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">{t('foodTracker.confirmModalTitle')}</h3>
              <p className="text-sm text-slate-400">{t('foodTracker.confirmModalDescription')}</p>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              {editableResults.map((item) => (
                <div key={item.tempId} className="bg-slate-800 p-4 rounded-xl relative border border-slate-700">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={item.isSelected}
                      onChange={() => setEditableResults(prev => prev.map(r => r.tempId === item.tempId ? { ...r, isSelected: !r.isSelected } : r))}
                      className="mt-1.5 h-5 w-5 rounded border-slate-600 bg-slate-700 text-brand-600 focus:ring-brand-500 focus:ring-offset-slate-800"
                    />
                    <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2">
                      <div className="col-span-2">
                        <label className="text-xs font-medium text-slate-400">{t('foodTracker.foodItemLabel')}</label>
                        <input type="text" value={item.name} onChange={e => handleItemChange(item.tempId, 'name', e.target.value)} className="w-full p-1.5 border-b border-slate-600 bg-transparent text-white focus:outline-none focus:border-brand-500" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-400">{t('foodTracker.portionLabel')}</label>
                        <input type="text" value={item.portion} onChange={e => handleItemChange(item.tempId, 'portion', e.target.value)} className="w-full p-1.5 border-b border-slate-600 bg-transparent text-white focus:outline-none focus:border-brand-500" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-400">{t('foodTracker.caloriesLabel')}</label>
                        <input type="number" value={item.calories} onChange={e => handleItemChange(item.tempId, 'calories', +e.target.value)} className="w-full p-1.5 border-b border-slate-600 bg-transparent text-white focus:outline-none focus:border-brand-500" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-400">{t('foodTracker.proteinLabel')}</label>
                        <input type="number" value={item.protein} onChange={e => handleItemChange(item.tempId, 'protein', +e.target.value)} className="w-full p-1.5 border-b border-slate-600 bg-transparent text-white focus:outline-none focus:border-brand-500" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-400">{t('foodTracker.carbsLabel')}</label>
                        <input type="number" value={item.carbs} onChange={e => handleItemChange(item.tempId, 'carbs', +e.target.value)} className="w-full p-1.5 border-b border-slate-600 bg-transparent text-white focus:outline-none focus:border-brand-500" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-400">{t('foodTracker.fatLabel')}</label>
                        <input type="number" value={item.fat} onChange={e => handleItemChange(item.tempId, 'fat', +e.target.value)} className="w-full p-1.5 border-b border-slate-600 bg-transparent text-white focus:outline-none focus:border-brand-500" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900 rounded-b-2xl">
              <button onClick={() => setIsConfirmationModalOpen(false)} className="px-4 py-2 rounded-lg font-semibold text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700">{t('foodTracker.cancel')}</button>
              <button onClick={handleConfirmAdd} className="px-4 py-2 rounded-lg font-semibold text-white bg-brand-600 hover:bg-brand-500">{t('foodTracker.confirmAdd')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Main UI */}
      <div className="bg-slate-900 rounded-2xl shadow-sm p-4 md:p-6 border border-slate-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6"><IconFire className="w-6 h-6 text-orange-500" />{t('foodTracker.title')} {!isProMember && <span className="text-sm font-normal text-slate-400">{t('foodTracker.basicLabel')}</span>} {isProMember && <span className="text-sm font-bold text-amber-500">{t('foodTracker.proLabel')}</span>}</h2>

        {/* Tab Toggle */}
        <div className="mt-2 bg-slate-800 p-1 rounded-lg flex items-center text-sm w-full mb-6">
          <button onClick={() => setActiveTab('journal')} className={`w-1/2 py-2 rounded-md transition-colors font-semibold flex items-center justify-center gap-2 ${activeTab === 'journal' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>
            <IconFire className="w-4 h-4" /> Journal
          </button>
          <button onClick={() => setActiveTab('recipes')} className={`w-1/2 py-2 rounded-md transition-colors font-semibold flex items-center justify-center gap-2 ${activeTab === 'recipes' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>
            <IconChefHat className="w-4 h-4" /> {t('foodTracker.recipesTab')}
          </button>
        </div>

        {activeTab === 'journal' ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            <textarea value={inputText} onChange={(e) => { setInputText(e.target.value); setError(null); }} onKeyDown={handleKeyDown} placeholder={isProMember ? t('foodTracker.placeholderPro') : t('foodTracker.placeholderBasic')} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 h-24 resize-none placeholder:text-slate-500" />
            {isListening && (
              <p className="text-sm text-slate-400 mt-1">
                {t('foodTracker.listening')} <span className="italic text-brand-400">{transcript}</span>
              </p>
            )}
            {previewImage && (
              <div className="relative w-full h-48 bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                <button onClick={() => { setPreviewImage(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"><IconTrash className="w-4 h-4" /></button>
              </div>
            )}
            {error && <p className="text-sm text-red-400 text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}
            <div className="flex items-center gap-3">
              {hasSupport && (
                <button
                  onClick={toggleListening}
                  className={`p-3 border rounded-xl transition-colors ${isListening ? 'border-red-500/30 bg-red-500/10 text-red-400' : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                  title={isListening ? "Arrêter l'écoute" : "Dicter le repas"}
                >
                  {isProMember ? <IconMic className={`w-6 h-6 ${isListening ? 'animate-pulse' : ''}`} /> : <IconLock className="w-6 h-6" />}
                </button>
              )}
              <button onClick={openCamera} className="p-3 border border-slate-700 bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-700 hover:text-white" title="Scanner un aliment">
                {isProMember ? <IconCamera className="w-6 h-6" /> : <IconLock className="w-6 h-6" />}
              </button>
              <button onClick={handleUploadClick} className="text-sm font-medium text-slate-400 hover:text-brand-400 transition-colors">{t('foodTracker.upload')}<input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" /></button>

              <button onClick={handleAnalyze} disabled={isAnalyzing || (!inputText && !previewImage)} className={`flex-1 ml-auto flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white transition-all ${isAnalyzing || (!inputText && !previewImage) ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-500'}`}>
                {isAnalyzing ? <><IconLoader className="w-5 h-5 animate-spin" />{t('foodTracker.analyzing')}</> : isProMember ? <><IconPlus className="w-5 h-5" />{t('foodTracker.analyzeButton')}</> : <><IconLock className="w-5 h-5" />{t('foodTracker.analyzeButtonPro')}</>}
              </button>
            </div>
            <p className="text-xs text-slate-500 text-center">{t('foodTracker.geminiDisclaimer')}</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">
            {!isProMember && (
              <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 text-amber-400 text-sm text-center mb-4">
                {t('foodTracker.recipeProLock')}
                <button onClick={onUpgradeClick} className="block w-full mt-2 font-bold underline hover:text-amber-300">{t('dashboard.proFeatureButton')}</button>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">{t('foodTracker.recipeInputLabel')}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={recipeQuery}
                  onChange={(e) => setRecipeQuery(e.target.value)}
                  placeholder={t('foodTracker.recipeInputPlaceholder')}
                  className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-500"
                />
                <button
                  onClick={handleGenerateRecipes}
                  disabled={isGeneratingRecipes || !isProMember}
                  className="px-4 py-2 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-500 transition-colors disabled:bg-slate-700 disabled:text-slate-500 flex items-center justify-center gap-2"
                >
                  {isGeneratingRecipes ? <IconLoader className="w-5 h-5 animate-spin" /> : <IconSparkles className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {suggestedRecipes.length > 0 && (
              <div className="grid grid-cols-1 gap-6">
                {suggestedRecipes.map(recipe => (
                  <div key={recipe.id} className="border border-slate-700 rounded-xl overflow-hidden bg-slate-900 shadow-sm hover:border-brand-500/50 transition-all">
                    <div className="h-48 bg-slate-800 relative group overflow-hidden">
                      {recipe.imageUrl ? (
                        <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-800/50">
                          <IconChefHat className="w-12 h-12 mb-3 opacity-30" />
                          {loadingImages[recipe.id] ? (
                            <div className="flex items-center gap-2 text-brand-400 font-bold text-xs uppercase tracking-widest animate-pulse">
                              <IconLoader className="w-4 h-4 animate-spin" />
                              {t('foodTracker.generatingImage')}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleGenerateIndividualImage(recipe.id, recipe.name)}
                              className="px-4 py-2 bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-full text-[10px] font-bold text-slate-300 uppercase tracking-widest hover:bg-slate-800 hover:text-brand-400 transition-all shadow-sm flex items-center gap-2"
                            >
                              <IconSparkles className="w-3 h-3" />
                              {t('foodTracker.generateImage')}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="mb-4">
                        <h3 className="font-bold text-xl text-white mb-1">{recipe.name}</h3>
                        <div className="flex items-center gap-3 text-xs font-semibold">
                          <span className="flex items-center gap-1.5 text-slate-400 bg-slate-800 px-2 py-1 rounded-md border border-slate-700"><IconClock className="w-3.5 h-3.5" /> {recipe.prepTimeMinutes} min</span>
                          <span className="flex items-center gap-1.5 text-orange-400 bg-orange-500/10 px-2 py-1 rounded-md border border-orange-500/20"><IconFire className="w-3.5 h-3.5" /> {recipe.macros.calories} kcal</span>
                        </div>
                      </div>

                      <p className="text-sm text-slate-400 mb-5 italic leading-relaxed">"{recipe.description}"</p>

                      <div className="flex flex-wrap gap-2 mb-5">
                        <span className="text-[11px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-lg border border-emerald-500/20 font-bold uppercase tracking-wider">P: {recipe.macros.protein}g</span>
                        <span className="text-[11px] bg-amber-500/10 text-amber-400 px-2 py-1 rounded-lg border border-amber-500/20 font-bold uppercase tracking-wider">G: {recipe.macros.carbs}g</span>
                        <span className="text-[11px] bg-red-500/10 text-red-400 px-2 py-1 rounded-lg border border-red-500/20 font-bold uppercase tracking-wider">L: {recipe.macros.fat}g</span>
                      </div>

                      {expandedRecipeId === recipe.id && (
                        <div className="mb-5 space-y-4 bg-slate-800 p-4 rounded-xl animate-in fade-in slide-in-from-top-2 border border-slate-700">
                          <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('foodTracker.ingredients')}</h4>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-300">
                              {recipe.ingredients.map((ing, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0"></span>
                                  <span className="truncate">{ing}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          {recipe.instructions && recipe.instructions.length > 0 && (
                            <div className="pt-4 border-t border-slate-700">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('foodTracker.viewDetails')}</h4>
                              <ol className="space-y-3">
                                {recipe.instructions.map((step, i) => (
                                  <li key={i} className="flex gap-3 text-sm text-slate-300">
                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                                    <span className="leading-snug">{step}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={() => setExpandedRecipeId(expandedRecipeId === recipe.id ? null : recipe.id)}
                          className="flex-1 py-2.5 text-sm font-bold text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors"
                        >
                          {expandedRecipeId === recipe.id ? t('foodTracker.hideDetails') : t('foodTracker.viewDetails')}
                        </button>
                        <button
                          onClick={() => handleAddRecipeToLog(recipe)}
                          className="flex-1 py-2.5 text-sm font-bold text-white bg-brand-600 rounded-xl hover:bg-brand-500 flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow"
                        >
                          <IconPlus className="w-4 h-4" /> {t('foodTracker.add')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {activeTab === 'journal' && (
        <div className="bg-gradient-to-br from-orange-500/5 to-orange-500/10 rounded-2xl p-6 border border-orange-500/20">
          <div className="flex justify-between items-end mb-4">
            <div><p className="text-orange-300 font-medium mb-1">{t('foodTracker.totalCalories')}</p><p className="text-3xl font-bold text-orange-100">{todayCalories} <span className="text-lg font-normal text-orange-300/70">kcal</span></p></div>
            <div className="text-right"><p className="text-sm text-orange-300/80">{t('foodTracker.goal', { goal: goals.calories })}</p><div className="w-24 h-2 bg-slate-800 rounded-full mt-2 overflow-hidden"><div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min((todayCalories / goals.calories) * 100, 100)}%` }} /></div></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <MacroProgress label={t('dashboard.protein')} color="bg-emerald-500" current={todayProtein} goal={goals.protein} unit="g" />
            <MacroProgress label={t('dashboard.carbs')} color="bg-amber-500" current={todayCarbs} goal={goals.carbs} unit="g" />
            <MacroProgress label={t('dashboard.fat')} color="bg-red-500" current={todayFat} goal={goals.fat} unit="g" />
          </div>
        </div>
      )}

      {activeTab === 'journal' && (
        <div className="bg-slate-900 rounded-2xl shadow-sm p-6 border border-slate-800">
          <h3 className="text-lg font-semibold text-white mb-4">{t('foodTracker.mealsToday')}</h3>
          {todaysLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-500 border border-slate-800 border-dashed rounded-xl"><IconFire className="w-10 h-10 mx-auto mb-2 opacity-20" /><p>{t('foodTracker.noMeals')}</p></div>
          ) : (
            <div className="space-y-3">
              {todaysLogs.map((log) => (
                <div key={log.id} className="bg-slate-800 rounded-xl p-4 flex gap-4 border border-slate-700">
                  {log.image ? <img src={log.image} alt={log.name} className="w-16 h-16 rounded-lg object-cover bg-slate-700" /> : <div className="w-16 h-16 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500"><IconFire className="w-8 h-8" /></div>}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white">{log.name}</h4>
                        <p className="text-xs text-slate-400 -mt-0.5">
                          {new Date(log.timestamp).toLocaleDateString(language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'en-US', { weekday: 'short', day: 'numeric' })} &middot; {log.portion || '1 portion'}
                        </p>
                      </div>
                      <button onClick={() => onDelete(log.id)} className="text-slate-500 hover:text-red-400"><IconTrash className="w-4 h-4" /></button>
                    </div>
                    <p className="text-sm text-orange-400 font-semibold mt-1">{log.macros.calories} kcal</p>
                    <div className="flex gap-3 mt-2 text-xs text-slate-500"><span>P: {log.macros.protein}g</span><span>G: {log.macros.carbs}g</span><span>L: {log.macros.fat}g</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'journal' && (
        <div className="bg-slate-900 rounded-2xl shadow-sm p-6 border border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <IconChartBar className="w-6 h-6 text-brand-500" />
              {t('common.history')}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleInsights}
                className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-brand-600 to-purple-600 text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
              >
                {isProMember ? <IconSparkles className="w-3 h-3" /> : <IconLock className="w-3 h-3" />}
                {t('common.analyze')}
              </button>
              <div className="bg-slate-800 p-1 rounded-lg flex text-xs">
                {(['week', 'month', 'year'] as const).map(view => (
                  <button
                    key={view}
                    onClick={() => setHistoryView(view)}
                    className={`px-3 py-1 rounded-md transition-colors ${historyView === view ? 'bg-slate-700 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    {t(`common.${view}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  interval={historyView === 'month' ? 4 : 0}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #1e293b', backgroundColor: '#0f172a', color: '#fff' }}
                  cursor={{ fill: 'rgba(251, 146, 60, 0.1)' }}
                  formatter={(value: number) => [`${value} kcal`, 'Calories']}
                />
                <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
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