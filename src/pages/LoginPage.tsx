import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../core/AuthContext';
import { useTranslation } from '../i18n/i18n';
import { IconShield, IconSparkles } from '../ui/Icons';

const LoginPage = () => {
    const { t } = useTranslation();
    const { login, signup } = useAuth();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password);
            }
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || "Erreur d'authentification");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-600/10 blur-[120px] rounded-full -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full -ml-64 -mb-64" />

            <div className="w-full max-w-md bg-slate-900 border border-white/5 rounded-[3rem] p-10 shadow-2xl relative z-10">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-600/20">
                        <span className="text-white text-3xl font-black italic">O</span>
                    </div>
                    <h2 className="text-3xl font-black text-white">{isLogin ? t('login.welcome') : t('signup.title')}</h2>
                    <p className="text-slate-500 font-bold mt-2">{isLogin ? t('login.subtitle') : t('signup.subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Email</label>
                        <input
                            type="email" value={email} onChange={e => setEmail(e.target.value)} required
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all font-medium"
                            placeholder="votre@email.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Mot de passe</label>
                        <input
                            type="password" value={password} onChange={e => setPassword(e.target.value)} required
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all font-medium"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && <p className="text-red-500 text-xs font-bold text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</p>}

                    <button
                        type="submit" disabled={loading}
                        className="w-full py-5 bg-brand-600 hover:bg-brand-500 text-white font-black rounded-2xl shadow-xl shadow-brand-600/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : (isLogin ? t('login.button') : t('signup.button'))}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button onClick={() => setIsLogin(!isLogin)} className="text-slate-500 hover:text-white font-bold text-sm transition-colors">
                        {isLogin ? t('login.signupPrompt') : t('signup.loginPrompt')} <span className="text-brand-500 ml-1">{isLogin ? t('login.signupLink') : t('signup.loginLink')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
