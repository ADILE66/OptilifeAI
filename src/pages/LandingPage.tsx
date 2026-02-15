import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/i18n';
import { IconSparkles, IconCheckCircle, IconFire, IconWater, IconActivity, IconClock } from '../ui/Icons';

const LandingPage = () => {
    const { t } = useTranslation();

    return (
        <div className="bg-slate-950 min-h-screen text-white overflow-hidden selection:bg-brand-500 selection:text-white">
            {/* Header / Nav */}
            <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center relative z-50">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center font-black italic text-xl">O</div>
                    <span className="text-xl font-black tracking-tighter">OptiLife AI</span>
                </div>
                <div className="flex items-center gap-8">
                    <Link to="/login" className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-sm transition-all border border-white/5 uppercase tracking-widest">{t('landing.headerLogin')}</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-20 pb-40 px-6">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl aspect-square bg-brand-600/20 blur-[150px] -mt-1/2 rounded-full pointer-events-none" />

                <div className="max-w-5xl mx-auto text-center relative z-10 space-y-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 text-brand-500 rounded-full text-xs font-black uppercase tracking-[0.2em] border border-brand-500/20 shadow-[0_0_20px_rgba(var(--brand-500),0.1)]">
                        <IconSparkles className="w-4 h-4" /> {t('landing.heroBadge')}
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                        {t('landing.heroTitle').split('<1>')[0]}
                        <br />
                        <span className="text-brand-500">{t('landing.heroTitle').split('<1>')[1].replace('</1>', '')}</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-slate-500 font-bold text-lg md:text-xl leading-relaxed">
                        {t('landing.heroSubtitle')}
                    </p>

                    <div className="flex flex-col items-center gap-6">
                        <Link to="/login" className="px-12 py-6 bg-white text-black font-black rounded-[2.5rem] shadow-2xl hover:scale-105 transition-all active:scale-95 text-xl tracking-wide uppercase">
                            {t('landing.heroButton')}
                        </Link>
                        <p className="text-slate-600 text-xs font-black uppercase tracking-widest">
                            {t('landing.heroTrust')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Feature Bento Grid */}
            <section className="max-w-7xl mx-auto px-6 pb-40 grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2 bg-slate-900 border border-white/5 p-10 rounded-[3rem] space-y-6">
                    <IconFire className="w-12 h-12 text-orange-500" />
                    <h3 className="text-3xl font-black text-white">{t('landing.feature1Title')}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">{t('landing.feature1Desc')}</p>
                </div>
                <div className="bg-slate-900 border border-white/5 p-10 rounded-[3rem] space-y-6">
                    <IconWater className="w-10 h-10 text-blue-500" />
                    <h3 className="text-xl font-black text-white">{t('landing.feature2Title')}</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{t('landing.feature2Desc')}</p>
                </div>
                <div className="bg-slate-900 border border-white/5 p-10 rounded-[3rem] space-y-6">
                    <IconActivity className="w-10 h-10 text-emerald-500" />
                    <h3 className="text-xl font-black text-white">{t('landing.feature3Title')}</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{t('landing.feature3Desc')}</p>
                </div>
            </section>

            {/* Final CTA */}
            <section className="bg-slate-900 border-t border-white/5 py-40 px-6 text-center">
                <div className="max-w-3xl mx-auto space-y-8">
                    <h2 className="text-5xl font-black text-white">{t('landing.ctaTitle')}</h2>
                    <p className="text-slate-500 font-bold text-lg">{t('landing.ctaSubtitle')}</p>
                    <Link to="/login" className="inline-block px-10 py-5 bg-brand-600 hover:bg-brand-500 text-white font-black rounded-2xl shadow-xl shadow-brand-600/20 transition-all uppercase tracking-widest text-sm">
                        {t('landing.ctaButton')}
                    </Link>
                </div>
            </section>

            <footer className="py-20 text-center border-t border-white/5">
                <p className="text-slate-700 font-black uppercase tracking-widest text-[10px]">{t('landing.footer')}</p>
            </footer>
        </div>
    );
};

export default LandingPage;
