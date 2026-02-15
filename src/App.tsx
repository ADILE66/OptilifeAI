import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, Outlet, useOutletContext } from 'react-router-dom';
import { AuthProvider, useAuth } from './core/AuthContext';
import { DataProvider, useData } from './core/DataContext';
import { I18nProvider, useTranslation } from './i18n/i18n';
import {
    IconHome, IconWater, IconFire, IconActivity, IconClock,
    IconMoon, IconSettings, IconAward, IconSparkles, IconLogOut,
    IconUser, IconBell, IconScale
} from './ui/Icons';
import ProModal from './components/ProModal';
import BadgeModal from './components/BadgeModal';

// Lazy Load Pages
const LandingPage = React.lazy(() => import('./pages/LandingPage.tsx'));
const LoginPage = React.lazy(() => import('./pages/LoginPage.tsx'));
const Dashboard = React.lazy(() => import('./pages/Dashboard.tsx'));
const WaterTracker = React.lazy(() => import('./modules/WaterTracker.tsx'));
const FoodTracker = React.lazy(() => import('./modules/FoodTracker.tsx'));
const ActivityTracker = React.lazy(() => import('./modules/ActivityTracker.tsx'));
const FastingTracker = React.lazy(() => import('./modules/FastingTracker.tsx'));
const SleepTracker = React.lazy(() => import('./modules/SleepTracker.tsx'));
const BadgesPage = React.lazy(() => import('./pages/BadgesPage.tsx'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage.tsx'));
const CoachingPage = React.lazy(() => import('./pages/CoachingPage.tsx'));
const AdminPage = React.lazy(() => import('./pages/AdminPage.tsx'));
const Onboarding = React.lazy(() => import('./pages/Onboarding.tsx'));
const WeightTracker = React.lazy(() => import('./modules/WeightTracker.tsx'));

const MainLayout = () => {
    const { currentUser, logout, isProMember, upgradeToPro, completeOnboarding } = useAuth();
    const { newlyEarnedBadges, clearNewBadge } = useData();
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
        { to: "/weight", icon: IconScale, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Poids" },
        { to: "/coaching", icon: IconSparkles, color: "text-amber-400", bg: "bg-amber-500/10", label: "Coach IA" }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 md:pl-24">
            <ProModal isOpen={isProModalOpen} onClose={() => setProModalOpen(false)} onUpgrade={() => { upgradeToPro(); setProModalOpen(false); }} />
            {newlyEarnedBadges.length > 0 && <BadgeModal badge={newlyEarnedBadges[0]} onClose={clearNewBadge} />}

            {/* Nav Desktop */}
            <nav className="fixed left-0 top-0 h-full w-24 bg-slate-900 border-r border-white/5 hidden md:flex flex-col justify-between py-8 z-50">
                <div className="flex flex-col items-center gap-8">
                    <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-brand-600/20">O</div>
                    <div className="flex flex-col gap-6">
                        {menu.map(item => (
                            <NavLink key={item.to} to={item.to} title={item.label} className={({ isActive }) => `p-3 rounded-xl transition-all ${isActive ? `${item.bg} ${item.color}` : 'text-slate-500 hover:text-white'}`}>
                                <item.icon className="w-6 h-6" />
                            </NavLink>
                        ))}
                        <NavLink to="/badges" title="Badges" className={({ isActive }) => `p-3 rounded-xl transition-all ${isActive ? 'bg-amber-500/10 text-amber-500' : 'text-slate-500 hover:text-white'}`}>
                            <IconAward className="w-6 h-6" />
                        </NavLink>
                    </div>
                </div>
                <div className="flex flex-col items-center gap-6">
                    <NavLink to="/settings" title="Settings" className="text-slate-500 hover:text-white p-3"><IconSettings className="w-6 h-6" /></NavLink>
                    <button onClick={logout} title="Logout" className="text-slate-500 hover:text-red-400 p-3"><IconLogOut className="w-6 h-6" /></button>
                </div>
            </nav>

            {/* Nav Mobile */}
            <nav className="fixed bottom-0 left-0 w-full bg-slate-900/80 backdrop-blur-xl border-t border-white/5 flex md:hidden justify-around items-center py-4 px-2 z-50">
                {menu.slice(0, 5).map(item => (
                    <NavLink key={item.to} to={item.to} className={({ isActive }) => `p-2 rounded-xl transition-all ${isActive ? `${item.bg} ${item.color}` : 'text-slate-500'}`}>
                        <item.icon className="w-6 h-6" />
                    </NavLink>
                ))}
                <NavLink to="/settings" className={({ isActive }) => `p-2 rounded-xl transition-all ${isActive ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>
                    <IconUser className="w-6 h-6" />
                </NavLink>
            </nav>

            <header className="max-w-6xl mx-auto px-6 pt-8 flex justify-between md:justify-end items-center gap-4">
                <div className="md:hidden w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-brand-600/20">O</div>

                <div className="flex items-center gap-4">
                    {!isProMember && (
                        <button
                            onClick={() => setProModalOpen(true)}
                            className="flex items-center gap-2 px-3 py-2 bg-brand-600/10 text-brand-500 border border-brand-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-600 hover:text-white transition-all"
                        >
                            <IconSparkles className="w-3 h-3" /> <span className="hidden sm:inline">UPGRADE</span> PRO
                        </button>
                    )}
                    <div className="flex items-center gap-3 bg-slate-900/50 backdrop-blur-md p-1.5 pl-3 rounded-2xl border border-white/5">
                        <div className="text-right hidden xs:block">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">{isProMember ? 'Premium' : 'Free'}</p>
                            <p className="text-xs font-bold text-white max-w-[80px] truncate">{currentUser?.email?.split('@')[0]}</p>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 border border-white/5">
                            <IconUser className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-4 md:p-12 pb-32">
                <Outlet context={{ setProModalOpen }} />
            </main>
        </div>
    );
};

// Route Wrappers to inject Data
const DashboardWrapper = () => {
    const { isProMember } = useAuth();
    const { waterLogs, foodLogs, activityLogs, fastingLogs, sleepLogs, weightLogs, userGoals, earnedBadgeIds, userProfile } = useData();
    const { setProModalOpen } = useOutletContext<{ setProModalOpen: (o: boolean) => void }>();
    return <Dashboard waterLogs={waterLogs} foodLogs={foodLogs} activityLogs={activityLogs} fastingLogs={fastingLogs} weightLogs={weightLogs} sleepLogs={sleepLogs} profile={userProfile} goals={userGoals} earnedBadgeIds={earnedBadgeIds} isProMember={isProMember} onUpgradeClick={() => setProModalOpen(true)} />;
};

const WaterWrapper = () => {
    const { isProMember } = useAuth();
    const { waterLogs, addWater, deleteWater, userGoals } = useData();
    const { setProModalOpen } = useOutletContext<{ setProModalOpen: (o: boolean) => void }>();
    return <WaterTracker logs={waterLogs} onAdd={addWater} onDelete={deleteWater} goal={userGoals.waterMl} isProMember={isProMember} onUpgradeClick={() => setProModalOpen(true)} />;
};

const FoodWrapper = () => {
    const { isProMember } = useAuth();
    const { foodLogs, addFood, deleteFood, userGoals } = useData();
    const { setProModalOpen } = useOutletContext<{ setProModalOpen: (o: boolean) => void }>();
    return <FoodTracker logs={foodLogs} onAdd={addFood} onDelete={deleteFood} goals={userGoals} isProMember={isProMember} onUpgradeClick={() => setProModalOpen(true)} />;
};

const ActivityWrapper = () => {
    const { isProMember } = useAuth();
    const { activityLogs, addActivity, deleteActivity, userProfile } = useData();
    const { setProModalOpen } = useOutletContext<{ setProModalOpen: (o: boolean) => void }>();
    return <ActivityTracker logs={activityLogs} onAdd={addActivity} onDelete={deleteActivity} isProMember={isProMember} onUpgradeClick={() => setProModalOpen(true)} profile={userProfile} />;
};

const FastingWrapper = () => {
    const { isProMember } = useAuth();
    const { fastingLogs, startFasting, endFasting, addFastingLog, deleteFasting, userGoals } = useData();
    const { setProModalOpen } = useOutletContext<{ setProModalOpen: (o: boolean) => void }>();
    return <FastingTracker fastingLogs={fastingLogs} onStart={startFasting} onEnd={endFasting} onAdd={addFastingLog} onDelete={deleteFasting} goalHours={userGoals.fastingHours} isProMember={isProMember} onUpgradeClick={() => setProModalOpen(true)} />;
};

const SleepWrapper = () => {
    const { isProMember } = useAuth();
    const { sleepLogs, addSleep, deleteSleep, userGoals } = useData();
    const { setProModalOpen } = useOutletContext<{ setProModalOpen: (o: boolean) => void }>();
    return <SleepTracker logs={sleepLogs} onAdd={addSleep} onDelete={deleteSleep} goals={userGoals} isProMember={isProMember} onUpgradeClick={() => setProModalOpen(true)} />;
};

const WeightWrapper = () => {
    const { isProMember } = useAuth();
    const { weightLogs, updateProfile, userGoals, userProfile } = useData();
    const { setProModalOpen } = useOutletContext<{ setProModalOpen: (o: boolean) => void }>();
    return <WeightTracker logs={weightLogs} onAdd={(w) => updateProfile({ weightKg: w })} onDelete={() => { }} goals={userGoals} profile={userProfile} isProMember={isProMember} onUpgradeClick={() => setProModalOpen(true)} />;
};

const BadgesWrapper = () => {
    const { earnedBadgeIds } = useData();
    return <BadgesPage earnedBadgeIds={earnedBadgeIds} />;
};

const SettingsWrapper = () => {
    const { updateCurrentUser } = useAuth();
    const { userGoals, updateGoals, userProfile, updateProfile } = useData();
    return <SettingsPage goals={userGoals} onGoalsChange={updateGoals} profile={userProfile} onProfileChange={updateProfile} updateCurrentUser={updateCurrentUser} />;
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
                <DataProvider>
                    <React.Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div></div>}>
                        <Routes>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                                <Route path="/dashboard" element={<DashboardWrapper />} />
                                <Route path="/water" element={<WaterWrapper />} />
                                <Route path="/food" element={<FoodWrapper />} />
                                <Route path="/activity" element={<ActivityWrapper />} />
                                <Route path="/fasting" element={<FastingWrapper />} />
                                <Route path="/sleep" element={<SleepWrapper />} />
                                <Route path="/weight" element={<WeightWrapper />} />
                                <Route path="/badges" element={<BadgesWrapper />} />
                                <Route path="/settings" element={<SettingsWrapper />} />
                                <Route path="/coaching" element={<CoachingPage />} />
                                <Route path="/admin" element={<AdminPage />} />
                            </Route>
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </React.Suspense>
                </DataProvider>
            </AuthProvider>
        </I18nProvider>
    </BrowserRouter>
);

export default App;
