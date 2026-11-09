import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

  const [email, setEmail] = useState(state.email || '');
  const [otpCode, setOtpCode] = useState(state.devOtpPreview || '');
  const [devPreview, setDevPreview] = useState(state.devOtpPreview || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

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
    setError(null);
    setInfo(null);
    try {
      const res = await identityService.resendOtp(email);
      if (res.devOtpPreview) {
        setDevPreview(res.devOtpPreview);
        setOtpCode(res.devOtpPreview);
      }
      setInfo('Đã gửi lại mã OTP 6 chữ số mới!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi lại OTP.');
    }
  };

  return (
    <div
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
          <strong style={{ color: '#34d399' }}>Verified Student</strong>.
        </p>

        {devPreview && (
          <div
            style={{
              marginTop: 14,
              padding: '10px 14px',
              borderRadius: 8,
              background: 'rgba(59, 130, 246, 0.16)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              fontSize: 13,
              color: '#93c5fd',
            }}
          >
            💡 <strong>Dev Mode OTP Preview:</strong> Mã OTP của bạn là{' '}
            <code style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>
              {devPreview}
            </code>
          </div>
        )}

        {info && (
          <div
            style={{
              marginTop: 14,
              padding: '10px 14px',
              borderRadius: 8,
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
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
              borderRadius: 8,
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
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
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Email sinh viên (.edu)
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Mã OTP (6 chữ số)
            </label>
            <input
              required
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
              background: 'var(--accent-emerald)',
              color: '#06281e',
              border: 'none',
              padding: '12px',
              borderRadius: 8,
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            {loading ? 'Đang xác thực...' : 'Xác nhận OTP & Nhận Huy hiệu Verified Student'}
          </button>

          <button
            type="button"
            onClick={handleResend}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              padding: '10px',
              borderRadius: 8,
              fontSize: 13,
            }}
          >
            Gửi lại mã OTP (Cooldown 60 giây)
          </button>
        </form>
      </div>
    </div>
  );
};
