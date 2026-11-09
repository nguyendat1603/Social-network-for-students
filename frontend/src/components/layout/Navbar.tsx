import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../config/routes.config';
import { useAuth } from '../../hooks/useAuth';
import { VerifiedStudentBadge } from '../common/VerifiedStudentBadge';
import { AnonymousSwitch } from '../common/AnonymousSwitch';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(APP_ROUTES.LOGIN);
  };

  return (
    <header
      style={{
        height: 64,
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Link
          to={APP_ROUTES.ACADEMIC_PROFILE}
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.02em',
          }}
        >
          🎓 MXH_HSSV
        </Link>
        <span
          style={{
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 6,
            background: 'rgba(59, 130, 246, 0.15)',
            color: '#60a5fa',
            border: '1px solid rgba(59, 130, 246, 0.35)',
          }}
        >
          Supabase Online Connected
        </span>
      </div>

      {isAuthenticated && user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <AnonymousSwitch />
          <VerifiedStudentBadge
            isVerified={user.isVerifiedStudent}
            size="sm"
          />
          <Link
            to={APP_ROUTES.ACADEMIC_PROFILE}
            style={{
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {user.fullName}{' '}
            {user.studentCode ? `(${user.studentCode})` : ''}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 13,
            }}
          >
            Đăng xuất
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 10 }}>
          <Link
            to={APP_ROUTES.LOGIN}
            style={{
              padding: '7px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: 13,
            }}
          >
            Đăng nhập
          </Link>
          <Link
            to={APP_ROUTES.REGISTER_EDU}
            style={{
              padding: '7px 14px',
              borderRadius: 8,
              background: 'var(--brand-primary)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Đăng ký .edu
          </Link>
        </div>
      )}
    </header>
  );
};
