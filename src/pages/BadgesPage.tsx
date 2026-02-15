import React from 'react';
import { useTranslation } from '../i18n/i18n';
import { BADGES } from '../constants/badges';
import { IconAward, IconCheckCircle, IconX } from '../ui/Icons';

const BadgesPage = ({ earnedBadgeIds = [] }: { earnedBadgeIds?: string[] }) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            <header>
                <h1 className="text-4xl font-black text-white">{t('badges.title')}</h1>
                <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-xs">{t('badges.subtitle')}</p>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {BADGES.map((badge: any) => {
                    const isEarned = earnedBadgeIds.includes(badge.id);
                    return (
                        <div
                            key={badge.id}
                            className={`relative p-6 rounded-[2rem] border transition-all duration-500 text-center flex flex-col items-center ${isEarned ? 'bg-slate-900 border-brand-500/30' : 'bg-slate-900/50 border-white/5 grayscale opacity-50'}`}
                        >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isEarned ? 'bg-brand-500/10 text-brand-500 shadow-lg shadow-brand-500/10' : 'bg-slate-800 text-slate-600'}`}>
                                <badge.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-sm font-black text-white leading-tight mb-1">{t(`badges.${badge.id}.name`)}</h3>
                            <p className="text-[10px] font-medium text-slate-500 leading-tight px-2">{t(`badges.${badge.id}.description`)}</p>

                            {isEarned && (
                                <div className="absolute top-3 right-3 text-brand-500">
                                    <IconCheckCircle className="w-4 h-4" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BadgesPage;
