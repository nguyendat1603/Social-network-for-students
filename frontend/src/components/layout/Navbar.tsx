import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../config/routes.config';
import { useAuth } from '../../hooks/useAuth';
import { VerifiedStudentBadge } from '../common/VerifiedStudentBadge';
import { AnonymousSwitch } from '../common/AnonymousSwitch';
import { RealtimeNotificationBell } from '../../features/communication/components/RealtimeNotificationBell';

const PEER_AVATARS = [
  { initials: 'MA', bg: '#e2ceb8', title: 'Minh Anh (K65 CNTT)' },
  { initials: 'LC', bg: '#c7f6ff', title: 'Linh Chi (K66 ĐTVT)' },
  { initials: 'ĐH', bg: '#f9f5a2', title: 'Đức Huy (K65 KHMT)' },
  { initials: 'HN', bg: '#ededed', title: 'Hoàng Nam (K64 Cơ khí)' },
  { initials: 'TH', bg: '#d6d2c4', title: 'Thu Hà (K66 Kinh tế)' },
];

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
        backgroundColor: 'var(--color-concrete-gray)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 24px 10px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        maxWidth: 1440,
        width: '100%',
        margin: '0 auto',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      {/* Left side: Status toggle pill with count badge + Highlighted-Letter Game */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link
          to={APP_ROUTES.CAMPUS_FEED}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            backgroundColor: 'var(--color-paper-white)',
            color: 'var(--color-charcoal-ink)',
            padding: '8px 20px',
            borderRadius: 'var(--radius-buttons)',
            boxShadow: 'var(--shadow-sm-2)',
            fontSize: 'var(--text-body-sm)',
            fontWeight: 400,
          }}
        >
          <span>
            (<span className="hl-yellow">y</span>)our campus desktop.
          </span>
          <span
            style={{
              backgroundColor: 'var(--color-fog-mist)',
              color: 'var(--color-charcoal-ink)',
              padding: '2px 10px',
              borderRadius: 'var(--radius-badges)',
              fontSize: 'var(--text-caption)',
            }}
          >
            8 modules
          </span>
        </Link>

        <span
          style={{
            fontSize: 'var(--text-caption)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-badges)',
            backgroundColor: 'var(--color-fog-mist)',
            color: 'var(--color-graphite)',
          }}
        >
          [supabase: connected]
        </span>
      </div>

      {/* Right side: Row of 5 circular avatar thumbnails + user controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            backgroundColor: 'var(--color-paper-white)',
            padding: '5px 12px',
            borderRadius: 'var(--radius-buttons)',
            boxShadow: 'var(--shadow-sm-2)',
          }}
          title="Sinh viên đang trực tuyến trên mặt bàn học thuật"
        >
          {PEER_AVATARS.map((peer) => (
            <span
              key={peer.initials}
              title={peer.title}
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                backgroundColor: peer.bg,
                color: 'var(--color-charcoal-ink)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 400,
              }}
            >
              {peer.initials}
            </span>
          ))}
        </div>

        {isAuthenticated && user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <RealtimeNotificationBell />
            <AnonymousSwitch />
            <VerifiedStudentBadge
              isVerified={user.isVerifiedStudent}
              size="sm"
            />
            <Link
              to={APP_ROUTES.ACADEMIC_PROFILE}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: 'var(--color-charcoal-ink)',
                fontSize: 'var(--text-body-sm)',
                padding: '7px 16px',
                borderRadius: 'var(--radius-buttons)',
                backgroundColor: 'var(--color-paper-white)',
                boxShadow: 'var(--shadow-sm-2)',
              }}
            >
              <span>
                {user.fullName}{' '}
                {user.studentCode ? `(${user.studentCode})` : ''}
              </span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                backgroundColor: 'var(--color-fog-mist)',
                color: 'var(--color-charcoal-ink)',
                padding: '7px 16px',
                borderRadius: 'var(--radius-buttons)',
                fontSize: 'var(--text-caption)',
              }}
            >
              exit
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <Link
              to={APP_ROUTES.LOGIN}
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--radius-buttons)',
                backgroundColor: 'var(--color-fog-mist)',
                color: 'var(--color-charcoal-ink)',
                fontSize: 'var(--text-body-sm)',
              }}
            >
              login
            </Link>
            <Link
              to={APP_ROUTES.REGISTER_EDU}
              className="school-verify-btn"
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--radius-buttons)',
                backgroundColor: 'var(--color-paper-white)',
                color: 'var(--color-charcoal-ink)',
                fontSize: 'var(--text-body-sm)',
                boxShadow: 'var(--shadow-sm-2)',
              }}
            >
              VERIFY .EDU
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
