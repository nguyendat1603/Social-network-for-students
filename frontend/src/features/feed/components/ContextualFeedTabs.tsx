import React from 'react';
import { NavLink } from 'react-router-dom';
import { APP_ROUTES } from '../../../config/routes.config';

export const ContextualFeedTabs: React.FC = () => {
  const tabs = [
    { label: '🌐 Campus Feed (Toàn trường)', to: APP_ROUTES.CAMPUS_FEED },
    {
      label: '🏛️ Department Feed (Theo Khoa/Viện)',
      to: APP_ROUTES.DEPARTMENT_FEED,
    },
    { label: '📘 Course Feed (Theo Mã học phần)', to: APP_ROUTES.COURSE_FEED },
  ];

  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: 12,
      }}
    >
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end
          style={({ isActive }) => ({
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            color: isActive ? '#fff' : 'var(--text-secondary)',
            backgroundColor: isActive
              ? 'var(--brand-primary)'
              : 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
          })}
        >
          {t.label}
        </NavLink>
      ))}
    </div>
  );
};
