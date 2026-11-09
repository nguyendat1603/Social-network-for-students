import React from 'react';
import { NavLink } from 'react-router-dom';
import { APP_ROUTES } from '../../config/routes.config';

const MODULES_NAV = [
  {
    label: '1. Hồ sơ & Định danh (.edu)',
    to: APP_ROUTES.ACADEMIC_PROFILE,
    status: 'ACTIVE',
  },
  {
    label: '2. Bảng tin Học thuật',
    to: APP_ROUTES.CAMPUS_FEED,
    status: 'ACTIVE',
  },
  { label: '3. Tìm Nhóm & Đồ án', to: '#study-group', status: 'PHASE 3' },
  {
    label: '4. Review Học phần & Q&A',
    to: APP_ROUTES.COURSE_REVIEWS,
    status: 'ACTIVE',
  },
  {
    label: '5. Kho Tài liệu Mở',
    to: APP_ROUTES.RESOURCE_HUB,
    status: 'ACTIVE',
  },
  { label: '6. Chợ Sinh viên & Trọ', to: '#marketplace', status: 'PHASE 3' },
  { label: '7. Chat & Thông báo', to: '#chat', status: 'PHASE 3' },
  { label: '8. Điểm Uy tín (Karma)', to: '#karma', status: 'PHASE 4' },
];

export const Sidebar: React.FC = () => {
  return (
    <aside
      style={{
        width: 265,
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        padding: '20px 14px',
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          padding: '0 10px 10px',
          letterSpacing: '0.06em',
        }}
      >
        8 Module Nghiệp vụ
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {MODULES_NAV.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: item.status === 'ACTIVE' ? 600 : 400,
              color:
                item.status === 'ACTIVE' ? '#fff' : 'var(--text-muted)',
              backgroundColor:
                item.status === 'ACTIVE'
                  ? 'rgba(59, 130, 246, 0.14)'
                  : 'transparent',
            }}
          >
            <span>{item.label}</span>
            <span
              style={{
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 4,
                backgroundColor:
                  item.status === 'ACTIVE'
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'rgba(148, 163, 184, 0.12)',
                color: item.status === 'ACTIVE' ? '#34d399' : '#94a3b8',
              }}
            >
              {item.status}
            </span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
