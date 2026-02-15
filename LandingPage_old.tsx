
import * as React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/i18n';
import {
    IconSparkles,
    IconWater,
    IconActivity,
    IconClock,
    IconFire,
    IconMoon,
    IconCheckCircle,
    IconStar,
    IconChevronRight,
    IconCamera,
    IconMic,
    IconChefHat,
    IconChartBar,
    IconShield,
    IconCpu,
    IconX
} from '../components/Icons';

const LandingPage: React.FC = () => {
    const { t, language, setLanguage } = useTranslation();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const scrollToSection = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-slate-950 font-sans selection:bg-brand-500/30 selection:text-brand-200">
            {/* --- NAVIGATION --- */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 h-20">
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-500/20">O</div>
                        <span className="text-xl font-black text-white tracking-tighter">OptiLife<span className="text-brand-500">AI</span></span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#modules" onClick={(e) => scrollToSection(e, 'modules')} className="text-sm font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider">{t('landing.navModules')}</a>
                        <a href="#ia-power" onClick={(e) => scrollToSection(e, 'ia-power')} className="text-sm font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider">{t('landing.navAI')}</a>
                        <a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="text-sm font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider">{t('landing.navPricing')}</a>
                    </nav>

                    <div className="flex items-center gap-4">
                        <div className="flex gap-1 mr-2">
                            <button onClick={() => setLanguage('fr')} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border ${language === 'fr' ? 'border-brand-500 bg-brand-500/20 text-brand-400' : 'border-slate-800 bg-slate-900/50 text-slate-500 hover:text-white'}`}>FR</button>
                            <button onClick={() => setLanguage('en')} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border ${language === 'en' ? 'border-brand-500 bg-brand-500/20 text-brand-400' : 'border-slate-800 bg-slate-900/50 text-slate-500 hover:text-white'}`}>EN</button>
                            <button onClick={() => setLanguage('es')} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border ${language === 'es' ? 'border-brand-500 bg-brand-500/20 text-brand-400' : 'border-slate-800 bg-slate-900/50 text-slate-500 hover:text-white'}`}>ES</button>
                        </div>
                        <Link to="/login" className="hidden sm:block text-sm font-bold text-slate-400 hover:text-white">
                            {t('landing.headerLogin')}
                        </Link>
                        <Link to="/signup" className="bg-white text-slate-900 px-6 py-3 rounded-full font-black text-sm hover:scale-105 transition-all shadow-xl shadow-white/10">
                            {t('landing.ctaButton')}
                        </Link>
                    </div>
                </div>
            </header>

            <main className="pt-20">
                {/* --- HERO SECTION --- */}
                <section className="relative py-20 lg:py-32 overflow-hidden bg-slate-950">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-[100px] animate-pulse"></div>
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-pulse"></div>
                    </div>

                    <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8 border border-slate-800">
                            <IconSparkles className="w-3 h-3 text-brand-500" /> {t('landing.heroBadge')}
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[0.95] mb-10">
                            {t('landing.heroTitle').split('<1>')[0]}<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-purple-500">{t('landing.heroTitle').split('<1>')[1].split('</1>')[0]}</span>{t('landing.heroTitle').split('</1>')[1]}
                        </h1>

                        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 font-medium">
                            {t('landing.heroSubtitle')}
                        </p>

                        <div className="flex flex-col items-center gap-6">
                            <Link to="/signup" className="group relative px-10 py-6 bg-brand-600 text-white rounded-[2rem] font-black text-xl shadow-2xl hover:scale-105 transition-all flex items-center gap-3">
                                <span>{t('landing.heroButton')}</span>
                                <IconChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-widest">
                                <IconCheckCircle className="w-4 h-4" /> {t('landing.heroTrust')}
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- MODULES SECTION --- */}
                <section id="modules" className="py-24 bg-slate-900 scroll-mt-20">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight italic">5 Modules. Une Harmonie.</h2>
                            <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
                                La sant├® n'est pas un silo. Notre IA synchronise ces 5 piliers pour vous offrir une vision ├á 360┬░ que les autres applications ignorent.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <ModuleCard
                                icon={IconFire}
                                title="Nutrition Consciente"
                                description="Plus besoin de peser vos aliments. Prenez une photo, l'IA identifie les macros et les calories instantan├®ment."
                                benefit="├ëquilibre m├®tabolique"
                                color="text-orange-400"
                                bg="bg-orange-500/10"
                                image="/assets/images/module_nutrition.jpg"
                            />
                            <ModuleCard
                                icon={IconWater}
                                title="Hydratation Vitale"
                                description="Optimisez votre clart├® mentale. Un suivi intelligent qui s'adapte ├á votre activit├® physique et ├á la m├®t├®o."
                                benefit="Focus & ├ënergie"
                                color="text-blue-400"
                                bg="bg-blue-500/10"
                                image="/assets/images/module_hydration.jpg"
                            />
                            <ModuleCard
                                icon={IconActivity}
                                title="Mouvement & GPS"
                                description="Suivi en direct de vos s├®ances de sport avec podom├¿tre et trac├® GPS. Visualisez votre impact calorique r├®el."
                                benefit="Performance physique"
                                color="text-emerald-400"
                                bg="bg-emerald-500/10"
                                image="/assets/images/module_activity.jpg"
                            />
                            <ModuleCard
                                icon={IconClock}
                                title="Je├╗ne Rythmique"
                                description="Ma├«trisez vos cycles d'autophagie (16:8, OMAD) avec un minuteur intelligent et un suivi des phases m├®taboliques."
                                benefit="R├®g├®n├®ration cellulaire"
                                color="text-purple-400"
                                bg="bg-purple-500/10"
                                image="/assets/images/module_fasting.png"
                            />
                            <ModuleCard
                                icon={IconMoon}
                                title="Sommeil & R├®cup"
                                description="Analysez la qualit├® de vos nuits. L'IA corr├¿le votre sommeil avec votre alimentation pour optimiser votre repos."
                                benefit="R├®cup├®ration profonde"
                                color="text-indigo-400"
                                bg="bg-indigo-500/10"
                                image="/assets/images/module_sleep.jpg"
                            />
                            {/* IA Hub Card */}
                            <div className="bg-slate-800 rounded-[3rem] p-10 flex flex-col items-center text-center text-white justify-center shadow-2xl relative overflow-hidden group border border-slate-700">
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-600/30 to-purple-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-xl border border-white/20">
                                    <IconCpu className="w-10 h-10 text-brand-400 animate-pulse" />
                                </div>
                                <h3 className="text-2xl font-black mb-4 tracking-tight">Le C┼ôur : Intelligence Fusion</h3>
                                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                                    Notre algorithme propri├®taire lie vos 5 modules. Il d├®tecte pourquoi vous ├¬tes fatigu├® et ajuste vos objectifs en temps r├®el.
                                </p>
                                <Link to="/signup" className="bg-brand-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-500 transition-all shadow-lg shadow-brand-900/20">Activer mon Coach</Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- IA SHOWCASE SECTION --- */}
                <section id="ia-power" className="py-24 lg:py-32 bg-slate-950 scroll-mt-20 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col lg:flex-row items-center gap-20">
                            <div className="flex-1 text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 text-brand-400 text-[10px] font-black uppercase tracking-widest mb-6 border border-brand-500/20">
                                    <IconSparkles className="w-3 h-3" /> Technologie Google Gemini 3.0
                                </div>
                                <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-[1.05] tracking-tighter">
                                    Une IA qui comprend <br />
                                    <span className="text-brand-500 italic">vraiment</span> votre corps.
                                </h2>
                                <p className="text-slate-400 text-xl mb-10 font-medium leading-relaxed">
                                    Contrairement aux trackers classiques, OptiLife utilise des mod├¿les de vision et de langage multimodaux pour analyser vos habitudes complexes.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                                    <IAFeature
                                        title="Analyse Multimodale"
                                        desc="Envoyez une photo ou parlez ├á l'application. Elle comprend tout, du plat de p├ótes au sentiment de fatigue."
                                    />
                                    <IAFeature
                                        title="Pr├®dictions Sant├®"
                                        desc="L'IA anticipe vos baisses d'├®nergie bas├®es sur votre hydratation et votre sommeil des 48 derni├¿res heures."
                                    />
                                    <IAFeature
                                        title="Chef IA Personnalis├®"
                                        desc="G├®n├®rez des recettes bas├®es sur vos macros manquantes et ce qu'il reste dans votre frigo."
                                    />
                                    <IAFeature
                                        title="Coaching Vocal"
                                        desc="Dictez vos repas pendant que vous cuisinez. L'IA s'occupe de la saisie et des calculs."
                                    />
                                </div>
                            </div>

                            <div className="flex-1 relative">
                                <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-[120px] animate-pulse"></div>
                                <div className="relative bg-slate-900 p-8 rounded-[4rem] shadow-2xl border-8 border-slate-800 transform rotate-3 hover:rotate-0 transition-transform duration-700">
                                    <div className="aspect-[4/5] bg-slate-800 rounded-[3rem] overflow-hidden relative group">
                                        <img
                                            src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=1200"
                                            className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000"
                                            alt="AI Analysis Interface"
                                        />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-10">
                                            <div className="w-full bg-slate-900/80 backdrop-blur-md border border-white/10 p-6 rounded-3xl mb-4 transform -translate-y-4">
                                                <div className="flex gap-4 items-center mb-3">
                                                    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg"><IconFire className="w-6 h-6" /></div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase">Analyse IA</p>
                                                        <p className="font-bold text-white">Salade de Quinoa & Avocat</p>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between text-white font-black text-xs">
                                                    <span>450 kcal</span>
                                                    <span className="text-emerald-400">P: 18g</span>
                                                    <span className="text-amber-400">G: 42g</span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-brand-600 p-4 rounded-2xl flex items-center gap-3 shadow-2xl">
                                                <IconMic className="w-5 h-5 text-white animate-bounce" />
                                                <p className="text-[10px] font-black text-white uppercase tracking-widest">IA en ├®coute...</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- PRICING SECTION --- */}
                <section id="pricing" className="py-24 lg:py-32 bg-slate-900 scroll-mt-20">
                    <div className="max-w-5xl mx-auto px-6 text-center">
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">Investissez dans votre long├®vit├®.</h2>
                        <p className="text-slate-400 text-lg mb-16 max-w-2xl mx-auto font-medium">Une tarification simple pour des r├®sultats durables. Commencez gratuitement et passez ├á Pro quand vous ├¬tes pr├¬t.</p>

                        <div className="flex items-center justify-center gap-4 mb-20 bg-slate-800 p-2 rounded-2xl w-fit mx-auto shadow-sm border border-slate-700">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white'}`}
                            >
                                Mensuel
                            </button>
                            <button
                                onClick={() => setBillingCycle('yearly')}
                                className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${billingCycle === 'yearly' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white'}`}
                            >
                                Annuel <span className="text-emerald-500 ml-1">(-20%)</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto items-stretch">
                            {/* Free Plan */}
                            <div className="bg-slate-950 p-12 rounded-[3.5rem] border border-slate-800 shadow-xl flex flex-col text-left group hover:-translate-y-2 transition-transform duration-500">
                                <div className="mb-8">
                                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-4">Essentiel</p>
                                    <div className="text-6xl font-black text-white tracking-tighter italic">0Ôé¼</div>
                                    <p className="text-slate-400 font-medium text-sm mt-2">Pour d├®buter sa transformation.</p>
                                </div>
                                <ul className="space-y-5 mb-12 flex-1">
                                    <PricingItem text="Suivi manuel des 5 modules" />
                                    <PricingItem text="Objectifs quotidiens de base" />
                                    <PricingItem text="Historique sur 7 jours" />
                                    <PricingItem text="Insignes & Succ├¿s" />
                                    <PricingItem text="Acc├¿s Web & Mobile" disabled />
                                </ul>
                                <Link to="/signup" className="block w-full py-5 text-center border-2 border-slate-700 rounded-3xl font-black text-slate-400 hover:bg-white hover:text-slate-900 hover:border-white transition-all uppercase tracking-widest text-xs">
                                    Commencer Gratuitement
                                </Link>
                            </div>

                            {/* Pro Plan */}
                            <div className="bg-slate-800 p-12 rounded-[3.5rem] border border-slate-700 shadow-2xl relative overflow-hidden flex flex-col text-left transform lg:scale-105 z-10 group">
                                <div className="absolute top-0 right-0 bg-brand-600 text-white px-8 py-3 rounded-bl-3xl font-black text-[10px] uppercase tracking-widest shadow-lg">Recommand├®</div>
                                <div className="mb-8">
                                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-4">Coaching Premium</p>
                                    <div className="flex items-end gap-2">
                                        <span className="text-7xl font-black text-white tracking-tighter italic">{billingCycle === 'monthly' ? '9' : '7'}Ôé¼</span>
                                        <span className="text-slate-400 font-bold mb-3 text-lg">/ mois</span>
                                    </div>
                                    <p className="text-slate-300 font-medium text-sm mt-2">Le coach d'├®lite dans votre poche.</p>
                                </div>
                                <ul className="space-y-5 mb-12 flex-1">
                                    <PricingItem text="Analyse IA Multimodale (Photo/Voix)" pro />
                                    <PricingItem text="Chef IA & G├®n├®rateur de Recettes" pro />
                                    <PricingItem text="Historique & Statistiques Illimit├®s" pro />
                                    <PricingItem text="Mode GPS & Sport en temps r├®el" pro />
                                    <PricingItem text="Analyses de tendances IA hebdo" pro />
                                    <PricingItem text="Acc├¿s prioritaire aux nouveaut├®s" pro />
                                </ul>
                                <Link to="/signup" className="block w-full py-6 text-center bg-brand-600 text-white rounded-3xl font-black text-lg hover:bg-brand-500 transition-all shadow-2xl shadow-brand-900/40 uppercase tracking-widest">
                                    Devenir Membre Pro
                                </Link>
                                <p className="text-center text-[10px] font-bold text-slate-500 mt-4 uppercase tracking-tighter italic">7 jours d'essai offerts &middot; Annulable en 1 clic</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- FOOTER CTA --- */}
                <section className="py-24 text-center bg-slate-950 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-grid-white/10"></div>
                    <div className="max-w-4xl mx-auto px-6 relative z-10">
                        <h2 className="text-4xl md:text-7xl font-black text-white mb-10 tracking-tighter leading-tight italic">Red├®finissez vos limites. <br />D├¿s aujourd'hui.</h2>
                        <p className="text-slate-400 text-xl mb-14 font-medium max-w-2xl mx-auto">Rejoignez 15,000+ utilisateurs qui ont repris le contr├┤le de leur vitalit├® avec l'IA.</p>
                        <Link to="/signup" className="group inline-flex items-center gap-6 px-14 py-8 bg-white text-slate-900 rounded-[2.5rem] font-black text-2xl hover:scale-105 transition-all shadow-2xl">
                            Essayer gratuitement
                            <IconChevronRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="bg-slate-950 py-20 border-t border-slate-900">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
                        <div>
                            <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 font-black text-2xl shadow-lg">O</div>
                                <span className="text-2xl font-black text-white tracking-tighter">OptiLife<span className="text-brand-500">AI</span></span>
                            </div>
                            <p className="text-slate-400 font-medium text-sm max-w-xs">L'application de sant├® la plus avanc├®e au monde, con├ºue pour votre long├®vit├®.</p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-12">
                            <FooterNav column="Produit" links={[
                                { label: 'Modules', path: '#modules', isScroll: true },
                                { label: 'Technologie', path: '#ia-power', isScroll: true },
                                { label: 'Tarifs', path: '/pricing' }
                            ]} />
                            <FooterNav column="L├®gal" links={[
                                { label: 'Mentions L├®gales', path: '/legal' },
                                { label: 'Confidentialit├®', path: '/privacy' },
                                { label: 'CGU / CGV', path: '/terms' }
                            ]} />
                            <FooterNav column="Compte" links={[
                                { label: 'Se connecter', path: '/login' },
                                { label: "S'inscrire", path: '/signup' }
                            ]} />
                        </div>
                    </div>
                    <div className="mt-20 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-slate-600 font-bold text-[10px] uppercase tracking-widest">┬® 2024 OptiLife AI. Tous droits r├®serv├®s.</p>
                        <div className="flex gap-6">
                            <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-slate-600 hover:text-brand-500 transition-colors cursor-pointer"><IconShield className="w-4 h-4" /></div>
                            <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-slate-600 hover:text-brand-500 transition-colors cursor-pointer"><IconStar className="w-4 h-4" /></div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const ModuleCard: React.FC<{ icon: any, title: string, description: string, benefit: string, color: string, bg: string, image: string }> = ({ icon: Icon, title, description, benefit, color, bg, image }) => (
    <div className="group bg-slate-800 rounded-[3.5rem] border border-slate-700 overflow-hidden hover:shadow-2xl hover:shadow-brand-900/20 transition-all duration-700 flex flex-col">
        <div className="h-64 w-full overflow-hidden relative bg-slate-900">
            <img
                src={image}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-80"
                loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
            <div className="absolute bottom-6 left-6 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                <p className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{benefit}</p>
            </div>
        </div>
        <div className="p-10 flex-1 flex flex-col items-center text-center">
            <div className={`w-16 h-16 ${bg} ${color} rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:rotate-12 transition-transform duration-500 border border-white/5`}>
                <Icon className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{title}</h3>
            <p className="text-slate-400 font-medium leading-relaxed text-sm">{description}</p>
        </div>
    </div>
);

