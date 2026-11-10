import React from 'react';
import { NavLink } from 'react-router-dom';
import { APP_ROUTES } from '../../config/routes.config';

const MODULES_NAV = [
  {
    icon: '👤',
    label: '1. Hồ sơ & Định danh',
    to: APP_ROUTES.ACADEMIC_PROFILE,
    status: 'ACTIVE',
  },
  {
    icon: '📰',
    label: '2. Bảng tin Học thuật',
    to: APP_ROUTES.CAMPUS_FEED,
    status: 'ACTIVE',
  },
  {
    icon: '👥',
    label: '3. Tìm Nhóm & Đồ án',
    to: APP_ROUTES.STUDY_GROUPS,
    status: 'ACTIVE',
  },
  {
    icon: '⭐',
    label: '4. Đánh giá Môn học & Q&A',
    to: APP_ROUTES.COURSE_REVIEWS,
    status: 'ACTIVE',
  },
  {
    icon: '📚',
    label: '5. Kho Tài liệu Mở',
    to: APP_ROUTES.RESOURCE_HUB,
    status: 'ACTIVE',
  },
  {
    icon: '🛒',
    label: '6. Chợ Sinh viên & Trọ',
    to: APP_ROUTES.MARKETPLACE_ITEMS,
    status: 'ACTIVE',
  },
  {
    icon: '💬',
    label: '7. Tin nhắn & Trao đổi',
    to: APP_ROUTES.MESSENGER,
    status: 'ACTIVE',
  },
  {
    icon: '⚡',
    label: '8. Karma & Đặc quyền',
    to: APP_ROUTES.ACADEMIC_KARMA,
    status: 'ACTIVE',
  },
];

const ADMIN_NAV = [
  {
    icon: '🛡️',
    label: 'Dashboard Kiểm duyệt',
    to: APP_ROUTES.MODERATION_DASHBOARD,
    status: 'ADMIN',
  },
];

export const Sidebar: React.FC = () => {
  return (
    <aside
      style={{
        width: 260,
        backgroundColor: '#ffffff',
        borderRight: '1px solid var(--border-color)',
        padding: '20px 12px',
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            padding: '0 12px 10px',
            letterSpacing: '0.06em',
          }}
        >
          8 Module Nghiệp vụ
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {MODULES_NAV.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--brand-light)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--brand-primary)' : '3px solid transparent',
                transition: 'all 0.15s ease',
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: 4,
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: '#059669',
                }}
              >
                {item.status}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            padding: '0 12px 10px',
            letterSpacing: '0.06em',
          }}
        >
          Ban Quản Trị
        </div>

        {ADMIN_NAV.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '9px 12px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: '#dc2626',
              backgroundColor: isActive ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            })}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 4,
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                color: '#b91c1c',
              }}
            >
              {item.status}
            </span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
};
