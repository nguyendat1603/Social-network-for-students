import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../config/routes.config';
import { useAuth } from '../../hooks/useAuth';
import { useAnonymousMode } from '../../hooks/useAnonymousMode';

interface NavEntry {
  label: string;
  to: string;
  icon: React.ReactNode;
  end?: boolean;
}

const SUBSTACK_NAV_ITEMS: NavEntry[] = [
  {
    label: 'Bảng tin',
    to: APP_ROUTES.CAMPUS_FEED,
    end: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1V9.5z" />
      </svg>
    ),
  },
  {
    label: 'Theo Khoa / Viện',
    to: APP_ROUTES.DEPARTMENT_FEED,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    label: 'Học phần (#MãMôn)',
    to: APP_ROUTES.COURSE_FEED,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="9" x2="20" y2="9" />
        <line x1="4" y1="15" x2="20" y2="15" />
        <line x1="10" y1="3" x2="8" y2="21" />
        <line x1="16" y1="3" x2="14" y2="21" />
      </svg>
    ),
  },
  {
    label: 'Nhóm Đồ án',
    to: APP_ROUTES.STUDY_GROUPS,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'Kho Tài liệu Mở',
    to: APP_ROUTES.RESOURCE_HUB,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    label: 'Đánh giá Môn học',
    to: APP_ROUTES.COURSE_REVIEWS,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    label: 'Chợ & Nhà trọ SV',
    to: APP_ROUTES.MARKETPLACE_ITEMS,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    label: 'Tin nhắn',
    to: APP_ROUTES.MESSENGER,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: 'Hoạt động & Karma',
    to: APP_ROUTES.ACADEMIC_KARMA,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    label: 'Hồ sơ Học thuật',
    to: APP_ROUTES.ACADEMIC_PROFILE,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isAnonymousActive, toggleAnonymousMode, anonymousHandle } =
    useAnonymousMode();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(APP_ROUTES.LOGIN);
  };

  return (
    <aside
      className="substack-left-col"
      style={{
        width: 220,
        flexShrink: 0,
        position: 'sticky',
        top: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      {/* 1. Substack-style Brand Logo (Orange Stacked-Lines Mark + Editorial Serif Title) */}
      <Link
        to={APP_ROUTES.CAMPUS_FEED}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '4px 10px',
          textDecoration: 'none',
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 6,
            backgroundColor: 'var(--color-signal-orange)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {/* Substack signature stacked lines + bookmark SVG */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff">
            <rect x="3" y="2" width="18" height="2.6" rx="0.5" />
            <rect x="3" y="6.8" width="18" height="2.6" rx="0.5" />
            <path d="M3 11.6h18V22l-9-5.2L3 22V11.6z" />
          </svg>
        </div>

        <div>
          <div
            style={{
              fontFamily: 'var(--font-cahuenga)',
              fontSize: 22,
              fontWeight: 600,
              color: 'var(--color-ink)',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}
          >
            BáchKhoa
          </div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--color-stone)',
              fontWeight: 500,
            }}
          >
            HUST Newsroom
          </div>
        </div>
      </Link>

      {/* 2. Left Sidebar Nav Items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {SUBSTACK_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `substack-nav-item ${isActive ? 'active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  style={{
                    display: 'inline-flex',
                    color: isActive
                      ? 'var(--color-signal-orange)'
                      : 'var(--color-ink)',
                  }}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        <NavLink
          to={APP_ROUTES.MODERATION_DASHBOARD}
          className={({ isActive }) =>
            `substack-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <span style={{ display: 'inline-flex' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </span>
          <span>Kiểm duyệt</span>
        </NavLink>
      </nav>

      {/* 3. Full-width Orange 'Create' Pill Button at bottom of nav */}
      <div style={{ padding: '0 4px' }}>
        <button
          type="button"
          onClick={() => {
            navigate(`${APP_ROUTES.CAMPUS_FEED}?compose=1`);
            window.dispatchEvent(new CustomEvent('open-substack-composer'));
          }}
          className="substack-btn-primary"
          style={{
            width: '100%',
            padding: '10px 20px',
            fontSize: 15,
            fontWeight: 500,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Viết bài mới</span>
        </button>
      </div>

      {/* 4. Compact User Profile & Anonymous Switch at bottom */}
      <div
        style={{
          marginTop: 4,
          paddingTop: 16,
          borderTop: '1px solid var(--color-cloud)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {user && (
          <Link
            to={APP_ROUTES.ACADEMIC_PROFILE}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '4px 6px',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: isAnonymousActive ? '#232525' : '#ffedd5',
                color: isAnonymousActive ? '#ffffff' : '#c2410c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: 12,
                flexShrink: 0,
              }}
            >
              {isAnonymousActive
                ? 'ẨN'
                : (user.fullName || 'SV')
                    .split(' ')
                    .slice(-2)
                    .map((w) => w[0])
                    .join('')}
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--color-ink)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {isAnonymousActive ? `@${anonymousHandle}` : user.fullName}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--color-stone)',
                }}
              >
                {user.studentCode || '20215340'} · {user.karmaPoints || 450} Karma
              </div>
            </div>
          </Link>
        )}

        {/* Anonymous Mode Quick Pill + Sign Out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            onClick={toggleAnonymousMode}
            title="Chuyển chế độ Ẩn danh học thuật"
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: 9999,
              border: '1px solid var(--color-ash)',
              backgroundColor: isAnonymousActive ? '#232525' : 'transparent',
              color: isAnonymousActive ? '#ffffff' : 'var(--color-ink)',
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {isAnonymousActive ? '🕵️ Đang Ẩn danh' : '🕵️ Bật Ẩn danh'}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            title="Đăng xuất khỏi hệ thống"
            style={{
              padding: '6px 12px',
              borderRadius: 9999,
              border: 'none',
              backgroundColor: 'var(--color-cloud)',
              color: 'var(--color-ink)',
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            Thoát
          </button>
        </div>
      </div>
    </aside>
  );
};
