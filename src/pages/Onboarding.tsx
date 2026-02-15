import React, { useState } from 'react';
import { useTranslation } from '../i18n/i18n';
import { IconCheckCircle, IconChevronRight, IconSparkles } from '../ui/Icons';

const Onboarding = ({ onComplete }: { onComplete: () => void }) => {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [data, setData] = useState<any>({ goal: '', gender: '', age: '', weight: '', height: '' });

    const totalSteps = 4;

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1);
        else onComplete();
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-xl space-y-12">
                {/* Progress Bar */}
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-brand-500 shadow-[0_0_10px_rgba(var(--brand-500),0.5)]' : 'bg-slate-800'}`} />
                    ))}
                </div>

                {step === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <header className="space-y-2">
                            <h2 className="text-4xl font-black text-white">{t('onboarding.step1Title')}</h2>
                            <p className="text-slate-500 font-bold">{t('onboarding.step1Subtitle')}</p>
                        </header>
                        <div className="grid grid-cols-1 gap-4">
                            {['weight_loss', 'muscle_gain', 'energy', 'longevity'].map(g => (
                                <button
                                    key={g}
                                    onClick={() => { setData({ ...data, goal: g }); nextStep(); }}
                                    className={`p-6 rounded-3xl border text-left transition-all ${data.goal === g ? 'bg-brand-500/10 border-brand-500 shadow-xl' : 'bg-slate-900 border-white/5 hover:border-white/20'}`}
                                >
                                    <h4 className="font-black text-white text-lg">{t(`onboarding.goals.${g}.title`)}</h4>
                                    <p className="text-sm text-slate-500 font-medium">{t(`onboarding.goals.${g}.desc`)}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <header className="space-y-2">
                            <h2 className="text-4xl font-black text-white">{t('onboarding.step4Title')}</h2>
                            <p className="text-slate-500 font-bold">{t('onboarding.step4Subtitle')}</p>
                        </header>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">{t('settings.age')}</label>
                                <input type="number" value={data.age} onChange={e => setData({ ...data, age: e.target.value })} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">{t('settings.gender')}</label>
                                <select value={data.gender} onChange={e => setData({ ...data, gender: e.target.value })} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 appearance-none">
                                    <option value="">{t('settings.selectGender')}</option>
                                    <option value="male">Homme</option>
                                    <option value="female">Femme</option>
                                </select>
                            </div>
                        </div>
                        <button onClick={nextStep} className="w-full py-6 bg-brand-600 hover:bg-brand-500 text-white font-black rounded-[2rem] shadow-xl shadow-brand-500/20 flex items-center justify-center gap-3">
                            CONTINUER <IconChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <header className="space-y-2">
                            <h2 className="text-4xl font-black text-white">Vos mensurations</h2>
                            <p className="text-slate-500 font-bold">Base de calcul pour votre métabolisme.</p>
                        </header>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Poids (kg)</label>
                                <input type="number" value={data.weight} onChange={e => setData({ ...data, weight: e.target.value })} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Taille (cm)</label>
                                <input type="number" value={data.height} onChange={e => setData({ ...data, height: e.target.value })} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50" />
                            </div>
                        </div>
                        <button onClick={nextStep} className="w-full py-6 bg-brand-600 hover:bg-brand-500 text-white font-black rounded-[2rem] shadow-xl shadow-brand-500/20 flex items-center justify-center gap-3">
                            CALCULER MON PLAN <IconChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                )}

                {step === 4 && (
                    <div className="text-center space-y-12 animate-in zoom-in duration-1000">
                        <div className="relative inline-block">
                            <div className="absolute inset-0 bg-brand-500 blur-3xl opacity-20 animate-pulse" />
                            <IconSparkles className="w-24 h-24 text-brand-500 relative z-10 mx-auto" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-5xl font-black text-white tracking-tight">{t('onboarding.step5Success')}</h2>
                            <p className="text-slate-500 font-bold max-w-sm mx-auto leading-relaxed">Nous avons configuré vos cibles caloriques et d'hydratation personnalisées.</p>
                        </div>
                        <button onClick={onComplete} className="w-full py-6 bg-white text-black font-black rounded-[2.5rem] shadow-2xl hover:bg-slate-200 transition-all text-xl uppercase tracking-widest">
                            ENTRER DANS MON COCKPIT
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Onboarding;
