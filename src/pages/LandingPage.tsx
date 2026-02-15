import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-brand-500/30">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center font-black text-xl">O</div>
                        <span className="text-xl font-black tracking-tighter">OptiLife <span className="text-brand-500">AI</span></span>
                    </div>
                    <nav className="hidden md:flex gap-8 text-sm font-bold text-slate-400">
                        <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
                        <a href="#pricing" className="hover:text-white transition-colors">Tarifs</a>
                    </nav>
                    <Link to="/login" className="px-6 py-2 bg-white text-black font-black rounded-lg hover:bg-slate-200 transition-all text-sm uppercase tracking-wider">Connexion</Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
                    <div className="inline-block px-4 py-1.5 rounded-full border border-brand-500/20 bg-brand-500/5 text-brand-400 text-xs font-bold uppercase tracking-widest">
                        🚀 La V2 est arrivée
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter">
                        Optimisez votre vie grâce à <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">l'IA prédictive</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Le premier cockpit de santé intelligent qui synchronise votre nutrition, votre sommeil et votre activité physique en un seul dashboard.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Link to="/signup" className="px-10 py-5 bg-brand-600 hover:bg-brand-500 text-white font-black rounded-2xl shadow-xl shadow-brand-500/20 transition-all active:scale-95 text-lg">Démarrer l'essai gratuit</Link>
                        <a href="#demo" className="px-10 py-5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-black rounded-2xl transition-all text-lg">Voir la démo</a>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LandingPage;
