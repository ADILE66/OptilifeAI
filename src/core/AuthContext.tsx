import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProMember, setIsProMember] = useState(true); // Enabled by default for testing/review
    const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(7);

    useEffect(() => {
        const initSession = async () => {
            if (!supabase) {
                setLoading(false);
                return;
            }

            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUser({
                        id: session.user.id,
                        email: session.user.email!,
                        role: 'user', // Default
                        onboardingCompleted: localStorage.getItem(`onboarding_${session.user.id}`) === 'true'
                    });
                }
            } catch (error) {
                console.error('Session Init Error:', error);
            } finally {
                setLoading(false);
            }
        };

        initSession();

        const { data: { subscription } } = supabase?.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    role: 'user',
                    onboardingCompleted: localStorage.getItem(`onboarding_${session.user.id}`) === 'true'
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        }) ?? { data: { subscription: { unsubscribe: () => { } } } };

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (user) {
            const proStatus = localStorage.getItem(`pro_${user.id}`) === 'true';
            setIsProMember(proStatus);
        }
    }, [user]);

    const login = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data.user as any;
    };

    const signup = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        return data.user as any;
    };

    const logout = async () => {
        if (supabase) await supabase.auth.signOut();
        setUser(null);
        localStorage.clear();
    };

    const upgradeToPro = () => {
        if (user) {
            localStorage.setItem(`pro_${user.id}`, 'true');
            setIsProMember(true);
        }
    };

    const completeOnboarding = () => {
        if (user) {
            localStorage.setItem(`onboarding_${user.id}`, 'true');
            setUser({ ...user, onboardingCompleted: true });
        }
    };

    return (
        <AuthContext.Provider value={{
            currentUser: user,
            loading,
            isProMember,
            trialDaysLeft,
            login,
            signup,
            logout,
            updateCurrentUser: (u) => setUser(prev => prev ? { ...prev, ...u } : null),
            upgradeToPro,
            completeOnboarding
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
