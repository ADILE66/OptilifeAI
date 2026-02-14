import React, { useState, useEffect, useContext } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation, Navigate, Outlet } from 'react-router-dom';
import { FoodItem, WaterLog, ActivityLog, FastingLog, UserGoals, Badge, NotificationSettings, UserProfile, ToastMessage, WeightLog, SleepLog } from './types';
import WaterTracker from './components/WaterTracker';
import FoodTracker from './components/FoodTracker';
import ActivityTracker from './components/ActivityTracker';
import FastingTracker from './components/FastingTracker';
import SleepTracker from './components/SleepTracker';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import BadgeModal from './components/BadgeModal';
import ProModal from './components/ProModal';
import OnboardingFlow from './components/OnboardingFlow';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboard from './pages/AdminDashboard';
import BadgesPage from './pages/BadgesPage';
import LandingPage from './pages/LandingPage';
import LegalNotice from './pages/LegalNotice';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import PricingPage from './pages/PricingPage';
import CoachingPage from './pages/CoachingPage';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { I18nProvider, useTranslation } from './i18n/i18n';
import { IconHome, IconWater, IconFire, IconActivity, IconClock, IconSettings, IconStar, IconCheckCircle, IconX, IconLogOut, IconShield, IconLoader, IconUser, IconAward, IconMoon, IconSparkles } from './components/Icons';
import { checkForNewBadges } from './utils/badgeManager';

