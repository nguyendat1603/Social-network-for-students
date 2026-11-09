import dotenv from 'dotenv';

dotenv.config();

export const envConfig = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  supabaseUrl: process.env.SUPABASE_URL || '',
  supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  jwtAccessSecret:
    process.env.JWT_ACCESS_SECRET || 'dev_only_fallback_change_in_env',
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET || 'dev_only_refresh_fallback_change_in_env',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1d',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  allowedEduDomains: (
    process.env.ALLOWED_EDU_DOMAINS ||
    'sis.hust.edu.vn,hust.edu.vn,vnu.edu.vn,fpt.edu.vn,ptit.edu.vn,uet.vnu.edu.vn,neu.edu.vn,hcmut.edu.vn,uit.edu.vn,edu.vn,edu'
  )
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean),

  otpTtlSeconds: Number(process.env.OTP_TTL_SECONDS || 300),
  otpMaxAttempts: Number(process.env.OTP_MAX_ATTEMPTS || 5),
  otpResendCooldownSeconds: Number(
    process.env.OTP_RESEND_COOLDOWN_SECONDS || 60
  ),
  anonymousHandleCooldownDays: Number(
    process.env.ANONYMOUS_HANDLE_COOLDOWN_DAYS || 30
  ),
};
