import React from 'react';
import { useAuth } from '../core/AuthContext';
import { IconWater, IconFire, IconActivity, IconClock, IconSparkles } from '../ui/Icons';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user, isPro } = useAuth();

    const stats = [
        { label: 'Hydratation', val: '1.2L', goal: '2.5L', icon: IconWater, color: 'text-blue-500', bg: 'bg-blue-500/10', to: '/water' },
        { label: 'Nutrition', val: '1,240', goal: '2,200', icon: IconFire, color: 'text-orange-500', bg: 'bg-orange-500/10', to: '/food' },
        { label: 'Mouvement', val: '45', goal: '60', icon: IconActivity, color: 'text-emerald-500', bg: 'bg-emerald-500/10', to: '/activity' },
        { label: 'Jeûne', val: '12h', goal: '16h', icon: IconClock, color: 'text-purple-500', bg: 'bg-purple-500/10', to: '/fasting' }
    ];

    return (
        <div className="space-y-12 animate-fade-in">
            <header>
                <h1 className="text-4xl font-black text-white">Bonjour, <span className="text-brand-500">{user?.email?.split('@')[0]}</span></h1>
                <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-xs">Voici votre cockpit de performance du jour</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Link
                        key={i}
                        to={stat.to}
                        className="bg-slate-900 border border-white/5 p-8 rounded-[2rem] hover:border-white/20 transition-all group relative overflow-hidden active:scale-95"
                    >
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-white">{stat.val}</span>
                            <span className="text-xs font-bold text-slate-500 uppercase">/ {stat.goal}</span>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-white/10 transition-colors" />
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-slate-900 to-black border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-brand-400 mb-4">
                            <IconSparkles className="w-5 h-5" />
                            <span className="text-xs font-black uppercase tracking-widest">Analyse IA</span>
                        </div>
                        <h3 className="text-2xl font-black text-white mb-4">Résumé de votre métabolisme</h3>
                        <p className="text-slate-400 leading-relaxed">
                            Votre hydratation est en hausse de <span className="text-blue-400 font-bold">15%</span> par rapport à hier.
                            Continuez ainsi pour optimiser votre clarté mentale cet après-midi.
                        </p>
                    </div>
                </div>

                <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] flex flex-col justify-center items-center text-center">
                    <p className="text-slate-500 font-bold mb-4 uppercase text-xs tracking-widest">Prochaine étape</p>
                    <h4 className="text-xl font-black text-white mb-6">Enregistrez votre déjeuner</h4>
                    <Link to="/food" className="px-8 py-4 bg-white text-black font-black rounded-2xl hover:bg-slate-200 transition-all text-sm uppercase">Ouvrir le module</Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
