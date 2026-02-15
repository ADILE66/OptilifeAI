import React from 'react';
import { useTranslation } from '../i18n/i18n';
import { IconSparkles, IconCheckCircle, IconX, IconStar } from '../ui/Icons';

const ProModal = ({ isOpen, onClose, onUpgrade }: { isOpen: boolean, onClose: () => void, onUpgrade: () => void }) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    const features = [
        { id: 1, text: t('proModal.feature1Title') },
        { id: 2, text: t('proModal.feature2Title') },
        { id: 3, text: t('proModal.feature3Title') },
        { id: 4, text: "Coach Personnel IA 24/7" },
        { id: 5, text: "GPS Live & Podomètre" }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-white/10 w-full max-w-xl rounded-[3rem] p-12 shadow-[0_0_100px_rgba(var(--brand-500),0.15)] relative overflow-hidden animate-in zoom-in-95 duration-500">
                {/* Visual Flair */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/20 blur-[100px] -mr-32 -mt-32 rounded-full" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 blur-[100px] -ml-32 -mb-32 rounded-full" />

                <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors z-10">
                    <IconX className="w-8 h-8" />
                </button>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl mb-8 animate-bounce-slow">
                        <IconSparkles className="w-10 h-10" />
                    </div>

                    <h2 className="text-4xl font-black text-white mb-4 tracking-tight">{t('proModal.title')}</h2>
                    <p className="text-slate-500 font-bold mb-10 max-w-xs">{t('proModal.description')}</p>

                    <div className="w-full space-y-4 mb-12">
                        {features.map(f => (
                            <div key={f.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <IconCheckCircle className="w-6 h-6 text-brand-500" />
                                <span className="font-bold text-slate-200">{f.text}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={onUpgrade}
                        className="w-full py-6 bg-white text-black font-black rounded-[2rem] shadow-2xl hover:bg-slate-200 transition-all text-lg uppercase tracking-widest active:scale-95"
                    >
                        {t('proModal.button')}
                    </button>

                    <p className="mt-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">{t('heroTrust')}</p>
                </div>
            </div>
        </div>
    );
};

export default ProModal;
