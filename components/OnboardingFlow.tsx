import React, { useState, useContext } from 'react';
import { useTranslation } from '../i18n/i18n';
import { UserProfile, User } from '../types';
import { IconCheckCircle, IconFire, IconActivity, IconWater, IconSparkles, IconUser, IconLoader, IconChevronRight, IconChevronLeft, IconClock, IconMoon } from './Icons';

interface OnboardingFlowProps {
    onComplete: (profile: UserProfile) => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    const [profile, setProfile] = useState<UserProfile>({
        age: 30,
        weightKg: 70,
        heightCm: 175,
        gender: 'male',
        mainGoal: 'weight_loss',
        motivation: 'confidence',
        healthIssues: [],
        activityLevel: 'moderate'
    });

    const goals = [
        { id: 'weight_loss', icon: IconFire, color: 'text-orange-500', bg: 'bg-orange-50' },
        { id: 'muscle_gain', icon: IconActivity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { id: 'energy', icon: IconSparkles, color: 'text-yellow-500', bg: 'bg-yellow-50' },
        { id: 'metabolic', icon: IconWater, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'longevity', icon: IconClock, color: 'text-purple-500', bg: 'bg-purple-50' },
    ];

    const healthIssues = ['digestion', 'sleep', 'stress', 'joints', 'focus', 'sugar'];
    const activityLevels: UserProfile['activityLevel'][] = ['sedentary', 'light', 'moderate', 'active', 'very_active'];

    const toggleHealthIssue = (id: string) => {
        setProfile(prev => ({
            ...prev,
            healthIssues: prev.healthIssues?.includes(id) 
                ? prev.healthIssues.filter(i => i !== id) 
                : [...(prev.healthIssues || []), id]
        }));
    };

    const handleNext = () => {
        if (step < 4) setStep(step + 1);
        else startAnalysis();
    };

    const startAnalysis = () => {
        setStep(5);
        setIsAnalyzing(true);
        setTimeout(() => {
            setIsAnalyzing(false);
        }, 3000);
    };

    const handleFinish = () => {
        onComplete(profile);
    };

    return (
        <div className="fixed inset-0 bg-slate-50 z-[60] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Progress Bar */}
                <div className="h-1.5 bg-slate-100 flex">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`flex-1 transition-all duration-500 ${i <= step ? 'bg-brand-500' : 'bg-transparent'}`} />
                    ))}
                </div>

                <div className="p-8 md:p-12 overflow-y-auto flex-1">
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="text-center">
                                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{t('onboarding.step1Title')}</h2>
                                <p className="text-slate-500">{t('onboarding.step1Subtitle')}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {goals.map(goal => (
                                    <button
                                        key={goal.id}
                                        onClick={() => setProfile({ ...profile, mainGoal: goal.id })}
                                        className={`p-6 rounded-2xl border-2 text-left transition-all group ${profile.mainGoal === goal.id ? 'border-brand-500 bg-brand-50/30' : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div className={`w-12 h-12 ${goal.bg} rounded-xl flex items-center justify-center ${goal.color} mb-4 group-hover:scale-110 transition-transform`}>
                                            <goal.icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-bold text-slate-800">{t(`onboarding.goals.${goal.id}.title`)}</h3>
                                        <p className="text-sm text-slate-500">{t(`onboarding.goals.${goal.id}.desc`)}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="text-center">
                                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{t('onboarding.step2Title')}</h2>
                                <p className="text-slate-500">{t('onboarding.step2Subtitle')}</p>
                            </div>
                            <div className="space-y-3">
                                {Object.keys(t('onboarding.motivations', { returnObjects: true })).map(key => (
                                    <button
                                        key={key}
                                        onClick={() => setProfile({ ...profile, motivation: key })}
                                        className={`w-full p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${profile.motivation === key ? 'border-brand-500 bg-brand-50/30 text-brand-700' : 'border-slate-100 hover:border-slate-200 text-slate-700'}`}
                                    >
                                        <span className="font-bold">{t(`onboarding.motivations.${key}`)}</span>
                                        {profile.motivation === key && <IconCheckCircle className="w-6 h-6 text-brand-500" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="text-center">
                                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{t('onboarding.step3Title')}</h2>
                                <p className="text-slate-500">{t('onboarding.step3Subtitle')}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {healthIssues.map(issue => (
                                    <button
                                        key={issue}
                                        onClick={() => toggleHealthIssue(issue)}
                                        className={`p-5 rounded-2xl border-2 text-center transition-all ${profile.healthIssues?.includes(issue) ? 'border-secondary-500 bg-secondary-50/30 text-secondary-700 font-bold' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}
                                    >
                                        {t(`onboarding.healthIssues.${issue}`)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="text-center">
                                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{t('onboarding.step4Title')}</h2>
                                <p className="text-slate-500">{t('onboarding.step4Subtitle')}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-bold text-slate-400 uppercase mb-2 block">Sexe</label>
                                    <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                                        {['male', 'female', 'other'].map(g => (
                                            <button key={g} onClick={() => setProfile({...profile, gender: g as any})} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${profile.gender === g ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'}`}>
                                                {t(`settings.gender${g.charAt(0).toUpperCase() + g.slice(1)}`)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-400 uppercase mb-2 block">Âge</label>
                                    <input type="number" value={profile.age || ''} onChange={e => setProfile({...profile, age: +e.target.value})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-500" />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-400 uppercase mb-2 block">Poids (kg)</label>
                                    <input type="number" value={profile.weightKg || ''} onChange={e => setProfile({...profile, weightKg: +e.target.value})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-500" />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-400 uppercase mb-2 block">Taille (cm)</label>
                                    <input type="number" value={profile.heightCm || ''} onChange={e => setProfile({...profile, heightCm: +e.target.value})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-500" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-sm font-bold text-slate-400 uppercase mb-2 block">Niveau d'activité</label>
                                    <select value={profile.activityLevel} onChange={e => setProfile({...profile, activityLevel: e.target.value as any})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-500 bg-white">
                                        {activityLevels.map(lvl => <option key={lvl} value={lvl}>{t(`onboarding.activityLevels.${lvl}`)}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="text-center py-12 space-y-8 animate-in zoom-in-95">
                            {isAnalyzing ? (
                                <div className="space-y-6">
                                    <div className="relative w-24 h-24 mx-auto">
                                        <div className="absolute inset-0 border-4 border-brand-100 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-brand-500 rounded-full border-t-transparent animate-spin"></div>
                                        <IconSparkles className="absolute inset-0 m-auto w-10 h-10 text-brand-500" />
                                    </div>
                                    <h2 className="text-3xl font-extrabold text-slate-900">{t('onboarding.step5Analyzing')}</h2>
                                    <div className="max-w-xs mx-auto space-y-2">
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-brand-500 animate-[loading_3s_ease-in-out]"></div>
                                        </div>
                                        <p className="text-xs text-slate-400 uppercase tracking-widest">IA en cours de réflexion...</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 scale-110">
                                        <IconCheckCircle className="w-12 h-12" />
                                    </div>
                                    <h2 className="text-3xl font-extrabold text-slate-900">{t('onboarding.step5Success')}</h2>
                                    <p className="text-slate-600 max-w-md mx-auto">{t('onboarding.step5Subtitle')}</p>
                                    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 max-w-sm mx-auto text-left space-y-4">
                                        <div className="flex gap-3">
                                            <IconFire className="w-5 h-5 text-orange-500" />
                                            <p className="text-sm text-slate-700">Objectif calorie calculé : <strong>2400 kcal</strong></p>
                                        </div>
                                        <div className="flex gap-3">
                                            <IconWater className="w-5 h-5 text-blue-500" />
                                            <p className="text-sm text-slate-700">Hydratation cible : <strong>2.5L / jour</strong></p>
                                        </div>
                                        <div className="flex gap-3">
                                            <IconMoon className="w-5 h-5 text-indigo-500" />
                                            <p className="text-sm text-slate-700">Récupération conseillée : <strong>8h / nuit</strong></p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-6 bg-slate-50 border-t flex justify-between items-center">
                    {step < 5 && step > 1 ? (
                        <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 font-bold text-slate-500 hover:text-slate-800 transition-colors">
                            <IconChevronLeft className="w-5 h-5" /> {t('common.back')}
                        </button>
                    ) : <div></div>}

                    {step < 5 ? (
                        <button onClick={handleNext} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg">
                            {t('common.next')} <IconChevronRight className="w-5 h-5" />
                        </button>
                    ) : (
                        !isAnalyzing && (
                            <button onClick={handleFinish} className="w-full sm:w-auto px-12 py-4 bg-brand-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-700 transition-all shadow-xl">
                                {t('common.finish')} <IconCheckCircle className="w-5 h-5" />
                            </button>
                        )
                    )}
                </div>
            </div>
            <style>{`
                @keyframes loading {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default OnboardingFlow;