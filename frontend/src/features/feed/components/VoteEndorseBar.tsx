import React from 'react';
import { VoteType } from '../../../types/feed.types';

interface VoteEndorseBarProps {
  upvoteCount: number;
  downvoteCount: number;
  helpfulCount: number;
  onVote: (type: VoteType) => void;
}

export const VoteEndorseBar: React.FC<VoteEndorseBarProps> = ({
  upvoteCount,
  downvoteCount,
  helpfulCount,
  onVote,
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button
        type="button"
        onClick={() => onVote('UPVOTE')}
        style={{
          padding: '5px 10px',
          borderRadius: 6,
          background: 'rgba(59, 130, 246, 0.14)',
          border: '1px solid rgba(59, 130, 246, 0.35)',
          color: '#93c5fd',
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        ▲ Upvote ({upvoteCount})
      </button>

      <button
        type="button"
        onClick={() => onVote('DOWNVOTE')}
        style={{
          padding: '5px 10px',
          borderRadius: 6,
          background: 'rgba(148, 163, 184, 0.1)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-secondary)',
          fontSize: 12,
        }}
      >
        ▼ ({downvoteCount})
      </button>

      <button
        type="button"
        onClick={() => onVote('HELPFUL')}
        style={{
          padding: '5px 10px',
          borderRadius: 6,
          background: 'rgba(16, 185, 129, 0.14)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          color: '#34d399',
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        ★ Helpful / Endorse ({helpfulCount})
      </button>
    </div>
  );
};
