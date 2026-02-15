import React, { useState } from 'react';
import { useAuth } from '../core/AuthContext';
import { useTranslation } from '../i18n/i18n';
import { IconUser, IconShield, IconBell, IconStar, IconLogOut } from '../ui/Icons';
import { UserGoals, UserProfile, User } from '../types';

interface SettingsPageProps {
    goals: UserGoals;
    onGoalsChange: (goals: Partial<UserGoals>) => void;
    profile: UserProfile;
    onProfileChange: (profile: Partial<UserProfile>) => void;
    updateCurrentUser: (u: Partial<User>) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ goals, onGoalsChange, profile, onProfileChange, updateCurrentUser }) => {
    const { t, language, setLanguage } = useTranslation();
    const { currentUser, logout, isProMember } = useAuth();
    const [notifications, setNotifications] = useState(true);

    const handleGoalChange = (key: keyof UserGoals, val: string) => {
        const num = parseInt(val);
        if (!isNaN(num)) onGoalsChange({ [key]: num });
    };

    const handleProfileChange = (key: keyof UserProfile, val: string) => {
        const num = parseInt(val);
        if (!isNaN(num)) onProfileChange({ [key]: num });
    };

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            <header>
                <h1 className="text-4xl font-black text-white">{t('nav.settings')}</h1>
                <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-xs">Gérez vos préférences et objectifs</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-12">
                    {/* Account Section */}
                    <section className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
                        <div className="flex items-center gap-8 mb-10">
                            <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] flex items-center justify-center text-slate-500 border border-white/5 shadow-inner">
                                <IconUser className="w-12 h-12" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-white tracking-tight">{currentUser?.email?.split('@')[0]}</h3>
                                <p className="text-slate-500 font-bold mb-3">{currentUser?.email}</p>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-500/10 text-brand-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-500/20">
                                    {isProMember ? 'Membre Premium' : 'Utilisateur Gratuit'}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Langue / Language</label>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value as any)}
                                    className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/50 appearance-none transition-all hover:bg-slate-800"
                                >
                                    <option value="fr">Français 🇫🇷</option>
                                    <option value="en">English 🇺🇸</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Âge</label>
                                <input
                                    type="number"
                                    value={profile.age || ''}
                                    onChange={(e) => handleProfileChange('age', e.target.value)}
                                    className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Goals Section */}
                    <section className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
                        <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                            <IconStar className="w-6 h-6 text-brand-500" />
                            Objectifs Quotidiens
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: 'Calories (kcal)', key: 'calories', val: goals.calories },
                                { label: 'Protéines (g)', key: 'protein', val: goals.protein },
                                { label: 'Glucides (g)', key: 'carbs', val: goals.carbs },
                                { label: 'Lipides (g)', key: 'fat', val: goals.fat },
                                { label: 'Eau (ml)', key: 'waterMl', val: goals.waterMl },
                                { label: 'Activité (min)', key: 'activityMinutes', val: goals.activityMinutes },
                                { label: 'Jeûne (h)', key: 'fastingHours', val: goals.fastingHours },
                                { label: 'Sommeil (h)', key: 'sleepHours', val: goals.sleepHours },
                                { label: 'Poids Cible (kg)', key: 'weight', val: goals.weight || '' },
                            ].map((g) => (
                                <div key={g.key} className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">{g.label}</label>
                                    <input
                                        type="number"
                                        value={g.val}
                                        onChange={(e) => handleGoalChange(g.key as any, e.target.value)}
                                        className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Notifications */}
                    <section className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
                        <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                            <IconBell className="w-6 h-6 text-amber-500" />
                            Notifications
                        </h3>
                        <div className="flex items-center justify-between p-6 bg-slate-800/50 rounded-[2rem] border border-white/5">
                            <div>
                                <p className="font-bold text-white text-lg">Alertes de Santé</p>
                                <p className="text-sm text-slate-500 mt-1">Rappels intelligents basés sur vos objectifs</p>
                            </div>
                            <button
                                onClick={() => setNotifications(!notifications)}
                                className={`w-14 h-7 rounded-full transition-all relative ${notifications ? 'bg-brand-500 shadow-[0_0_15px_rgba(var(--brand-500),0.4)]' : 'bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${notifications ? 'right-1' : 'left-1 shadow-md'}`} />
                            </button>
                        </div>
                    </section>
                </div>

                <div className="space-y-6">
                    <button className="w-full p-8 bg-slate-900 border border-white/5 rounded-[2.5rem] flex items-center justify-between group hover:border-brand-500/30 transition-all text-left shadow-xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-all">
                                <IconShield className="w-6 h-6" />
                            </div>
                            <span className="font-black text-white uppercase tracking-widest text-xs">Sécurité</span>
                        </div>
                        <IconStar className="w-4 h-4 text-slate-700 group-hover:text-brand-500 transition-colors" />
                    </button>

                    {!isProMember && (
                        <div className="p-10 bg-gradient-to-br from-brand-600 to-indigo-700 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <h4 className="text-2xl font-black italic mb-2 tracking-tighter">OPTI PRO</h4>
                                <p className="text-sm font-bold opacity-80 mb-8 leading-relaxed">Débloquez l'IA Premium, le GPS et les analyses métaboliques avancées.</p>
                                <button className="w-full py-5 bg-white text-brand-600 font-black rounded-2xl hover:bg-slate-100 transition-all uppercase tracking-widest text-xs shadow-lg">PASSER À PRO</button>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 rounded-full" />
                        </div>
                    )}

                    <button
                        onClick={logout}
                        className="w-full p-8 bg-red-600/5 border border-red-500/10 rounded-[2.5rem] flex items-center gap-4 text-red-500 font-black hover:bg-red-600 hover:text-white transition-all shadow-xl"
                    >
                        <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center transition-all group-hover:bg-white/20">
                            <IconLogOut className="w-6 h-6" />
                        </div>
                        <span className="uppercase tracking-widest text-xs">DÉCONNEXION</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
