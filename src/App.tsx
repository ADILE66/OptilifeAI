import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './core/AuthContext';
import { I18nProvider, useTranslation } from './i18n/i18n';
import {
    IconHome, IconWater, IconFire, IconActivity, IconClock,
    IconMoon, IconSettings, IconAward, IconSparkles, IconLogOut,
    IconUser, IconBell
} from './ui/Icons';
import ProModal from './components/ProModal';

// Lazy Load Pages
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const WaterTracker = React.lazy(() => import('./modules/WaterTracker'));
const FoodTracker = React.lazy(() => import('./modules/FoodTracker'));
const ActivityTracker = React.lazy(() => import('./modules/ActivityTracker'));
const FastingTracker = React.lazy(() => import('./modules/FastingTracker'));
const SleepTracker = React.lazy(() => import('./modules/SleepTracker'));
const BadgesPage = React.lazy(() => import('./pages/BadgesPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const CoachingPage = React.lazy(() => import('./pages/CoachingPage'));
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
const Onboarding = React.lazy(() => import('./pages/Onboarding'));

const MainLayout = () => {
    const { currentUser, logout, isProMember, upgradeToPro, completeOnboarding } = useAuth();
    const [isProModalOpen, setProModalOpen] = useState(false);

    if (currentUser && !currentUser.onboardingCompleted) {
        return <Onboarding onComplete={completeOnboarding} />;
    }

    const menu = [
        { to: "/dashboard", icon: IconHome, color: "text-brand-400", bg: "bg-brand-500/10", label: "Dashboard" },
        { to: "/water", icon: IconWater, color: "text-blue-400", bg: "bg-blue-500/10", label: "Eau" },
        { to: "/food", icon: IconFire, color: "text-orange-400", bg: "bg-orange-500/10", label: "Repas" },
        { to: "/activity", icon: IconActivity, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Activité" },
        { to: "/fasting", icon: IconClock, color: "text-purple-400", bg: "bg-purple-500/10", label: "Jeûne" },
        { to: "/sleep", icon: IconMoon, color: "text-indigo-400", bg: "bg-indigo-500/10", label: "Sommeil" },
        { to: "/coaching", icon: IconSparkles, color: "text-amber-400", bg: "bg-amber-500/10", label: "Coach IA" }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 md:pl-24">
            <ProModal isOpen={isProModalOpen} onClose={() => setProModalOpen(false)} onUpgrade={() => { upgradeToPro(); setProModalOpen(false); }} />

            {/* Nav Desktop */}
            <nav className="fixed left-0 top-0 h-full w-24 bg-slate-900 border-r border-white/5 hidden md:flex flex-col justify-between py-8 z-50">
                <div className="flex flex-col items-center gap-8">
                    <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-brand-600/20">O</div>
                    <div className="flex flex-col gap-6">
                        {menu.map(item => (
                            <NavLink key={item.to} to={item.to} className={({ isActive }) => `p-3 rounded-xl transition-all ${isActive ? `${item.bg} ${item.color}` : 'text-slate-500 hover:text-white'}`}>
                                <item.icon className="w-6 h-6" />
                            </NavLink>
                        ))}
                        <NavLink to="/badges" className={({ isActive }) => `p-3 rounded-xl transition-all ${isActive ? 'bg-amber-500/10 text-amber-500' : 'text-slate-500 hover:text-white'}`}>
                            <IconAward className="w-6 h-6" />
                        </NavLink>
                    </div>
                </div>
                <div className="flex flex-col items-center gap-6">
                    <NavLink to="/settings" className="text-slate-500 hover:text-white p-3"><IconSettings className="w-6 h-6" /></NavLink>
                    <button onClick={logout} className="text-slate-500 hover:text-red-400 p-3"><IconLogOut className="w-6 h-6" /></button>
                </div>
            </nav>

            <header className="max-w-6xl mx-auto px-6 pt-8 flex justify-end items-center gap-4">
                {!isProMember && (
                    <button
                        onClick={() => setProModalOpen(true)}
                        className="hidden md:flex items-center gap-2 px-4 py-2 bg-brand-600/10 text-brand-500 border border-brand-500/20 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-600 hover:text-white transition-all"
                    >
                        <IconSparkles className="w-4 h-4" /> UPGRADE PRO
                    </button>
                )}
                <div className="flex items-center gap-4 bg-slate-900/50 backdrop-blur-md p-2 pl-4 rounded-2xl border border-white/5">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{isProMember ? 'Premium' : 'Free'}</p>
                        <p className="text-sm font-bold text-white max-w-[100px] truncate">{currentUser?.email?.split('@')[0]}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 border border-white/5">
                        <IconUser className="w-5 h-5" />
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-6 md:p-12 pb-32">
                <Outlet context={{ setProModalOpen }} />
            </main>
        </div>
    );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { currentUser, loading } = useAuth();
    if (loading) return null;
    return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => (
    <BrowserRouter>
        <I18nProvider>
            <AuthProvider>
                <React.Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div></div>}>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/water" element={<WaterTracker />} />
                            <Route path="/food" element={<FoodTracker />} />
                            <Route path="/activity" element={<ActivityTracker />} />
                            <Route path="/fasting" element={<FastingTracker />} />
                            <Route path="/sleep" element={<SleepTracker />} />
                            <Route path="/badges" element={<BadgesPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                            <Route path="/coaching" element={<CoachingPage />} />
                            <Route path="/admin" element={<AdminPage />} />
                        </Route>
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </React.Suspense>
            </AuthProvider>
        </I18nProvider>
    </BrowserRouter>
);

export default App;
