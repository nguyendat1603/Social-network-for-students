import React from 'react';
import { VoteType } from '../../../types/feed.types';

interface VoteEndorseBarProps {
  upvoteCount: number;
  downvoteCount: number;
  helpfulCount: number;
  commentCount?: number;
  onVote: (type: VoteType) => void;
  onOpenComments?: () => void;
}

export const VoteEndorseBar: React.FC<VoteEndorseBarProps> = ({
  upvoteCount,
  downvoteCount,
  helpfulCount,
  commentCount = 0,
  onVote,
  onOpenComments,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
        fontFamily: 'var(--font-system-ui)',
        fontSize: 13,
        color: 'var(--color-stone)',
      }}
    >
      {/* Heart / Upvote action */}
      <button
        type="button"
        onClick={() => onVote('UPVOTE')}
        title="Hữu ích / Upvote bài viết"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'transparent',
          border: 'none',
          padding: '4px 6px',
          borderRadius: 9999,
          color: 'var(--color-stone)',
          fontSize: 13,
          fontWeight: 400,
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span>{upvoteCount}</span>
      </button>

      {/* Comment count action */}
      {onOpenComments && (
        <button
          type="button"
          onClick={onOpenComments}
          title="Xem thảo luận và câu trả lời"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'transparent',
            border: 'none',
            padding: '4px 6px',
            borderRadius: 9999,
            color: 'var(--color-stone)',
            fontSize: 13,
            fontWeight: 400,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>{commentCount}</span>
        </button>
      )}

      {/* Helpful / Endorse action */}
      <button
        type="button"
        onClick={() => onVote('HELPFUL')}
        title="Đề cử nội dung học thuật chất lượng"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'transparent',
          border: 'none',
          padding: '4px 6px',
          borderRadius: 9999,
          color: 'var(--color-stone)',
          fontSize: 13,
          fontWeight: 400,
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <span>{helpfulCount} đề cử</span>
      </button>

      {/* Downvote */}
      <button
        type="button"
        onClick={() => onVote('DOWNVOTE')}
        title="Giảm điểm bài viết"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          background: 'transparent',
          border: 'none',
          padding: '4px 6px',
          borderRadius: 9999,
          color: 'var(--color-stone)',
          fontSize: 13,
          fontWeight: 400,
        }}
      >
        <span>↓ {downvoteCount}</span>
      </button>
    </div>
  );
};
