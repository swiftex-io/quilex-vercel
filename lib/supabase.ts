
import { createClient } from '@supabase/supabase-js';

// Detekcija varijabli u zavisnosti od okruženja
// Vite (Vercel) koristi import.meta.env
// AI Studio može koristiti process.env
const getEnv = (key: string) => {
  try {
    return (import.meta as any).env?.[key] || (window as any).process?.env?.[key] || '';
  } catch {
    return '';
  }
};

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY');

const isPlaceholder = !SUPABASE_URL || 
                      SUPABASE_URL.includes('placeholder') || 
                      SUPABASE_URL === '';

// Fail-safe klijent koji ne blokira renderovanje ako nema ključeva
export const supabase = !isPlaceholder 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: async () => ({ error: null }),
        signInWithPassword: async () => ({ error: new Error("Supabase not configured") }),
        signUp: async () => ({ error: new Error("Supabase not configured") }),
      }
    } as any;

if (isPlaceholder) {
  console.log("Exchange running in Local/Guest mode (No Supabase detected).");
}
