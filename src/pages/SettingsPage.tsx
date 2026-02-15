import React, { useState } from 'react';
import { useAuth } from '../core/AuthContext';
import { useTranslation } from '../i18n/i18n';
import { IconUser, IconShield, IconBell, IconStar, IconLogOut } from '../ui/Icons';

const SettingsPage = () => {
    const { t, language, setLanguage } = useTranslation();
    const { currentUser, logout, isProMember } = useAuth();
    const [notifications, setNotifications] = useState(true);

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            <header>
                <h1 className="text-4xl font-black text-white">{t('nav.settings')}</h1>
                <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-xs">Gérez vos préférences et votre compte</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-8">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-24 h-24 bg-slate-800 rounded-3xl flex items-center justify-center text-slate-600 border border-white/5">
                                <IconUser className="w-12 h-12" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white">{currentUser?.email?.split('@')[0]}</h3>
                                <p className="text-slate-500 font-bold">{currentUser?.email}</p>
                                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-brand-500/10 text-brand-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-500/20">
                                    {isProMember ? 'Membre Premium' : 'Utilisateur Gratuit'}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Langue / Language</label>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value as any)}
                                    className="w-full bg-slate-800 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/50 appearance-none"
                                >
                                    <option value="fr">Français 🇫🇷</option>
                                    <option value="en">English 🇺🇸</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-8">
                        <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3">
                            <IconBell className="w-5 h-5 text-amber-500" />
                            Notifications
                        </h3>
                        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-white/5">
                            <div>
                                <p className="font-bold text-white">Rappels d'hydratation</p>
                                <p className="text-xs text-slate-500 mt-1">Notifications push toutes les 2 heures</p>
                            </div>
                            <button
                                onClick={() => setNotifications(!notifications)}
                                className={`w-12 h-6 rounded-full transition-all relative ${notifications ? 'bg-emerald-500' : 'bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>
                    </section>
                </div>

                {/* Account Actions */}
                <div className="space-y-6">
                    <button className="w-full p-6 bg-slate-900 border border-white/5 rounded-[2rem] flex items-center justify-between group hover:border-brand-500/30 transition-all text-left">
                        <div className="flex items-center gap-4">
                            <IconShield className="w-6 h-6 text-brand-500" />
                            <span className="font-bold text-white">Sécurité & MDP</span>
                        </div>
                        <IconStar className="w-4 h-4 text-slate-700 group-hover:text-brand-500 transition-colors" />
                    </button>

                    {!isProMember && (
                        <div className="p-8 bg-gradient-to-br from-brand-600 to-indigo-600 rounded-[2rem] shadow-xl text-white">
                            <h4 className="text-xl font-black italic mb-2">MODE PRO</h4>
                            <p className="text-sm font-bold opacity-80 mb-6 leading-relaxed">Débloquez l'IA avancée, le GPS Live et les statistiques illimitées.</p>
                            <button className="w-full py-4 bg-white text-brand-600 font-black rounded-xl hover:bg-slate-100 transition-all uppercase tracking-widest text-xs">Découvrir l'offre</button>
                        </div>
                    )}

                    <button
                        onClick={logout}
                        className="w-full p-6 bg-red-600/10 border border-red-500/10 rounded-[2rem] flex items-center gap-4 text-red-500 font-black hover:bg-red-600 hover:text-white transition-all"
                    >
                        <IconLogOut className="w-6 h-6" />
                        <span>DÉCONNEXION</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
