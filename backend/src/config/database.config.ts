import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { envConfig } from './env.config';

const activeSupabaseKey =
  envConfig.supabaseServiceRoleKey ||
  envConfig.supabasePublishableKey ||
  envConfig.supabaseAnonKey;

export const supabase: SupabaseClient = createClient(
  envConfig.supabaseUrl,
  activeSupabaseKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
