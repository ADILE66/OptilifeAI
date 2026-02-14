
import type { FC } from 'react';

export interface User {
  id: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  avatar?: string;
  firstName?: string;
  lastName?: string;
  trialStartedAt?: number;
  onboardingCompleted?: boolean;
}

export interface UserProfile {
  age: number | null;
  weightKg: number | null;
  heightCm: number | null;
  gender?: 'male' | 'female' | 'other' | null;
  mainGoal?: string;
  motivation?: string;
  healthIssues?: string[];
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isProMember: boolean;
  trialDaysLeft: number | null;
  login: (email: string, password: string) => Promise<User | null>;
  signup: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  updateCurrentUser: (updatedUser: User) => void;
  upgradeToPro: () => void;
  completeOnboarding: () => void;
}

export interface UserGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number;
  activityMinutes: number;
  fastingHours: number;
  weight?: number;
  sleepHours: number;
}

// Added missing types to fix compilation errors

export interface WaterLog {
  id: string;
  amountMl: number;
  timestamp: number;
}

export interface FoodItem {
  id: string;
  timestamp: number;
  name: string;
  portion: string;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  image?: string;
}

export interface FoodItemAnalysis {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface AIAnalysisResult {
  items: FoodItemAnalysis[];
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  prepTimeMinutes: number;
  ingredients: string[];
  instructions: string[];
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  imageUrl?: string;
}

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legendary';
export type BadgeCategory = 'special' | 'streak' | 'activity' | 'fasting' | 'sleep' | 'total' | 'anniversary';

export interface Badge {
  id: string;
  nameKey: string;
  descriptionKey: string;
  icon: FC<{ className?: string }>;
  tier: BadgeTier;
  category: BadgeCategory;
  value: number;
  isEarned: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: number;
  activityName: string;
  durationMinutes: number;
  caloriesBurned: number;
  steps?: number;
  icon?: string;
}

export interface FastingLog {
  id: string;
  startTime: number;
  endTime: number | null;
  goalHours: number;
  status: 'active' | 'completed';
}

export interface WeightLog {
  id: string;
  weightKg: number;
  timestamp: number;
}

export interface SleepLog {
  id: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  quality: 'bad' | 'average' | 'good' | 'excellent';
  timestamp: number;
}

export interface NotificationSettings {
  waterReminders: boolean;
  waterIntervalHours: number;
  mealReminders: boolean;
  mealIntervalHours: number;
  dndStartHour: number;
  dndEndHour: number;
}

export interface ToastMessage {
  message: string;
  type: 'success' | 'error';
}
