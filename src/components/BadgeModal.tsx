import React from 'react';
import { Badge } from '../types';
import { useTranslation } from '../i18n/i18n';
import { IconAward, IconCheckCircle, IconX, IconSparkles } from '../ui/Icons';

interface BadgeModalProps {
    badge: Omit<Badge, 'isEarned'>;
    onClose: () => void;
}

const BadgeModal: React.FC<BadgeModalProps> = ({ badge, onClose }) => {
    const { t } = useTranslation();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-brand-500/30 w-full max-w-sm rounded-[3rem] p-10 shadow-[0_0_100px_rgba(var(--brand-500),0.2)] relative overflow-hidden animate-in zoom-in-95 duration-500">
                {/* Flair */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-600/20 blur-[60px] -mr-16 -mt-16 rounded-full" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-600/10 blur-[60px] -ml-16 -mb-16 rounded-full" />

                <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors z-10">
                    <IconX className="w-6 h-6" />
                </button>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="text-brand-400 mb-2 font-black text-[10px] uppercase tracking-[0.3em]">Nouveau Badge !</div>

                    <div className="w-24 h-24 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl mb-8 relative">
                        <badge.icon className="w-12 h-12" />
                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-slate-900 p-1.5 rounded-full shadow-lg">
                            <IconSparkles className="w-4 h-4" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                        {t(`badges.${badge.id}.name`)}
                    </h2>
                    <p className="text-slate-400 font-bold mb-10 text-sm leading-relaxed">
                        {t(`badges.${badge.id}.description`)}
                    </p>

                    <button
                        onClick={onClose}
                        className="w-full py-5 bg-brand-600 text-white font-black rounded-2xl shadow-xl hover:bg-brand-500 transition-all text-sm uppercase tracking-widest active:scale-95"
                    >
                        SUPER !
                    </button>

                    <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-brand-500 uppercase tracking-widest">
                        <IconCheckCircle className="w-3 h-3" /> Ajouté à votre collection
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BadgeModal;
