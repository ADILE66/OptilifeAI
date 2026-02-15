import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
    WaterLog, FoodItem, ActivityLog, FastingLog, SleepLog, WeightLog,
    UserGoals, Badge, NotificationSettings, UserProfile
} from '../types';
import { useAuth } from './AuthContext';
import { checkForNewBadges } from '../utils/badgeManager';

interface DataContextType {
    waterLogs: WaterLog[];
    foodLogs: FoodItem[];
    activityLogs: ActivityLog[];
    fastingLogs: FastingLog[];
    sleepLogs: SleepLog[];
    weightLogs: WeightLog[];
    userGoals: UserGoals;
    earnedBadgeIds: string[];
    userProfile: UserProfile;

    addWater: (amountMl: number) => void;
    deleteWater: (id: string) => void;
    addFood: (items: Omit<FoodItem, 'id' | 'timestamp'>[]) => void;
    deleteFood: (id: string) => void;
    addActivity: (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
    deleteActivity: (id: string) => void;
    startFasting: (goalHours: number) => void;
    endFasting: () => void;
    addFastingLog: (log: Omit<FastingLog, 'id'>) => void;
    deleteFasting: (id: string) => void;
    addSleep: (log: Omit<SleepLog, 'id' | 'timestamp'>) => void;
    deleteSleep: (id: string) => void;
    deleteWeight: (id: string) => void;
    updateGoals: (goals: Partial<UserGoals>) => void;
    updateProfile: (profile: Partial<UserProfile>) => void;

    newlyEarnedBadges: Omit<Badge, 'isEarned'>[];
    clearNewBadge: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const userId = currentUser?.id;

    const userKey = (key: string) => `${key}_${userId}`;

    // State
    const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
    const [foodLogs, setFoodLogs] = useState<FoodItem[]>([]);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [fastingLogs, setFastingLogs] = useState<FastingLog[]>([]);
    const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
    const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
    const [userGoals, setUserGoals] = useState<UserGoals>({
        calories: 2200, protein: 120, carbs: 250, fat: 70, waterMl: 2500, activityMinutes: 30, fastingHours: 16, weight: 70, sleepHours: 8
    });
    const [earnedBadgeIds, setEarnedBadgeIds] = useState<string[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile>({ age: null, weightKg: null, heightCm: null, gender: null });
    const [firstLogDate, setFirstLogDate] = useState<number | null>(null);
    const [newlyEarnedBadges, setNewlyEarnedBadges] = useState<Omit<Badge, 'isEarned'>[]>([]);

    // Persistence Layer (LocalStorage for now, as in App_old.tsx)
    useEffect(() => {
        if (!userId) return;

        const load = (key: string, def = '[]') => JSON.parse(localStorage.getItem(userKey(key)) || def);

        setWaterLogs(load('waterLogs'));
        setFoodLogs(load('foodLogs'));
        setActivityLogs(load('activityLogs'));
        setFastingLogs(load('fastingLogs'));
        setSleepLogs(load('sleepLogs'));
        setWeightLogs(load('weightLogs'));
        setUserGoals(load('userGoals', JSON.stringify(userGoals)));
        setEarnedBadgeIds(load('earnedBadgeIds'));
        setUserProfile(load('userProfile', JSON.stringify(userProfile)));
        setFirstLogDate(load('firstLogDate', 'null'));
    }, [userId]);

    useEffect(() => { if (userId) localStorage.setItem(userKey('waterLogs'), JSON.stringify(waterLogs)); }, [waterLogs, userId]);
    useEffect(() => { if (userId) localStorage.setItem(userKey('foodLogs'), JSON.stringify(foodLogs)); }, [foodLogs, userId]);
    useEffect(() => { if (userId) localStorage.setItem(userKey('activityLogs'), JSON.stringify(activityLogs)); }, [activityLogs, userId]);
    useEffect(() => { if (userId) localStorage.setItem(userKey('fastingLogs'), JSON.stringify(fastingLogs)); }, [fastingLogs, userId]);
    useEffect(() => { if (userId) localStorage.setItem(userKey('sleepLogs'), JSON.stringify(sleepLogs)); }, [sleepLogs, userId]);
    useEffect(() => { if (userId) localStorage.setItem(userKey('weightLogs'), JSON.stringify(weightLogs)); }, [weightLogs, userId]);
    useEffect(() => { if (userId) localStorage.setItem(userKey('userGoals'), JSON.stringify(userGoals)); }, [userGoals, userId]);
    useEffect(() => { if (userId) localStorage.setItem(userKey('earnedBadgeIds'), JSON.stringify(earnedBadgeIds)); }, [earnedBadgeIds, userId]);
    useEffect(() => { if (userId) localStorage.setItem(userKey('userProfile'), JSON.stringify(userProfile)); }, [userProfile, userId]);
    useEffect(() => { if (userId) localStorage.setItem(userKey('firstLogDate'), JSON.stringify(firstLogDate)); }, [firstLogDate, userId]);

    // Badge Checking
    useEffect(() => {
        if (!userId) return;
        const newBadges = checkForNewBadges(foodLogs, waterLogs, activityLogs, fastingLogs, sleepLogs, earnedBadgeIds, firstLogDate);
        if (newBadges.length > 0) {
            setNewlyEarnedBadges(current => [...current, ...newBadges]);
            setEarnedBadgeIds(current => [...current, ...newBadges.map(b => b.id)]);
        }
    }, [foodLogs, waterLogs, activityLogs, fastingLogs, sleepLogs, earnedBadgeIds, firstLogDate, userId]);

    // Actions
    const checkFirstLog = () => { if (!firstLogDate) setFirstLogDate(Date.now()); };

    const addWater = (amountMl: number) => {
        checkFirstLog();
        setWaterLogs(prev => [...prev, { id: crypto.randomUUID(), amountMl, timestamp: Date.now() }]);
    };
    const deleteWater = (id: string) => setWaterLogs(prev => prev.filter(l => l.id !== id));

    const addFood = (items: Omit<FoodItem, 'id' | 'timestamp'>[]) => {
        checkFirstLog();
        setFoodLogs(prev => [...prev, ...items.map(item => ({ ...item, id: crypto.randomUUID(), timestamp: Date.now() }))]);
    };
    const deleteFood = (id: string) => setFoodLogs(prev => prev.filter(l => l.id !== id));

    const addActivity = (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => {
        checkFirstLog();
        setActivityLogs(p => [...p, { ...activity, id: crypto.randomUUID(), timestamp: Date.now() }]);
    };
    const deleteActivity = (id: string) => setActivityLogs(p => p.filter(l => l.id !== id));

    const startFasting = (goalHours: number) => {
        checkFirstLog();
        setFastingLogs(p => [...p.filter(f => f.status !== 'active'), { id: crypto.randomUUID(), startTime: Date.now(), endTime: null, goalHours, status: 'active' }]);
    };
    const endFasting = () => {
        setFastingLogs(p => p.map(f => f.status === 'active' ? { ...f, status: 'completed', endTime: Date.now() } : f));
    };
    const addFastingLog = (log: Omit<FastingLog, 'id'>) => {
        checkFirstLog();
        setFastingLogs(p => [...p, { ...log, id: crypto.randomUUID() }]);
    };
    const deleteFasting = (id: string) => setFastingLogs(p => p.filter(f => f.id !== id));

    const addSleep = (log: Omit<SleepLog, 'id' | 'timestamp'>) => {
        checkFirstLog();
        setSleepLogs(p => [...p, { ...log, id: crypto.randomUUID(), timestamp: Date.now() }]);
    };
    const deleteSleep = (id: string) => setSleepLogs(p => p.filter(l => l.id !== id));

    const deleteWeight = (id: string) => setWeightLogs(p => p.filter(l => l.id !== id));

    const updateGoals = (goals: Partial<UserGoals>) => setUserGoals(prev => ({ ...prev, ...goals }));

    const updateProfile = (profile: Partial<UserProfile>) => {
        if (profile.weightKg && profile.weightKg !== userProfile.weightKg) {
            setWeightLogs(prev => {
                const newLog = { id: crypto.randomUUID(), weightKg: profile.weightKg!, timestamp: Date.now() };
                return [...prev, newLog].sort((a, b) => a.timestamp - b.timestamp);
            });
        }
        setUserProfile(prev => ({ ...prev, ...profile }));
    };

    const clearNewBadge = () => setNewlyEarnedBadges(current => current.slice(1));

    return (
        <DataContext.Provider value={{
            waterLogs, foodLogs, activityLogs, fastingLogs, sleepLogs, weightLogs,
            userGoals, earnedBadgeIds, userProfile,
            addWater, deleteWater, addFood, deleteFood, addActivity, deleteActivity,
            startFasting, endFasting, addFastingLog, deleteFasting, addSleep, deleteSleep,
            deleteWeight,
            updateGoals, updateProfile,
            newlyEarnedBadges, clearNewBadge
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within DataProvider');
    return context;
};
