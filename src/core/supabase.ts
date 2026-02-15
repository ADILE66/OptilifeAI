import { createClient } from '@supabase/supabase-js';

// Configuration via variables d'environnement Vercel
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * CLIENT SUPABASE PROFESSIONNEL
 * - Ne bloque pas l'application au démarrage
 * - Gère le rafraîchissement des tokens automatiquement
 */
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storageKey: 'optilife_v2_session' // Nouveau nom pour éviter les conflits de cache
        }
    })
    : null;

export const isDev = import.meta.env.DEV;
