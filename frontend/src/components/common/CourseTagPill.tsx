import React from 'react';
import { Link } from 'react-router-dom';

interface CourseTagPillProps {
  code: string;
  name?: string;
}

export const CourseTagPill: React.FC<CourseTagPillProps> = ({ code, name }) => {
  return (
    <Link
      to={`/feed/course?code=${encodeURIComponent(code)}`}
      title={name ? `${code} — ${name}` : code}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        backgroundColor: 'rgba(59, 130, 246, 0.16)',
        color: '#60a5fa',
        border: '1px solid rgba(59, 130, 246, 0.35)',
      }}
    >
      #{code}
      {name && (
        <span style={{ fontWeight: 400, color: '#93c5fd', fontSize: 11 }}>
          · {name}
        </span>
      )}
    </Link>
  );
};
