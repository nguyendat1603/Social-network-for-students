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
        padding: '4px 12px',
        borderRadius: 9999,
        fontSize: 12.5,
        fontWeight: 500,
        backgroundColor: 'var(--color-cloud)',
        color: 'var(--color-ink)',
        textDecoration: 'none',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-jetbrains-mono)',
          fontWeight: 700,
          color: 'var(--color-signal-orange)',
          letterSpacing: '-0.014em',
        }}
      >
        #{code}
      </span>
      {name && (
        <span style={{ color: 'var(--color-stone)', fontSize: 12 }}>
          · {name}
        </span>
      )}
    </Link>
  );
};
