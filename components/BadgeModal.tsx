import React from 'react';
import { Badge } from '../types';
import { IconSparkles, IconX } from './Icons';
import { useTranslation } from '../i18n/i18n';

interface BadgeModalProps {
    badge: Omit<Badge, 'isEarned'>;
    onClose: () => void;
}

const BadgeModal: React.FC<BadgeModalProps> = ({ badge, onClose }) => {
    const { t } = useTranslation();
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm text-center p-8 relative transform animate-in fade-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><IconX className="w-6 h-6" /></button>
                
                <div className="relative inline-block">
                    <IconSparkles className="absolute -top-4 -left-6 w-8 h-8 text-amber-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <IconSparkles className="absolute -top-2 -right-5 w-5 h-5 text-brand-400 animate-pulse" />
                    <IconSparkles className="absolute bottom-0 -right-4 w-6 h-6 text-emerald-400 animate-pulse" style={{ animationDelay: '0.4s' }} />

                    <div className="w-32 h-32 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6 border-4 border-amber-200">
                        <badge.icon className="w-16 h-16 text-amber-500" />
                    </div>
                </div>

                <p className="text-sm font-bold uppercase tracking-wider text-amber-600">{t('badges.newBadge')}</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-2">{t(badge.nameKey)}</h3>
                <p className="text-slate-500 mt-2">{t(badge.descriptionKey)}</p>

                <button onClick={onClose} className="mt-8 w-full px-4 py-3 rounded-xl font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors">
                    {t('badges.continue')}
                </button>
            </div>
        </div>
    );
};

export default BadgeModal;