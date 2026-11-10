import React from 'react';
import { useAnonymousMode } from '../../hooks/useAnonymousMode';

export const AnonymousSwitch: React.FC = () => {
  const { isAnonymousActive, toggleAnonymousMode, anonymousHandle } =
    useAnonymousMode();

  return (
    <button
      type="button"
      onClick={toggleAnonymousMode}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 600,
        border: isAnonymousActive
          ? '1px solid rgba(139, 92, 246, 0.4)'
          : '1px solid var(--border-color)',
        background: isAnonymousActive
          ? 'rgba(139, 92, 246, 0.1)'
          : '#ffffff',
        color: isAnonymousActive ? '#7c3aed' : 'var(--text-secondary)',
        cursor: 'pointer',
      }}
    >
      <span>{isAnonymousActive ? '🎭 Ẩn danh:' : '👤 Danh tính thật'}</span>
      {isAnonymousActive && (
        <span style={{ color: '#6d28d9', fontWeight: 700 }}>
          @{anonymousHandle}
        </span>
      )}
    </button>
  );
};
