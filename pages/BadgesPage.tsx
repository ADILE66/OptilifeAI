import React, { useMemo } from 'react';
import { Badge, BadgeTier } from '../types';
import { allBadges } from '../utils/badgeManager';
import { useTranslation } from '../i18n/i18n';
import { IconLock } from '../components/Icons';

interface BadgesPageProps {
    earnedBadgeIds: string[];
}

const tierColors: Record<BadgeTier, { bg: string; text: string; border: string }> = {
    bronze: { bg: 'bg-amber-900/20', text: 'text-amber-500', border: 'border-amber-500/20' },
    silver: { bg: 'bg-slate-800', text: 'text-slate-400', border: 'border-slate-700' },
    gold: { bg: 'bg-yellow-900/20', text: 'text-yellow-500', border: 'border-yellow-500/20' },
    platinum: { bg: 'bg-cyan-900/20', text: 'text-cyan-400', border: 'border-cyan-500/20' },
    diamond: { bg: 'bg-violet-900/20', text: 'text-violet-400', border: 'border-violet-500/20' },
    legendary: { bg: 'bg-red-900/20', text: 'text-red-500', border: 'border-red-500/20' },
};

const BadgesPage: React.FC<BadgesPageProps> = ({ earnedBadgeIds }) => {
    const { t } = useTranslation();

    const sortedBadges = useMemo(() => {
        const badgesWithStatus = allBadges.map(b => {
            const earnedIndex = earnedBadgeIds.indexOf(b.id);
            return {
                ...b,
                isEarned: earnedIndex !== -1,
                earnedIndex
            };
        });

        return badgesWithStatus.sort((a, b) => {
            // 1. Les badges obtenus en premier
            if (a.isEarned && !b.isEarned) return -1;
            if (!a.isEarned && b.isEarned) return 1;

            // 2. Si les deux sont obtenus, tri chronologique (selon l'ordre d'obtention dans earnedBadgeIds)
            if (a.isEarned && b.isEarned) {
                // Ordre chronologique (ancien -> récent)
                return a.earnedIndex - b.earnedIndex;
            }

            // 3. Si aucun n'est obtenu, on garde l'ordre par défaut (groupé par catégorie dans allBadges)
            return 0;
        });
    }, [earnedBadgeIds]);

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 rounded-2xl shadow-sm p-6 border border-slate-800 mb-8">
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-2">{t('badges.title')}</h2>
                    <p className="text-slate-400">{t('badges.subtitle')}</p>
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full text-sm font-semibold text-slate-300">
                        <span>{earnedBadgeIds.length} / {allBadges.length}</span>
                        <span>Débloqués</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {sortedBadges.map((badge) => {
                    const style = tierColors[badge.tier];
                    // Unearned style override logic inside render
                    const isEarned = badge.isEarned;

                    return (
                        <div
                            key={badge.id}
                            className={`relative p-4 rounded-2xl border-2 flex flex-col items-center text-center transition-all duration-300 ${isEarned ? `${style.bg} ${style.border}` : 'bg-slate-900 border-slate-800 opacity-50 grayscale'}`}
                        >
                            {!isEarned && (
                                <div className="absolute top-3 right-3 text-slate-600">
                                    <IconLock className="w-4 h-4" />
                                </div>
                            )}

                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${isEarned ? 'bg-slate-900 shadow-sm border border-slate-800' : 'bg-slate-800'}`}>
                                <badge.icon className={`w-8 h-8 ${isEarned ? style.text : 'text-slate-600'}`} />
                            </div>

                            <h3 className={`font-bold text-sm mb-1 ${isEarned ? 'text-white' : 'text-slate-500'}`}>
                                {t(badge.nameKey)}
                            </h3>
                            <p className="text-xs text-slate-500 line-clamp-2">
                                {t(badge.descriptionKey)}
                            </p>

                            {isEarned && (
                                <span className={`mt-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-slate-900/50 border border-current/10 ${style.text}`}>
                                    {badge.tier}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BadgesPage;