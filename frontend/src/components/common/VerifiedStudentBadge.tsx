import React from 'react';

interface VerifiedStudentBadgeProps {
  isVerified: boolean;
  size?: 'sm' | 'md';
}

export const VerifiedStudentBadge: React.FC<VerifiedStudentBadgeProps> = ({
  isVerified,
  size = 'md',
}) => {
  if (!isVerified) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: size === 'sm' ? '5px 12px' : '6px 16px',
          borderRadius: 'var(--radius-badges)',
          fontSize: size === 'sm' ? 11 : 12,
          fontWeight: 400,
          backgroundColor: 'var(--color-fog-mist)',
          color: 'var(--color-graphite)',
        }}
      >
        [unverified .edu]
      </span>
    );
  }

  return (
    <span
      title="Sinh viên đã xác thực qua Email trường (.edu) / SSO"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: size === 'sm' ? '5px 12px' : '6px 16px',
        borderRadius: 'var(--radius-badges)',
        fontSize: size === 'sm' ? 11 : 12,
        fontWeight: 400,
        backgroundColor: 'var(--color-paper-white)',
        color: 'var(--color-charcoal-ink)',
        boxShadow: 'var(--shadow-sm-2)',
      }}
    >
      [✓ (<span className="hl-yellow">v</span>)erified .edu]
    </span>
  );
};
