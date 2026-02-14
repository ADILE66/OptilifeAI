import { User } from '../types';

const USERS_KEY = 'optilife_users';
const CURRENT_USER_SESSION_KEY = 'optilife_currentUser';

const getUsers = (): User[] => {
    try {
        const usersJson = localStorage.getItem(USERS_KEY);
        return usersJson ? JSON.parse(usersJson) : [];
    } catch (e) {
        return [];
    }
};

const saveUsers = (users: User[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const initMockDatabase = (): void => {
    const users = getUsers();
    
    // Vérifie si un administrateur existe déjà
    const adminExists = users.some(u => u.role === 'admin');
    
    if (!adminExists) {
        // En production, le premier utilisateur pourrait être invité à devenir admin
        // ou on garde cet admin par défaut pour la gestion initiale.
        const defaultAdmin: User = { 
            id: crypto.randomUUID(), 
            email: 'admin@optilife.ai', 
            password: 'ChangeMe2024!', // À changer impérativement dès la première connexion
            role: 'admin', 
            firstName: 'Admin', 
            lastName: 'System', 
            onboardingCompleted: true 
        };
        saveUsers([...users, defaultAdmin]);
    }
};

export const login = async (email: string, password: string): Promise<User | null> => {
    // Délai simulé pour l'expérience utilisateur
    await new Promise(resolve => setTimeout(resolve, 800));
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
        const userToStore = { ...user };
        delete userToStore.password; // Sécurité : on ne stocke jamais le mot de passe en session
        sessionStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(userToStore));
        return userToStore;
    }
    return null;
};

export const signup = async (email: string, password: string): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) return null;
    
    const newUser: User = { 
        id: crypto.randomUUID(), 
        email: email.toLowerCase(), 
        password, 
        role: 'user', 
        firstName: '', 
        lastName: '', 
        trialStartedAt: Date.now(), 
        onboardingCompleted: false 
    };
    
    users.push(newUser);
    saveUsers(users);
    
    const userToStore = { ...newUser };
    delete userToStore.password;
    sessionStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(userToStore));
    return userToStore;
};

export const createAdmin = async (email: string, password: string, firstName: string, lastName: string): Promise<User | null> => {
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) return null;
    const newAdmin: User = { 
        id: crypto.randomUUID(), 
        email: email.toLowerCase(), 
        password, 
        role: 'admin', 
        firstName, 
        lastName, 
        onboardingCompleted: true 
    };
    users.push(newAdmin);
    saveUsers(users);
    return newAdmin;
};

export const saveUserOnboardingStatus = (userId: string, completed: boolean) => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        users[userIndex].onboardingCompleted = completed;
        saveUsers(users);
    }
};

export const logout = (): void => { 
    sessionStorage.removeItem(CURRENT_USER_SESSION_KEY); 
};

export const getCurrentUser = (): User | null => {
    try {
        const userJson = sessionStorage.getItem(CURRENT_USER_SESSION_KEY);
        return userJson ? JSON.parse(userJson) : null;
    } catch (e) { return null; }
};

export const getAllUsers = (): User[] => getUsers().map(({ password, ...user }) => user);

export const deleteUser = (userId: string): void => { 
    const currentUsers = getUsers();
    const filteredUsers = currentUsers.filter(u => u.id !== userId);
    saveUsers(filteredUsers); 
    
    // Nettoyage complet des données LocalStorage pour respecter le RGPD
    const dataKeys = [
        'waterLogs', 'foodLogs', 'activityLogs', 'fastingLogs', 
        'sleepLogs', 'weightLogs', 'userGoals', 'earnedBadges', 
        'notificationSettings', 'userProfile', 'isProMember', 'trialStartedAt'
    ];
    dataKeys.forEach(key => localStorage.removeItem(`${key}_${userId}`));
};

export const updateUserRole = async (userId: string, role: 'user' | 'admin'): Promise<void> => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        users[userIndex].role = role;
        saveUsers(users);
    }
};

export const updateUserName = async (userId: string, firstName: string, lastName: string): Promise<User> => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("Utilisateur non trouvé");
    users[userIndex].firstName = firstName;
    users[userIndex].lastName = lastName;
    saveUsers(users);
    
    const sessionUser = getCurrentUser();
    if (sessionUser && sessionUser.id === userId) {
        updateCurrentUserInSession({ ...sessionUser, firstName, lastName });
    }
    
    const { password, ...userToReturn } = users[userIndex];
    return userToReturn;
};

export const changePassword = async (userId: string, oldPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return { success: false, message: "Utilisateur non trouvé." };
    if (users[userIndex].password !== oldPassword) return { success: false, message: "L'ancien mot de passe est incorrect." };
    users[userIndex].password = newPassword;
    saveUsers(users);
    return { success: true };
};

export const updateProfilePicture = async (userId: string, avatar: string): Promise<void> => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        users[userIndex].avatar = avatar;
        saveUsers(users);
    }
};

export const updateCurrentUserInSession = (user: User): void => {
    const userToStore = { ...user };
    delete userToStore.password;
    sessionStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(userToStore));
};