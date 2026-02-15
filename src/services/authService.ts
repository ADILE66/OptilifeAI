import { supabase } from '../core/supabase';
import { User } from '../types';

export const login = async (email: string, password: string): Promise<User | null> => {
    if (!supabase) throw new Error("Supabase is not configured. Please check your environment variables.");

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error('Login error:', error.message);
        throw error;
    }

    if (data.user) {
        return fetchUserProfile(data.user.id, data.user.email!);
    }
    return null;
};

export const signup = async (email: string, password: string): Promise<User | null> => {
    if (!supabase) throw new Error("Supabase is not configured.");

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        console.error('Signup error:', error.message);
        throw error;
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
    console.log("Fetching profile for UID:", id);
    try {
        let { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.log("Profile fetch error code:", error.code);
            // If profile doesn't exist, create it (fallback for trigger)
            if (error.code === 'PGRST116') {
                console.log('Profile missing, creating one for:', id);
                const now = new Date().toISOString();
                const { data: newData, error: insertError } = await supabase
                    .from('profiles')
                    .insert([{
                        id,
                        first_name: '',
                        last_name: '',
                        role: 'user',
                        trial_started_at: now
                    }])
                    .select()
                    .single();

                if (insertError) {
                    console.error('Error creating profile fallback:', insertError.message);
                    return { id, email, role: 'user', onboardingCompleted: false, isProMember: true, trialStartedAt: Date.now() };
                }
                data = newData;
            } else {
                console.error('Error fetching profile:', error.message);
                return { id, email, role: 'user', onboardingCompleted: false, isProMember: false };
            }
        }

        console.log("Profile data loaded successfully");
        return {
            id: data.id,
            email: email,
            role: (data.role as 'user' | 'admin') || 'user',
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            avatar: data.avatar_url || '',
            onboardingCompleted: !!data.onboarding_completed,
            isProMember: !!data.is_pro_member,
            // Fallback to now if trial_started_at is missing for some reason
            trialStartedAt: new Date(data.trial_started_at || Date.now()).getTime(),
        };
    } catch (err) {
        console.error('Unexpected error in fetchUserProfile:', err);
        return { id, email, role: 'user', onboardingCompleted: false, isProMember: false };
    }
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

export const changePassword = async (userId: string, oldPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    // Note: Supabase doesn't require oldPassword to update password in a logged-in session, 
    // but some apps prefer it for security. Here we just update it.
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, message: error.message };
    return { success: true };
};

export const deleteUser = async (userId: string): Promise<void> => {
    // In a real Supabase app, you'd need an Edge Function or Service Role to delete a user.
    // For now, we delete the profile.
    const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

    if (error) {
        console.error('Error deleting user profile:', error.message);
    }
};

export const getAllUsers = async (): Promise<User[]> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*');

    if (error) {
        console.error('Error fetching all users:', error.message);
        return [];
    }

    return (data || []).map(profile => ({
        id: profile.id,
        email: 'user@example.com', // Email is in auth.users, not profiles by default in this schema
        role: profile.role as 'user' | 'admin',
        firstName: profile.first_name,
        lastName: profile.last_name,
        avatar: profile.avatar_url,
        onboardingCompleted: profile.onboarding_completed,
        isProMember: profile.is_pro_member,
        trialStartedAt: profile.trial_started_at ? new Date(profile.trial_started_at).getTime() : undefined,
    }));
};

export const updateUserRole = async (userId: string, role: 'user' | 'admin'): Promise<void> => {
    const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

    if (error) {
        console.error('Error updating user role:', error.message);
    }
};

export const createAdmin = async (adminData: any): Promise<void> => {
    const { email, password, firstName, lastName } = adminData;
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name: firstName,
                last_name: lastName,
                role: 'admin'
            }
        }
    });

    if (error) {
        console.error('Error creating admin:', error.message);
        throw error;
    }
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