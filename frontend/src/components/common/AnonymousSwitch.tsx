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
          ? '1px solid rgba(139, 92, 246, 0.6)'
          : '1px solid var(--border-color)',
        background: isAnonymousActive
          ? 'rgba(139, 92, 246, 0.18)'
          : 'var(--bg-secondary)',
        color: isAnonymousActive ? '#c4b5fd' : 'var(--text-secondary)',
      }}
    >
      <span>{isAnonymousActive ? '🎭 Đang Ẩn danh:' : '👤 Danh tính thật'}</span>
      {isAnonymousActive && (
        <span style={{ color: '#fff', fontWeight: 700 }}>
          @{anonymousHandle}
        </span>
      )}
    </button>
  );
};
