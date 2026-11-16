import React from 'react';

export const AcceptedAnswerBadge: React.FC = () => {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 10px',
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 500,
        backgroundColor: '#fff7f3',
        border: '1px solid #fed7aa',
        color: 'var(--color-signal-orange)',
      }}
    >
      <span>✓ Đã có lời giải chuẩn · +15 Karma</span>
    </span>
  );
};
