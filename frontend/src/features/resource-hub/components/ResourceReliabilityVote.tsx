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
          borderRadius: 6,
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#34d399',
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
          borderRadius: 6,
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          fontSize: 12,
        }}
      >
        👎 ({downvoteCount})
      </button>
    </div>
  );
};
