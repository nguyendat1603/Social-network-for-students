export const API_CONFIG = {
  baseUrl:
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabasePublishableKey:
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
};
