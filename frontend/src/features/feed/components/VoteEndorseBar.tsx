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
          padding: '5px 12px',
          borderRadius: 6,
          background: 'var(--brand-light)',
          border: '1px solid rgba(24, 119, 242, 0.25)',
          color: 'var(--brand-primary)',
          fontSize: 12,
          fontWeight: 700,
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
          background: '#f1f5f9',
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
          padding: '5px 12px',
          borderRadius: 6,
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          color: '#059669',
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        ⭐ Hữu ích ({helpfulCount})
      </button>
    </div>
  );
};