const Toast: React.FC<{ toast: ToastMessage, onDismiss: () => void }> = ({ toast, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 4000);
        return () => clearTimeout(timer);
    }, [onDismiss]);
    const isSuccess = toast.type === 'success';
    return (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 p-4 rounded-xl shadow-lg border animate-in fade-in slide-in-from-top-5 duration-500 backdrop-blur-md ${isSuccess ? 'bg-emerald-900/90 border-emerald-800' : 'bg-red-900/90 border-red-800'}`}>
            {isSuccess ? <IconCheckCircle className="w-6 h-6 text-emerald-400" /> : <IconX className="w-6 h-6 text-red-400" />}
            <p className={`font-semibold ${isSuccess ? 'text-emerald-100' : 'text-red-100'}`}>{toast.message}</p>
            <button onClick={onDismiss} className={`ml-4 ${isSuccess ? 'text-emerald-400 hover:text-emerald-300' : 'text-red-400 hover:text-red-300'}`}><IconX className="w-5 h-5" /></button>
        </div>
    );
};

const MainLayout: React.FC = () => {
    const location = useLocation();
    const { currentUser, logout, isProMember, trialDaysLeft } = useContext(AuthContext);
    const { t } = useTranslation();

    const getTitle = () => {
        switch (location.pathname) {
            case '/dashboard': return t('nav.dashboard');
            case '/water': return t('nav.water');
            case '/food': return t('nav.food');
            case '/activity': return t('nav.activity');
            case '/fasting': return t('nav.fasting');
            case '/sleep': return t('nav.sleep');
            case '/coaching': return 'AI Coach';
            case '/settings': return t('nav.settings');
            case '/badges': return t('nav.badges');
            case '/admin': return t('nav.admin');
            default: return 'OptiLife AI';
        }
    };

    const navLinks = [
        { to: '/dashboard', label: t('nav.dashboard'), icon: IconHome, activeClasses: 'bg-brand-500/10 text-brand-400', inactiveClasses: 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' },
        { to: '/coaching', label: 'AI Coach', icon: IconSparkles, activeClasses: 'bg-brand-500/10 text-brand-400', inactiveClasses: 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' },
        { to: '/water', label: t('nav.water'), icon: IconWater, activeClasses: 'bg-blue-500/10 text-blue-400', inactiveClasses: 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' },
        { to: '/food', label: t('nav.food'), icon: IconFire, activeClasses: 'bg-orange-500/10 text-orange-400', inactiveClasses: 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' },
        { to: '/activity', label: t('nav.activity'), icon: IconActivity, activeClasses: 'bg-emerald-500/10 text-emerald-400', inactiveClasses: 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' },
        { to: '/fasting', label: t('nav.fasting'), icon: IconClock, activeClasses: 'bg-purple-500/10 text-purple-400', inactiveClasses: 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' },
        { to: '/sleep', label: t('nav.sleep'), icon: IconMoon, activeClasses: 'bg-indigo-500/10 text-indigo-400', inactiveClasses: 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' }
    ];

    const secondaryLinks = [
        ...(currentUser?.role === 'admin' ? [{ to: '/admin', label: t('nav.admin'), icon: IconShield, activeClasses: 'bg-red-500/10 text-red-400', inactiveClasses: 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' }] : []),
        { to: '/badges', label: t('nav.badges'), icon: IconAward, activeClasses: 'bg-amber-500/10 text-amber-400', inactiveClasses: 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' },
        { to: '/settings', label: t('nav.settings'), icon: IconSettings, activeClasses: 'bg-slate-800 text-slate-200', inactiveClasses: 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 pb-24 md:pb-0 md:pl-24 transition-all selection:bg-brand-500/30">
            <nav className="fixed md:left-0 md:top-0 md:h-full md:w-24 w-full bottom-0 bg-slate-900 border-t md:border-t-0 md:border-r border-slate-800 z-40 flex md:flex-col justify-between items-center p-2 md:py-8 overflow-x-auto md:overflow-visible">
                <div className="flex md:flex-col md:items-center gap-2 md:gap-8 w-full md:w-auto justify-around md:justify-start">
                    <div className="hidden md:flex w-10 h-10 bg-brand-600 rounded-xl items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/20 shrink-0">O</div>
                    <div className="flex md:flex-col gap-2 md:w-full items-center justify-center">
                        {navLinks.map(({ to, label, icon: Icon, activeClasses, inactiveClasses }) => (
                            <NavLink key={to} to={to} title={label} className={({ isActive }) => `p-3 rounded-xl transition-all flex items-center justify-center ${isActive ? activeClasses : inactiveClasses}`}>
                                <Icon className="w-6 h-6" />
                            </NavLink>
                        ))}

                        <div className="md:hidden flex gap-2 border-l pl-2 ml-1 border-slate-800">
                            {secondaryLinks.map(({ to, label, icon: Icon, activeClasses, inactiveClasses }) => (
                                <NavLink key={to} to={to} title={label} className={({ isActive }) => `p-3 rounded-xl transition-all flex items-center justify-center ${isActive ? activeClasses : inactiveClasses}`}>
                                    <Icon className="w-6 h-6" />
                                </NavLink>
                            ))}
                            <button onClick={logout} title={t('nav.logout')} className="p-3 rounded-xl transition-all text-slate-400 hover:bg-slate-800 hover:text-red-400 flex flex-col items-center justify-center">
                                <IconLogOut className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="hidden md:flex flex-col items-center gap-4 w-full">
                    {secondaryLinks.map(({ to, label, icon: Icon, activeClasses, inactiveClasses }) => (
                        <NavLink key={to} to={to} title={label} className={({ isActive }) => `p-3 rounded-xl transition-all flex items-center justify-center w-full ${isActive ? activeClasses : inactiveClasses}`}>
                            <Icon className="w-6 h-6" />
                        </NavLink>
                    ))}
                    <button onClick={logout} title={t('nav.logout')} className="p-3 rounded-xl transition-all text-slate-400 hover:bg-slate-800 hover:text-red-400 flex flex-col items-center justify-center w-full">
                        <IconLogOut className="w-6 h-6" />
                    </button>
                </div>
            </nav>
            <main className="max-w-3xl mx-auto p-4 md:p-8 pt-6 md:pt-8">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white">{getTitle()}</h1>
                        {isProMember && trialDaysLeft !== null && trialDaysLeft > 0 && (
                            <p className="text-sm font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block mt-1">
                                {t('dashboard.trialMessage', { days: trialDaysLeft })}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            {currentUser && (currentUser.firstName || currentUser.lastName) ? (
                                <p className="font-semibold text-slate-200">
                                    {currentUser.email === 'admin@optilife.ai' ? 'Admin' : `${currentUser.firstName} ${currentUser.lastName}`}
                                </p>
                            ) : (
                                <p className="font-semibold text-slate-200">{currentUser?.email}</p>
                            )}
                        </div>
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden border-2 border-slate-700 shadow-sm flex items-center justify-center">
                                {currentUser?.avatar ? (
                                    <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <IconUser className="w-6 h-6 text-slate-500" />
                                )}
                            </div>
                            {isProMember && <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-slate-900" title="Membre Pro"><IconStar className="w-3 h-3 text-slate-900" fill="currentColor" /></div>}
                        </div>
                    </div>
                </header>
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

const ProtectedRoute: React.FC = () => {
    const { currentUser, loading, completeOnboarding } = useContext(AuthContext);
    if (loading) return <div className="flex h-screen items-center justify-center"><IconLoader className="w-10 h-10 animate-spin text-brand-500" /></div>;

    if (!currentUser) return <Navigate to="/login" replace />;

    // Si l'onboarding n'est pas complété, on l'affiche par-dessus tout
    if (currentUser.onboardingCompleted === false) {
        return <OnboardingFlow onComplete={completeOnboarding} />;
    }

    return <MainLayout />;
};

const AdminProtectedRoute: React.FC = () => {
    const { currentUser, loading } = useContext(AuthContext);
    if (loading) return <div className="flex h-screen items-center justify-center"><IconLoader className="w-10 h-10 animate-spin text-brand-500" /></div>;
    if (!currentUser) return <Navigate to="/login" replace />;
    return currentUser.role === 'admin' ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

const AppContent: React.FC = () => {
    const { currentUser, updateCurrentUser, isProMember, upgradeToPro } = useContext(AuthContext);
    const userId = currentUser?.id;

    const userKey = (key: string) => `${key}_${userId}`;

    const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
    const [foodLogs, setFoodLogs] = useState<FoodItem[]>([]);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [fastingLogs, setFastingLogs] = useState<FastingLog[]>([]);
    const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
    const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
    const [userGoals, setUserGoals] = useState<UserGoals>({
        calories: 2200, protein: 120, carbs: 250, fat: 70, waterMl: 2500, activityMinutes: 30, fastingHours: 16, weight: 70, sleepHours: 8
    });
    const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({ waterReminders: false, waterIntervalHours: 2, mealReminders: false, mealIntervalHours: 4, dndStartHour: 22, dndEndHour: 8 });
    const [userProfile, setUserProfile] = useState<UserProfile>({ age: null, weightKg: null, heightCm: null, gender: null });
    const [firstLogDate, setFirstLogDate] = useState<number | null>(null);

    const [newlyEarnedBadges, setNewlyEarnedBadges] = useState<Omit<Badge, 'isEarned'>[]>([]);
    const [isProModalOpen, setIsProModalOpen] = useState(false);
    const [toast, setToast] = useState<ToastMessage | null>(null);

    useEffect(() => {
        if (!userId) {
            setWaterLogs([]); setFoodLogs([]); setActivityLogs([]); setFastingLogs([]); setSleepLogs([]); setWeightLogs([]); setEarnedBadges([]);
            return;
        };
        setWaterLogs(JSON.parse(localStorage.getItem(userKey('waterLogs')) || '[]'));
        setFoodLogs(JSON.parse(localStorage.getItem(userKey('foodLogs')) || '[]'));
        setActivityLogs(JSON.parse(localStorage.getItem(userKey('activityLogs')) || '[]'));
        setFastingLogs(JSON.parse(localStorage.getItem(userKey('fastingLogs')) || '[]'));
        setSleepLogs(JSON.parse(localStorage.getItem(userKey('sleepLogs')) || '[]'));
        setWeightLogs(JSON.parse(localStorage.getItem(userKey('weightLogs')) || '[]'));

        const loadedGoals = JSON.parse(localStorage.getItem(userKey('userGoals')) || '{}');
        setUserGoals({
            calories: loadedGoals.calories || 2200,
            protein: loadedGoals.protein || 120,
            carbs: loadedGoals.carbs || 250,
            fat: loadedGoals.fat || 70,
            waterMl: loadedGoals.waterMl || 2500,
            activityMinutes: loadedGoals.activityMinutes || 30,
            fastingHours: loadedGoals.fastingHours || 16,
            weight: loadedGoals.weight || 70,
            sleepHours: loadedGoals.sleepHours || 8
        });

        setEarnedBadges(JSON.parse(localStorage.getItem(userKey('earnedBadges')) || '[]'));
        setNotificationSettings(JSON.parse(localStorage.getItem(userKey('notificationSettings')) || '{"waterReminders": false, "waterIntervalHours": 2, "mealReminders": false, "mealIntervalHours": 4, "dndStartHour": 22, "dndEndHour": 8}'));
        setUserProfile(JSON.parse(localStorage.getItem(userKey('userProfile')) || '{"age": null, "weightKg": null, "heightCm": null, "gender": null}'));
        setFirstLogDate(JSON.parse(localStorage.getItem(userKey('firstLogDate')) || 'null'));
    }, [userId]);

    useEffect(() => { if (userId) localStorage.setItem(userKey('waterLogs'), JSON.stringify(waterLogs)); }, [waterLogs, userId]);
    useEffect(() => { if (userId) localStorage.setItem(userKey('foodLogs'), JSON.stringify(foodLogs)); }, [foodLogs, userId]);
    useEffect(() => { if (userId) localStorage.setItem(userKey('activityLogs'), JSON.stringify(activityLogs)); }, [activityLogs, userId]);
    useEffect(() => { if (userId) localStorage.setItem(userKey('fastingLogs'), JSON.stringify(fastingLogs)); }, [fastingLogs, userId]);
    useEffect(() => { if (userId) localStorage.setItem(userKey('sleepLogs'), JSON.stringify(sleepLogs)); }, [sleepLogs, userId]);
    useEffect(() => { if (userId) localStorage.setItem(userKey('weightLogs'), JSON.stringify(weightLogs)); }, [weightLogs, userId]);
    useEffect(() => { if (userId) localStorage.setItem(userKey('userGoals'), JSON.stringify(userGoals)); }, [userGoals, userId]);
    useEffect(() => { if (userId) localStorage.setItem(userKey('earnedBadges'), JSON.stringify(earnedBadges)); }, [earnedBadges, userId]);
    useEffect(() => { if (userId) localStorage.setItem(userKey('notificationSettings'), JSON.stringify(notificationSettings)); }, [notificationSettings, userId]);
    useEffect(() => { if (userId) localStorage.setItem(userKey('userProfile'), JSON.stringify(userProfile)); }, [userProfile, userId]);
    useEffect(() => { if (userId) localStorage.setItem(userKey('firstLogDate'), JSON.stringify(firstLogDate)); }, [firstLogDate, userId]);

    useEffect(() => {
        if (!userId) return;
        const newBadges = checkForNewBadges(foodLogs, waterLogs, activityLogs, fastingLogs, sleepLogs, earnedBadges, firstLogDate);
        if (newBadges.length > 0) {
            setNewlyEarnedBadges(current => [...current, ...newBadges]);
            setEarnedBadges(current => [...current, ...newBadges.map(b => b.id)]);
        }
    }, [foodLogs, waterLogs, activityLogs, fastingLogs, sleepLogs, earnedBadges, firstLogDate, userId]);

    const checkFirstLog = () => { if (!firstLogDate) setFirstLogDate(Date.now()); };
    const addWater = (amountMl: number) => { checkFirstLog(); setWaterLogs(prev => [...prev, { id: crypto.randomUUID(), amountMl, timestamp: Date.now() }]); };
    const removeWater = (id: string) => setWaterLogs(prev => prev.filter(l => l.id !== id));
    const addFood = (items: Omit<FoodItem, 'id' | 'timestamp'>[]) => { checkFirstLog(); setFoodLogs(prev => [...prev, ...items.map(item => ({ ...item, id: crypto.randomUUID(), timestamp: Date.now() }))]); };
    const removeFood = (id: string) => setFoodLogs(prev => prev.filter(l => l.id !== id));
    const addActivity = (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => { checkFirstLog(); setActivityLogs(p => [...p, { ...activity, id: crypto.randomUUID(), timestamp: Date.now() }]); };
    const removeActivity = (id: string) => setActivityLogs(p => p.filter(l => l.id !== id));
    const startFasting = (goalHours: number) => { checkFirstLog(); setFastingLogs(p => [...p.filter(f => f.status !== 'active'), { id: crypto.randomUUID(), startTime: Date.now(), endTime: null, goalHours, status: 'active' }]); };
    const endFasting = () => { setFastingLogs(p => p.map(f => f.status === 'active' ? { ...f, status: 'completed', endTime: Date.now() } : f)); };
    const addFastingLog = (log: Omit<FastingLog, 'id'>) => { checkFirstLog(); setFastingLogs(p => [...p, { ...log, id: crypto.randomUUID() }]); };
    const removeFasting = (id: string) => setFastingLogs(p => p.filter(f => f.id !== id));
    const addSleep = (log: Omit<SleepLog, 'id' | 'timestamp'>) => { checkFirstLog(); setSleepLogs(p => [...p, { ...log, id: crypto.randomUUID(), timestamp: Date.now() }]); };
    const removeSleep = (id: string) => setSleepLogs(p => p.filter(l => l.id !== id));

    const handleProfileUpdate = (newProfile: UserProfile) => {
        if (newProfile.weightKg && newProfile.weightKg !== userProfile.weightKg) {
            setWeightLogs(prev => {
                const newLog = { id: crypto.randomUUID(), weightKg: newProfile.weightKg!, timestamp: Date.now() };
                return [...prev, newLog].sort((a, b) => a.timestamp - b.timestamp);
            });
        }
        setUserProfile(newProfile);
    };

    const closeBadgeModal = () => setNewlyEarnedBadges(current => current.slice(1));
    const commonProps = { onUpgradeClick: () => setIsProModalOpen(true), isProMember };

    return (
        <>
            {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
            {newlyEarnedBadges.length > 0 && <BadgeModal badge={newlyEarnedBadges[0]} onClose={closeBadgeModal} />}
            {isProModalOpen && <ProModal onClose={() => setIsProModalOpen(false)} />}
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/pricing" element={<PricingPage />} />

                {/* Legal Pages */}
                <Route path="/legal" element={<LegalNotice />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />

                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard waterLogs={waterLogs} foodLogs={foodLogs} activityLogs={activityLogs} fastingLogs={fastingLogs} weightLogs={weightLogs} sleepLogs={sleepLogs} profile={userProfile} goals={userGoals} earnedBadgeIds={earnedBadges} {...commonProps} />} />
                    <Route path="/coaching" element={<CoachingPage />} />
                    <Route path="/water" element={<WaterTracker logs={waterLogs} onAdd={addWater} onDelete={removeWater} {...commonProps} />} />
                    <Route path="/food" element={<FoodTracker logs={foodLogs} onAdd={addFood} onDelete={removeFood} goals={userGoals} {...commonProps} />} />
                    <Route path="/activity" element={<ActivityTracker logs={activityLogs} onAdd={addActivity} onDelete={removeActivity} isProMember={isProMember} onUpgradeClick={commonProps.onUpgradeClick} profile={userProfile} />} />
                    <Route path="/fasting" element={<FastingTracker fastingLogs={fastingLogs} onStart={startFasting} onEnd={endFasting} onAdd={addFastingLog} onDelete={removeFasting} goalHours={userGoals.fastingHours} {...commonProps} />} />
                    <Route path="/sleep" element={<SleepTracker logs={sleepLogs} onAdd={addSleep} onDelete={removeSleep} goals={userGoals} {...commonProps} />} />
                    <Route path="/settings" element={<Settings settings={notificationSettings} onSettingsChange={setNotificationSettings} profile={userProfile} onProfileChange={handleProfileUpdate} goals={userGoals} onGoalsChange={setUserGoals} updateCurrentUser={updateCurrentUser} />} />
                    <Route path="/badges" element={<BadgesPage earnedBadgeIds={earnedBadges} />} />

                    <Route element={<AdminProtectedRoute />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                    </Route>
                </Route>
            </Routes>
        </>
    );
};

const App: React.FC = () => (
    <HashRouter>
        <AuthProvider>
            <I18nProvider>
                <AppContent />
            </I18nProvider>
        </AuthProvider>
    </HashRouter>
);

export default App;