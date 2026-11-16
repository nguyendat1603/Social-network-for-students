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
        padding: '6px 16px',
        borderRadius: 'var(--radius-buttons)',
        fontSize: 12,
        fontWeight: 400,
        backgroundColor: isAnonymousActive
          ? 'var(--color-paper-white)'
          : 'var(--color-fog-mist)',
        color: 'var(--color-charcoal-ink)',
        boxShadow: isAnonymousActive ? 'var(--shadow-sm-2)' : 'none',
      }}
    >
      {isAnonymousActive ? (
        <span>
          [(<span className="hl-cyan">a</span>)nonymous: @{anonymousHandle}]
        </span>
      ) : (
        <span>
          [(<span className="hl-yellow">r</span>)eal identity]
        </span>
      )}
    </button>
  );
};
