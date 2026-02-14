import React, { createContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../types';
import * as authService from '../services/authService';

export const AuthContext = createContext<AuthContextType>(null!);

const TRIAL_DURATION_DAYS = 7;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isProMember, setIsProMember] = useState(false);
    const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authService.initMockDatabase();
        const user = authService.getCurrentUser();
        if (user) {
            setCurrentUser(user);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (currentUser) {
            const userKey = (key: string) => `${key}_${currentUser.id}`;
            
            // VERIFICATION DU RETOUR STRIPE
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('success') === 'true') {
                localStorage.setItem(userKey('isProMember'), JSON.stringify(true));
                window.history.replaceState({}, document.title, window.location.pathname);
            }

            if (currentUser.role === 'admin') {
                setIsProMember(true);
                setTrialDaysLeft(null);
                return;
            }

            const storedIsPro = JSON.parse(localStorage.getItem(userKey('isProMember')) || 'false');
            if (storedIsPro) {
                setIsProMember(true);
                setTrialDaysLeft(null);
                return;
            }

            if (currentUser.trialStartedAt) {
                const msSinceTrialStart = Date.now() - currentUser.trialStartedAt;
                const daysSinceTrialStart = msSinceTrialStart / (1000 * 60 * 60 * 24);
                if (daysSinceTrialStart < TRIAL_DURATION_DAYS) {
                    setIsProMember(true);
                    setTrialDaysLeft(Math.ceil(TRIAL_DURATION_DAYS - daysSinceTrialStart));
                } else {
                    setIsProMember(false);
                    setTrialDaysLeft(0);
                }
            } else {
                setIsProMember(false);
                setTrialDaysLeft(null);
            }
        } else {
            setIsProMember(false);
            setTrialDaysLeft(null);
        }
    }, [currentUser]);

    const login = async (email: string, password: string): Promise<User | null> => {
        const user = await authService.login(email, password);
        setCurrentUser(user);
        return user;
    };

    const signup = async (email: string, password: string): Promise<User | null> => {
        const user = await authService.signup(email, password);
        setCurrentUser(user);
        return user;
    };

    const logout = () => {
        authService.logout();
        setCurrentUser(null);
    };

    const updateCurrentUser = (updatedUser: User) => {
        setCurrentUser(updatedUser);
        authService.updateCurrentUserInSession(updatedUser);
    };

    const upgradeToPro = () => {
        if (currentUser) {
            const userKey = (key: string) => `${key}_${currentUser.id}`;
            localStorage.setItem(userKey('isProMember'), JSON.stringify(true));
            setCurrentUser({ ...currentUser }); 
        }
    };

    const completeOnboarding = () => {
        if (currentUser) {
            const updatedUser = { ...currentUser, onboardingCompleted: true };
            updateCurrentUser(updatedUser);
            authService.saveUserOnboardingStatus(currentUser.id, true);
        }
    };

    return (
        <AuthContext.Provider value={{ 
            currentUser, 
            loading, 
            isProMember, 
            trialDaysLeft, 
            login, 
            signup, 
            logout, 
            updateCurrentUser, 
            upgradeToPro,
            completeOnboarding
        }}>
            {children}
        </AuthContext.Provider>
    );
};