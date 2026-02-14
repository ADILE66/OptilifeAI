import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconCheckCircle, IconX, IconStar, IconChevronLeft } from '../components/Icons';

const PricingItem: React.FC<{ text: string, disabled?: boolean, pro?: boolean }> = ({ text, disabled, pro }) => (
    <li className={`flex items-center gap-3 text-sm font-bold ${disabled ? 'text-slate-300' : 'text-inherit'} ${pro ? 'text-white' : 'text-slate-600'}`}>
        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${disabled ? 'bg-slate-100' : (pro ? 'bg-brand-500' : 'bg-emerald-100')}`}>
            {disabled ? <IconX className="w-3 h-3 text-slate-300" /> : <IconCheckCircle className={`w-3 h-3 ${pro ? 'text-white' : 'text-emerald-500'}`} />}
        </div>
        <span className={disabled ? 'line-through' : ''}>{text}</span>
    </li>
);

const FaqItem: React.FC<{ q: string, a: string }> = ({ q, a }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h4 className="font-bold text-slate-900 mb-2">{q}</h4>
        <p className="text-slate-500 text-sm font-medium leading-relaxed">{a}</p>
    </div>
);

const PricingPage: React.FC = () => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    return (
        <div className="min-h-screen bg-slate-950 font-sans selection:bg-brand-500/30 selection:text-brand-200 pb-20 text-slate-100">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white font-bold transition-colors">
                    <IconChevronLeft className="w-5 h-5" /> Retour
                </Link>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-lg shadow-brand-500/20">O</div>
                    <span className="text-lg font-black text-white tracking-tighter">OptiLife<span className="text-brand-500">AI</span></span>
                </div>
                <div className="w-20"></div> {/* Spacer */}
            </div>

            <div className="max-w-5xl mx-auto px-6 text-center mt-10">
                <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">Investissez dans votre <span className="text-brand-500">longévité</span>.</h1>
                <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto font-medium">Une tarification simple pour des résultats durables. Commencez gratuitement et passez à Pro quand vous êtes prêt.</p>

                <div className="flex items-center justify-center gap-4 mb-16 bg-slate-900 p-2 rounded-2xl w-fit mx-auto shadow-sm border border-slate-800">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${billingCycle === 'monthly' ? 'bg-slate-800 text-white shadow-xl ring-1 ring-slate-700' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Mensuel
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${billingCycle === 'yearly' ? 'bg-slate-800 text-white shadow-xl ring-1 ring-slate-700' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Annuel <span className="text-emerald-400 ml-1">(-20%)</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto items-start">
                    {/* Free Plan */}
                    <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 shadow-xl flex flex-col text-left group hover:-translate-y-2 transition-transform duration-500 relative">
                        <div className="mb-8">
                            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-4">Essentiel</p>
                            <div className="text-5xl font-black text-white tracking-tighter italic">0€</div>
                            <p className="text-slate-400 font-medium text-sm mt-2">Pour débuter sa transformation.</p>
                        </div>
                        <ul className="space-y-4 mb-10 flex-1">
                            <PricingItem text="Suivi manuel des 5 modules" />
                            <PricingItem text="Objectifs quotidiens de base" />
                            <PricingItem text="Historique sur 7 jours" />
                            <PricingItem text="Insignes & Succès" />
                            <PricingItem text="Accès Web & Mobile" disabled />
                        </ul>
                        <Link to="/signup" className="block w-full py-4 text-center border-2 border-slate-700 rounded-2xl font-black text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all uppercase tracking-widest text-xs">
                            Commencer Gratuitement
                        </Link>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-slate-800 p-10 rounded-[2.5rem] border border-slate-700 shadow-2xl relative overflow-hidden flex flex-col text-left transform md:scale-105 z-10 group">
                        <div className="absolute top-0 right-0 bg-brand-600 text-white px-6 py-2 rounded-bl-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-500/20">Recommandé</div>
                        <div className="mb-8">
                            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-4">Coaching Premium</p>
                            <div className="flex items-end gap-2">
                                <span className="text-6xl font-black text-white tracking-tighter italic">{billingCycle === 'monthly' ? '9' : '7'}€</span>
                                <span className="text-slate-400 font-bold mb-3 text-lg">/ mois</span>
                            </div>
                            <p className="text-slate-300 font-medium text-sm mt-2">Le coach d'élite dans votre poche.</p>
                        </div>
                        <ul className="space-y-4 mb-10 flex-1">
                            <PricingItem text="Analyse IA Multimodale (Photo/Voix)" pro />
                            <PricingItem text="Chef IA & Générateur de Recettes" pro />
                            <PricingItem text="Historique & Statistiques Illimités" pro />
                            <PricingItem text="Mode GPS & Sport en temps réel" pro />
                            <PricingItem text="Analyses de tendances IA hebdo" pro />
                            <PricingItem text="Accès prioritaire aux nouveautés" pro />
                        </ul>
                        <Link to="/signup" className="block w-full py-5 text-center bg-brand-600 text-white rounded-2xl font-black text-sm hover:bg-brand-500 transition-all shadow-xl shadow-brand-600/40 uppercase tracking-widest">
                            Devenir Membre Pro <IconStar className="inline w-4 h-4 ml-1 mb-0.5" />
                        </Link>
                        <p className="text-center text-[10px] font-bold text-slate-500 mt-4 uppercase tracking-tighter italic">7 jours d'essai offerts &middot; Annulable en 1 clic</p>
                    </div>
                </div>

                {/* FAQ / Trust */}
                <div className="mt-24 max-w-3xl mx-auto text-left">
                    <h3 className="text-2xl font-black text-white mb-8 text-center uppercase tracking-tight">Questions Fréquentes</h3>
                    <div className="grid gap-6">
                        <FaqItem q="Puis-je annuler à tout moment ?" a="Oui, absolument. Si vous annulez votre abonnement Pro, vous conserverez l'accès jusqu'à la fin de la période payée, puis votre compte repassera en version gratuite." />
                        <FaqItem q="Comment fonctionne l'essai gratuit ?" a="Vous avez accès à toutes les fonctionnalités Pro pendant 7 jours. Vous ne serez débité qu'à la fin de cette période. Nous vous enverrons un rappel avant." />
                        <FaqItem q="Mes données sont-elles privées ?" a="Oui. Vos données de santé sont chiffrées et ne sont jamais partagées avec des tiers publicitaires. Vous pouvez exporter ou supprimer vos données à tout moment." />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
