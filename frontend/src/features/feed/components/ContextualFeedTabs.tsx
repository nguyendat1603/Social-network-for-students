import React from 'react';
import { NavLink } from 'react-router-dom';
import { APP_ROUTES } from '../../../config/routes.config';

export const ContextualFeedTabs: React.FC = () => {
  const tabs = [
    { label: 'Toàn trường', to: APP_ROUTES.CAMPUS_FEED },
    { label: 'Khoa / Viện', to: APP_ROUTES.DEPARTMENT_FEED },
    { label: 'Học phần', to: APP_ROUTES.COURSES },
  ];

  return (
    <nav aria-label="Phạm vi bản tin"
      style={{
        display: 'flex',
        gap: 24,
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
            fontSize: 13,
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
    </nav>
  );
};
