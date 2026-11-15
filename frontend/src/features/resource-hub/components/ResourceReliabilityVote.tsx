import React from 'react';

interface ResourceReliabilityVoteProps {
  upvoteCount: number;
  downvoteCount: number;
  onVote: (type: 'UPVOTE' | 'DOWNVOTE') => void;
}

export const ResourceReliabilityVote: React.FC<
  ResourceReliabilityVoteProps
> = ({ upvoteCount, downvoteCount, onVote }) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <button
        type="button"
        onClick={() => onVote('UPVOTE')}
        title="Đánh giá tài liệu chuẩn xác (+5 Karma cho người đăng)"
        style={{
          padding: '5px 10px',
          borderRadius: 20,
          background: 'var(--color-highlight-yellow)',
          border: '1px solid var(--color-highlight-yellow)',
          color: 'var(--color-charcoal-ink)',
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        👍 Tin cậy ({upvoteCount})
      </button>

      <button
        type="button"
        onClick={() => onVote('DOWNVOTE')}
        title="Báo hiệu tài liệu thiếu chính xác"
        style={{
          padding: '5px 10px',
          borderRadius: 20,
          background: 'var(--color-fog-mist)',
          border: '1px solid var(--color-fog-mist)',
          color: 'var(--color-charcoal-ink)',
          fontSize: 12,
        }}
      >
        👎 ({downvoteCount})
      </button>
    </div>
  );
};