const IAFeature: React.FC<{ title: string, desc: string }> = ({ title, desc }) => (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:bg-brand-900/20 hover:border-brand-500/30 transition-all group">
        <h4 className="font-black text-white mb-2 text-sm uppercase tracking-tighter italic group-hover:text-brand-400 transition-colors">{title}</h4>
        <p className="text-slate-400 text-xs font-medium leading-relaxed">{desc}</p>
    </div>
);

const PricingItem: React.FC<{ text: string, disabled?: boolean, pro?: boolean }> = ({ text, disabled, pro }) => (
    <li className={`flex items-center gap-3 text-sm font-bold ${disabled ? 'text-slate-600' : 'text-inherit'} ${pro ? 'text-white' : 'text-slate-400'}`}>
        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${disabled ? 'bg-slate-800' : (pro ? 'bg-brand-500' : 'bg-emerald-500/20')}`}>
            {disabled ? <IconX className="w-3 h-3 text-slate-600" /> : <IconCheckCircle className={`w-3 h-3 ${pro ? 'text-white' : 'text-emerald-500'}`} />}
        </div>
        <span className={disabled ? 'line-through' : ''}>{text}</span>
    </li>
);

interface FooterLinkDef {
    label: string;
    path: string;
    isScroll?: boolean;
}

const FooterNav: React.FC<{ column: string, links: FooterLinkDef[] }> = ({ column, links }) => {
    const scrollTo = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id.replace('#', ''));
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <p className="text-[10px] font-black text-white uppercase tracking-widest">{column}</p>
            {links.map((link, i) => (
                link.isScroll ? (
                    <a key={i} href={link.path} onClick={(e) => scrollTo(e, link.path)} className="text-slate-500 hover:text-brand-500 transition-colors text-sm font-bold">{link.label}</a>
                ) : (
                    <Link key={i} to={link.path} className="text-slate-500 hover:text-brand-500 transition-colors text-sm font-bold">{link.label}</Link>
                )
            ))}
        </div>
    );
};

export default LandingPage;
