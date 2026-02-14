import * as React from 'react';
import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { IconLoader, IconEye, IconEyeOff, IconGoogle } from '../components/Icons';
import { useTranslation } from '../i18n/i18n';
import { signInWithGoogle } from '../services/authService';

const SignupPage: React.FC = () => {
    const { t, setLanguage, language } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { signup } = useContext(AuthContext);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            setError(t('signup.passwordErrorLength'));
            return;
        }
        setError('');
        setLoading(true);
        try {
            const user = await signup(email, password);
            if (user) {
                navigate('/dashboard');
            } else {
                setError(t('signup.errorExists'));
            }
        } catch (err) {
            setError('Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        await signInWithGoogle();
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
                    <h1 className="text-lg font-medium text-slate-400 mt-1">{t('signup.title')}</h1>
                    <p className="text-slate-500">{t('signup.subtitle')}</p>
                </div>
                <div className="bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-800 transition-all duration-300">
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
                            <label className="block text-sm font-medium text-slate-400 mb-1">{t('login.passwordLabel')}</label>
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
                        {error && <p className="text-red-400 text-sm text-center font-bold animate-pulse">{error}</p>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 px-4 bg-brand-600 text-white font-black rounded-xl hover:bg-brand-500 transition-all shadow-lg shadow-brand-900/20 active:scale-95 disabled:bg-slate-800 disabled:text-slate-500 flex items-center justify-center uppercase tracking-wider text-sm"
                        >
                            {loading ? <IconLoader className="w-6 h-6 animate-spin" /> : t('signup.button')}
                        </button>

                        <div className="relative my-6 text-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-800"></div>
                            </div>
                            <span className="relative px-4 bg-slate-900 text-slate-500 text-xs font-bold uppercase tracking-widest">{t('signup.orLogin')}</span>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full py-4 px-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-all shadow-lg active:scale-95 disabled:bg-slate-800 disabled:text-slate-500 flex items-center justify-center gap-3"
                        >
                            <IconGoogle className="w-5 h-5" />
                            <span>S'inscrire avec Google</span>
                        </button>
                    </form>
                </div>
                <p className="text-center text-slate-500 mt-6">
                    {t('signup.loginPrompt')} <Link to="/login" className="font-bold text-brand-400 hover:text-brand-300 hover:underline">{t('signup.loginLink')}</Link>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;