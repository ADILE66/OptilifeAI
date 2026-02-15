import * as React from 'react';
import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { IconLoader, IconEye, IconEyeOff, IconChevronLeft, IconCheckCircle } from '../components/Icons';
import { useTranslation } from '../i18n/i18n';

const LoginPage: React.FC = () => {
    const { t, setLanguage, language } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [view, setView] = useState<'login' | 'forgot'>('login');
    const [resetSent, setResetSent] = useState(false);
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(email, password);
            if (user) {
                navigate('/dashboard');
            } else {
                setError(t('login.error'));
            }
        } catch (err) {
            setError(t('login.errorGeneric'));
        } finally {
            setLoading(false);
        }
    };

    const handleForgotSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulation d'envoi d'email
        await new Promise(r => setTimeout(r, 1500));
        setLoading(false);
        setResetSent(true);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
                    <div className="absolute top-0 right-0 flex gap-2">
                        <button onClick={() => setLanguage('fr')} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${language === 'fr' ? 'border-brand-500 bg-brand-500/20 text-brand-400' : 'border-slate-800 bg-slate-900/50 text-slate-500 hover:text-white'}`}>FR</button>
                        <button onClick={() => setLanguage('en')} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${language === 'en' ? 'border-brand-500 bg-brand-500/20 text-brand-400' : 'border-slate-800 bg-slate-900/50 text-slate-500 hover:text-white'}`}>EN</button>
                        <button onClick={() => setLanguage('es')} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${language === 'es' ? 'border-brand-500 bg-brand-500/20 text-brand-400' : 'border-slate-800 bg-slate-900/50 text-slate-500 hover:text-white'}`}>ES</button>
                    </div>
                    <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-brand-500/20 mx-auto mt-8">O</div>
                    <h2 className="text-2xl font-extrabold text-white mt-4 tracking-tight">OptiLife AI</h2>

                    {view === 'login' ? (
                        <>
                            <h1 className="text-lg font-medium text-slate-400 mt-1">{t('login.welcome')}</h1>
                            <p className="text-slate-500">{t('login.subtitle')}</p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-lg font-medium text-slate-400 mt-1">{t('login.resetTitle')}</h1>
                            <p className="text-slate-500">{t('login.resetSubtitle')}</p>
                        </>
                    )}
                </div>

                <div className="bg-slate-900 rounded-2xl shadow-xl p-8 relative overflow-hidden transition-all duration-300 border border-slate-800">
                    {view === 'login' ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">{t('login.emailLabel')}</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-white placeholder:text-slate-600 transition-all font-bold"
                                    required
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-slate-400">{t('login.passwordLabel')}</label>
                                    <button
                                        type="button"
                                        onClick={() => setView('forgot')}
                                        className="text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors"
                                    >
                                        {t('login.forgotPassword')}
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-white placeholder:text-slate-600 transition-all font-bold"
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-slate-300">
                                        {showPassword ? <IconEyeOff className="w-5 h-5" /> : <IconEye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            {error && <p className="text-red-400 text-sm text-center animate-pulse font-bold">{error}</p>}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 px-4 bg-brand-600 text-white font-black rounded-xl hover:bg-brand-500 transition-all shadow-lg shadow-brand-900/20 active:scale-95 disabled:bg-slate-800 disabled:text-slate-500 flex items-center justify-center uppercase tracking-wider text-sm"
                            >
                                {loading ? <IconLoader className="w-6 h-6 animate-spin" /> : t('login.button')}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            {!resetSent ? (
                                <form onSubmit={handleForgotSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">{t('login.emailLabel')}</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-white placeholder:text-slate-600 transition-all font-bold"
                                            required
                                            placeholder="Ex: jean@exemple.com"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading || !email}
                                        className="w-full py-4 px-4 bg-brand-600 text-white font-black rounded-xl hover:bg-brand-500 transition-all shadow-lg shadow-brand-900/20 active:scale-95 disabled:bg-slate-800 disabled:text-slate-500 flex items-center justify-center uppercase tracking-wider text-sm"
                                    >
                                        {loading ? <IconLoader className="w-6 h-6 animate-spin" /> : t('login.resetButton')}
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center py-4 space-y-4 animate-in zoom-in-95">
                                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500 border border-emerald-500/20">
                                        <IconCheckCircle className="w-10 h-10" />
                                    </div>
                                    <p className="font-bold text-white">{t('login.resetSuccess')}</p>
                                </div>
                            )}
                            <button
                                onClick={() => { setView('login'); setResetSent(false); }}
                                className="w-full flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-300 transition-colors pt-2"
                            >
                                <IconChevronLeft className="w-4 h-4" /> {t('login.backToLogin')}
                            </button>
                        </div>
                    )}
                </div>

                <p className="text-center text-slate-500 mt-6">
                    {t('login.signupPrompt')} <Link to="/signup" className="font-bold text-brand-400 hover:text-brand-300 hover:underline">{t('login.signupLink')}</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
