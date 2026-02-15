import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

interface AuthState {
    user: any;
    loading: boolean;
    isPro: boolean;
}

const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPro, setIsPro] = useState(false);

    useEffect(() => {
        // Initialisation de la session
        const initSession = async () => {
            if (!supabase) {
                setLoading(false);
                return;
            }

            try {
                const { data: { session } } = await supabase.auth.getSession();
                setUser(session?.user ?? null);
            } catch (error) {
                console.error('Session Init Error:', error);
            } finally {
                setLoading(false);
            }
        };

        initSession();

        // Écouteur en temps réel (Supabase)
        const { data: { subscription } } = supabase?.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        }) ?? { data: { subscription: { unsubscribe: () => { } } } };

        return () => subscription.unsubscribe();
    }, []);

    // Détection du statut PRO
    useEffect(() => {
        if (user) {
            // Logique de vérification simplifiée et robuste
            const proStatus = localStorage.getItem(`pro_${user.id}`) === 'true';
            setIsPro(proStatus);
        }
    }, [user]);

    const logout = async () => {
        if (supabase) await supabase.auth.signOut();
        setUser(null);
        localStorage.clear();
    };

    return (
        <AuthContext.Provider value={{ user, loading, isPro, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
