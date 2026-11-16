import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../../config/routes.config';
import { useAuth } from '../../../hooks/useAuth';
import { identityService } from '../../../services/identity.service';

export const OtpVerificationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const state = (location.state || {}) as {
    email?: string;
    devOtpPreview?: string;
    inferredStudentCode?: string;
  };

  const [email, setEmail] = useState(state.email || new URLSearchParams(location.search).get('email') || '');
  const [otpCode, setOtpCode] = useState(import.meta.env.DEV ? state.devOtpPreview || '' : '');
  const [devPreview, setDevPreview] = useState(import.meta.env.DEV ? state.devOtpPreview || '' : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (!cooldown) return;
    const timer = window.setTimeout(() => setCooldown(value => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await identityService.verifyOtp(email, otpCode);
      setSession(res.user, res.accessToken, res.refreshToken);
      navigate(APP_ROUTES.ACADEMIC_PROFILE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xác thực OTP thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resending || cooldown || !email) return;
    setResending(true);
    setError(null);
    setInfo(null);
    try {
      const res = await identityService.resendOtp(email);
      if (import.meta.env.DEV && res.devOtpPreview) {
        setDevPreview(res.devOtpPreview);
        setOtpCode(res.devOtpPreview);
      }
      setCooldown(60);
      setInfo('Đã gửi lại mã OTP 6 chữ số mới!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi lại OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="campus-auth"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 460,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: 32,
        }}
      >
        <h1 style={{ fontSize: 21, fontWeight: 800 }}>
          🔐 Xác thực OTP Email Sinh viên
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
          Nhập mã OTP gồm 6 chữ số (hiệu lực 5 phút, tối đa 5 lần thử) để kích hoạt huy hiệu{' '}
          <strong style={{ color: 'var(--color-charcoal-ink)' }}>Verified Student</strong>.
        </p>

        {import.meta.env.DEV && devPreview && (
          <div
            style={{
              marginTop: 14,
              padding: '10px 14px',
              borderRadius: 9,
              background: 'var(--color-fog-mist)',
              border: '1px solid var(--color-fog-mist)',
              fontSize: 13,
              color: 'var(--color-charcoal-ink)',
            }}
          >
            💡 <strong>Dev Mode OTP Preview:</strong> Mã OTP của bạn là{' '}
            <code style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-charcoal-ink)' }}>
              {devPreview}
            </code>
          </div>
        )}

        {info && (
          <div
            style={{
              marginTop: 14,
              padding: '10px 14px',
              borderRadius: 9,
              background: 'var(--color-highlight-yellow)',
              color: 'var(--color-charcoal-ink)',
              fontSize: 13,
            }}
          >
            {info}
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: 14,
              padding: '10px 14px',
              borderRadius: 9,
              background: 'var(--color-fog-mist)',
              color: 'var(--color-charcoal-ink)',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleVerify}
          style={{
            marginTop: 18,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div>
            <label htmlFor="OtpVerificationPage-field-1" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Email sinh viên (.edu)
            </label>
            <input id="OtpVerificationPage-field-1"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="OtpVerificationPage-field-2" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Mã OTP (6 chữ số)
            </label>
            <input id="OtpVerificationPage-field-2"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              pattern="\d{6}"
              placeholder="123456"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              style={{
                fontSize: 20,
                letterSpacing: '0.3em',
                textAlign: 'center',
                fontWeight: 700,
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'var(--brand-primary)',
              color: '#fff',
              border: 'none',
              padding: '12px',
              borderRadius: 9,
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            {loading ? 'Đang xác thực...' : 'Xác nhận OTP & Nhận Huy hiệu Verified Student'}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={loading || resending || cooldown > 0 || !email}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              padding: '10px',
              borderRadius: 9,
              fontSize: 13,
            }}
          >
            {resending ? 'Đang gửi…' : cooldown ? `Gửi lại sau ${cooldown} giây` : 'Gửi lại mã OTP'}
          </button>
        </form>
        <Link to={APP_ROUTES.LOGIN}>← Về đăng nhập</Link>
      </div>
    </div>
  );
};
