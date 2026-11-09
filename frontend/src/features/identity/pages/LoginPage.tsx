import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../../config/routes.config';
import { useAuth } from '../../../hooks/useAuth';
import { identityService } from '../../../services/identity.service';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await identityService.login(email, password);
      setSession(res.user, res.accessToken, res.refreshToken);
      navigate(APP_ROUTES.ACADEMIC_PROFILE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSchoolSso = async () => {
    setLoading(true);
    setError(null);
    try {
      const ssoEmail = email.trim() || 'dat.nt215340@sis.hust.edu.vn';
      const res = await identityService.schoolSsoLogin({
        email: ssoEmail,
        fullName: 'Nguyễn Thành Đạt (SSO)',
        ssoSubjectId: `sso-hust-${ssoEmail}`,
      });
      setSession(res.user, res.accessToken, res.refreshToken);
      navigate(APP_ROUTES.ACADEMIC_PROFILE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập SSO thất bại.');
    } finally {
      setLoading(false);
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
          maxWidth: 440,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: 32,
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>
          🎓 Đăng nhập MXH_HSSV
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
          Mạng xã hội học thuật dành riêng cho sinh viên đại học (Database: Supabase Online).
        </p>

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
          onSubmit={handleLogin}
          style={{
            marginTop: 20,
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
              placeholder="dat.nt215340@sis.hust.edu.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Mật khẩu
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        <div
          style={{
            margin: '16px 0',
            textAlign: 'center',
            fontSize: 12,
            color: 'var(--text-muted)',
          }}
        >
          — hoặc đăng nhập nhanh qua cổng SSO của trường —
        </div>

        <button
          type="button"
          onClick={handleDemoSchoolSso}
          disabled={loading}
          style={{
            width: '100%',
            background: 'var(--bg-elevated)',
            color: '#fff',
            border: '1px solid var(--border-color)',
            padding: '11px',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          🏛️ Đăng nhập bằng School SSO OAuth2 (.edu.vn)
        </button>

        <div
          style={{
            marginTop: 18,
            fontSize: 13,
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}
        >
          Chưa có tài khoản sinh viên?{' '}
          <Link to={APP_ROUTES.REGISTER_EDU}>Đăng ký & Xác thực OTP .edu</Link>
        </div>
      </div>
    </div>
  );
};
