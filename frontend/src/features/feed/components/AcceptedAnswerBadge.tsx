import React from 'react';

export const AcceptedAnswerBadge: React.FC = () => {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        backgroundColor: 'rgba(16, 185, 129, 0.18)',
        color: '#34d399',
        border: '1px solid rgba(16, 185, 129, 0.45)',
      }}
    >
      ✓ Accepted Answer (+15 Karma)
    </span>
  );
};
