import React, { useState, useEffect } from 'react';
import { IconSparkles, IconX, IconLoader } from './Icons';
import { useTranslation } from '../i18n/i18n';
import { generateInsights } from '../services/geminiService';

interface AIInsightsModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'water' | 'food' | 'activity' | 'fasting' | 'sleep';
    dataSummary: string;
}

const AIInsightsModal: React.FC<AIInsightsModalProps> = ({ isOpen, onClose, type, dataSummary }) => {
    const { t } = useTranslation();
    const [insights, setInsights] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchInsights = async () => {
            if (isOpen && dataSummary) {
                setLoading(true);
                setInsights(null);
                try {
                    const result = await generateInsights(type, dataSummary);
                    setInsights(result);
                } catch (error) {
                    console.error(error);
                    setInsights("Impossible de récupérer l'analyse pour le moment.");
                } finally {
                    setLoading(false);
                }
            }
        };

        if (isOpen) {
            fetchInsights();
        }
    }, [isOpen, type, dataSummary]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in duration-300">
            <div className="bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-lg relative transform animate-in fade-in zoom-in-95 slide-in-from-bottom-10 duration-500 overflow-hidden border border-slate-800">
                {/* Header */}
                <div className="bg-gradient-to-r from-brand-600 to-purple-600 p-6 text-white relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 rounded-full p-2 transition-colors">
                        <IconX className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md">
                            <IconSparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black tracking-tight">{t('insights.modalTitle')}</h3>
                            <p className="text-xs text-white/80 font-medium opacity-80">Analyse par Gemini 3.0</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-slate-800 border-t-brand-500 rounded-full animate-spin mb-6"></div>
                                <IconSparkles className="w-6 h-6 text-brand-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>
                            <p className="animate-pulse font-bold text-sm tracking-widest uppercase">{t('insights.loading')}</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                {t('insights.subtitle')}
                            </p>
                            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 text-slate-200 leading-relaxed whitespace-pre-wrap max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent text-sm font-medium">
                                {insights}
                            </div>
                            <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-wider">
                                {t('insights.disclaimer')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-end">
                    <button onClick={onClose} className="px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold hover:bg-slate-700 transition-colors shadow-lg shadow-slate-900/50">
                        {t('common.close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIInsightsModal;