import React from 'react';
import { useAuth } from '../core/AuthContext';

const Dashboard = () => {
    const { user, logout, isPro } = useAuth();

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-12">
                <header className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black text-white">Dashboard</h1>
                        <p className="text-slate-500 mt-2 font-bold tracking-wide uppercase text-xs">Bienvenue, {user?.email}</p>
                    </div>
                    <button onClick={logout} className="px-4 py-2 bg-red-600/10 text-red-500 font-bold border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-all text-sm">Déconnexion</button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Placeholder Stat Cards */}
                    {[
                        { label: 'Eau', val: '2.5L', color: 'bg-blue-500' },
                        { label: 'Calories', val: '1,840', color: 'bg-orange-500' },
                        { label: 'Sommeil', val: '7h45', color: 'bg-purple-500' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-slate-900 border border-white/5 p-8 rounded-3xl shadow-xl animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">{stat.label}</p>
                            <h3 className="text-3xl font-black text-white">{stat.val}</h3>
                            <div className={`w-full h-1 ${stat.color} mt-6 rounded-full opacity-20`} />
                        </div>
                    ))}
                </div>

                {isPro && (
                    <div className="bg-gradient-to-r from-brand-600 to-indigo-600 p-8 rounded-3xl text-white shadow-2xl">
                        <h3 className="text-xl font-black italic">MEMBER PRO</h3>
                        <p className="mt-1 font-bold opacity-80">Merci de soutenir OptiLife AI v2.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
