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
        gap: 5,
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        backgroundColor: 'var(--brand-light)',
        color: 'var(--brand-primary)',
        border: '1px solid rgba(24, 119, 242, 0.25)',
      }}
    >
      <span>#{code}</span>
      {name && (
        <span style={{ fontWeight: 500, color: '#475569', fontSize: 11 }}>
          · {name}
        </span>
      )}
    </Link>
  );
};
