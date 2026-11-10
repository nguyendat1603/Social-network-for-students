import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../config/routes.config';
import { useAuth } from '../../hooks/useAuth';
import { VerifiedStudentBadge } from '../common/VerifiedStudentBadge';
import { AnonymousSwitch } from '../common/AnonymousSwitch';
import { RealtimeNotificationBell } from '../../features/communication/components/RealtimeNotificationBell';

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
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Link
          to={APP_ROUTES.CAMPUS_FEED}
          style={{
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span className="ig-story-ring" style={{ padding: 2 }}>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                background: '#ffffff',
                borderRadius: '50%',
                fontSize: 16,
              }}
            >
              🎓
            </span>
          </span>
          <span className="text-ig-gradient">UniSphere</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
            · MXH_HSSV
          </span>
        </Link>

        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '3px 10px',
            borderRadius: '9999px',
            background: 'rgba(16, 185, 129, 0.1)',
            color: '#059669',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#10b981',
              display: 'inline-block',
            }}
          />
          Supabase Connected
        </span>
      </div>

      {isAuthenticated && user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <RealtimeNotificationBell />
          <AnonymousSwitch />
          <VerifiedStudentBadge
            isVerified={user.isVerifiedStudent}
            size="sm"
          />
          <Link
            to={APP_ROUTES.ACADEMIC_PROFILE}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: 14,
              padding: '6px 10px',
              borderRadius: 8,
              background: 'var(--bg-elevated)',
            }}
          >
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'var(--brand-primary)',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
            </span>
            <span>
              {user.fullName}{' '}
              {user.studentCode ? `(${user.studentCode})` : ''}
            </span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: '#f1f5f9',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              padding: '7px 14px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
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
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid var(--border-color)',
              background: '#f8fafc',
              color: 'var(--text-primary)',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Đăng nhập
          </Link>
          <Link
            to={APP_ROUTES.REGISTER_EDU}
            className="btn-facebook-primary"
            style={{
              padding: '8px 18px',
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
