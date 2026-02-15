import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './core/AuthContext';
import { IconHome, IconWater, IconFire, IconActivity, IconClock, IconMoon, IconSettings, IconAward, IconSparkles, IconLogOut, IconUser } from './ui/Icons';

// Pages & Modules (Lazy Load pour la vitesse)
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const WaterTracker = React.lazy(() => import('./modules/WaterTracker'));
const FoodTracker = React.lazy(() => import('./modules/FoodTracker'));
const ActivityTracker = React.lazy(() => import('./modules/ActivityTracker'));
const FastingTracker = React.lazy(() => import('./modules/FastingTracker'));

/* --- NAVIGATION LAYOUT --- */
const MainLayout = () => {
    const { user, logout, isPro } = useAuth();

    const menu = [
        { to: "/dashboard", icon: IconHome, color: "text-brand-400", bg: "bg-brand-500/10", label: "Dashboard" },
        { to: "/water", icon: IconWater, color: "text-blue-400", bg: "bg-blue-500/10", label: "Eau" },
        { to: "/food", icon: IconFire, color: "text-orange-400", bg: "bg-orange-500/10", label: "Repas" },
        { to: "/activity", icon: IconActivity, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Activité" },
        { to: "/fasting", icon: IconClock, color: "text-purple-400", bg: "bg-purple-500/10", label: "Jeûne" }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 md:pl-24">
            {/* Nav Mobile */}
            <nav className="fixed bottom-0 left-0 w-full bg-slate-900 border-t border-white/5 flex md:hidden justify-around py-4 z-50">
                {menu.map(item => (
                    <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive ? item.color : 'text-slate-500'}>
                        <item.icon className="w-6 h-6" />
                    </NavLink>
                ))}
            </nav>

            {/* Nav Desktop */}
            <nav className="fixed left-0 top-0 h-full w-24 bg-slate-900 border-r border-white/5 hidden md:flex flex-col justify-between py-8 z-50">
                <div className="flex flex-col items-center gap-8">
                    <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg">O</div>
                    <div className="flex flex-col gap-6">
                        {menu.map(item => (
                            <NavLink key={item.to} to={item.to} title={item.label} className={({ isActive }) => `p-3 rounded-xl transition-all ${isActive ? `${item.bg} ${item.color}` : 'text-slate-500 hover:text-white'}`}>
                                <item.icon className="w-6 h-6" />
                            </NavLink>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col items-center gap-6">
                    <button onClick={logout} className="text-slate-500 hover:text-red-400 p-3"><IconLogOut className="w-6 h-6" /></button>
                </div>
            </nav>

            <header className="max-w-6xl mx-auto px-6 pt-8 flex justify-end">
                <div className="flex items-center gap-4 bg-slate-900/50 backdrop-blur-md p-2 pl-4 rounded-2xl border border-white/5">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{isPro ? 'Membre Pro' : 'Free'}</p>
                        <p className="text-sm font-bold text-white">{user?.email?.split('@')[0]}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 border border-white/5">
                        <IconUser className="w-5 h-5" />
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-6 md:p-12 pb-32">
                <Outlet />
            </main>
        </div>
    );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    return user ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => (
    <BrowserRouter>
        <AuthProvider>
            <React.Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/water" element={<WaterTracker />} />
                        <Route path="/food" element={<FoodTracker />} />
                        <Route path="/activity" element={<ActivityTracker />} />
                        <Route path="/fasting" element={<FastingTracker />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </React.Suspense>
        </AuthProvider>
    </BrowserRouter>
);

export default App;
