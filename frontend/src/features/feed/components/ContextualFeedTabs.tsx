import React from 'react';
import { NavLink } from 'react-router-dom';
import { APP_ROUTES } from '../../../config/routes.config';

export const ContextualFeedTabs: React.FC = () => {
  const tabs = [
    { label: 'Toàn trường Bách Khoa', to: APP_ROUTES.CAMPUS_FEED },
    { label: 'Theo Trường / Viện', to: APP_ROUTES.DEPARTMENT_FEED },
    { label: 'Theo Học phần (#MãMôn)', to: APP_ROUTES.COURSE_FEED },
  ];

  return (
    <div
      style={{
        display: 'flex',
        gap: 20,
        borderBottom: '1px solid var(--color-cloud)',
        paddingBottom: 0,
        overflowX: 'auto',
      }}
    >
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end
          style={({ isActive }) => ({
            padding: '10px 2px 12px',
            fontSize: 15,
            fontWeight: isActive ? 600 : 500,
            color: isActive ? 'var(--color-ink)' : 'var(--color-stone)',
            borderBottom: isActive
              ? '2px solid var(--color-signal-orange)'
              : '2px solid transparent',
            whiteSpace: 'nowrap',
            textDecoration: 'none',
            transition: 'color 0.15s ease, border-color 0.15s ease',
          })}
        >
          {t.label}
        </NavLink>
      ))}
    </div>
  );
};
