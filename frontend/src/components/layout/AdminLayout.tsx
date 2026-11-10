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
          padding: size === 'sm' ? '2px 8px' : '4px 12px',
          borderRadius: 999,
          fontSize: size === 'sm' ? 11 : 12,
          fontWeight: 600,
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
          color: '#d97706',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        }}
      >
        ● Chưa xác thực .edu
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
        padding: size === 'sm' ? '2px 8px' : '4px 12px',
        borderRadius: 999,
        fontSize: size === 'sm' ? 11 : 12,
        fontWeight: 600,
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        color: '#059669',
        border: '1px solid rgba(16, 185, 129, 0.35)',
      }}
    >
      ✓ Verified Student
    </span>
  );
};
