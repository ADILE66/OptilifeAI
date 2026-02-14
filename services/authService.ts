import { supabase } from '../lib/supabase';
import { User } from '../types';

export const login = async (email: string, password: string): Promise<User | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error('Login error:', error.message);
        return null;
    }

    if (data.user) {
        return fetchUserProfile(data.user.id, data.user.email!);
    }
    return null;
};

export const signup = async (email: string, password: string): Promise<User | null> => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        console.error('Signup error:', error.message);
        return null;
    }

    if (data.user) {
        return fetchUserProfile(data.user.id, data.user.email!);
    }
    return null;
};

export const signInWithGoogle = async (): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin,
        },
    });

    if (error) {
        console.error('Google Sign-In error:', error.message);
    }
};

export const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
};

export const getCurrentUser = async (): Promise<User | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
        return fetchUserProfile(session.user.id, session.user.email!);
    }
    return null;
};

const fetchUserProfile = async (id: string, email: string): Promise<User> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching profile:', error.message);
        return { id, email, role: 'user' };
    }

    return {
        id: data.id,
        email: email,
        role: data.role as 'user' | 'admin',
        firstName: data.first_name,
        lastName: data.last_name,
        avatar: data.avatar_url,
        onboardingCompleted: data.onboarding_completed,
        trialStartedAt: data.trial_started_at ? new Date(data.trial_started_at).getTime() : undefined,
    };
};

export const saveUserOnboardingStatus = async (userId: string, completed: boolean) => {
    const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: completed })
        .eq('id', userId);

    if (error) {
        console.error('Error updating onboarding status:', error.message);
    }
};

export const updateUserName = async (userId: string, firstName: string, lastName: string): Promise<void> => {
    const { error } = await supabase
        .from('profiles')
        .update({ first_name: firstName, last_name: lastName })
        .eq('id', userId);

    if (error) {
        console.error('Error updating user name:', error.message);
        throw error;
    }
};

export const changePassword = async (newPassword: string): Promise<{ success: boolean; message?: string }> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, message: error.message };
    return { success: true };
};

export const updateProfilePicture = async (userId: string, avatarUrl: string): Promise<void> => {
    const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId);

    if (error) {
        console.error('Error updating profile picture:', error.message);
    }
};