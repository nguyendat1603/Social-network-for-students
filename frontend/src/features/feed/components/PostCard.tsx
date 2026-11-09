import React from 'react';
import { Link } from 'react-router-dom';
import { PostItem, VoteType } from '../../../types/feed.types';
import { CourseTagPill } from '../../../components/common/CourseTagPill';
import { LatexMathRenderer } from '../../../components/common/LatexMathRenderer';
import { AcceptedAnswerBadge } from './AcceptedAnswerBadge';
import { VoteEndorseBar } from './VoteEndorseBar';

interface PostCardProps {
  post: PostItem;
  onVote: (postId: string, voteType: VoteType) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onVote }) => {
  const authorDisplay = post.is_anonymous
    ? `🎭 @${post.author?.anonymous_handle || 'SinhVienAnDanh'}`
    : `👤 ${post.author?.full_name || 'Sinh viên'}${
        post.author?.student_code ? ` (${post.author.student_code})` : ''
      }`;

  return (
    <article
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 6,
              backgroundColor:
                post.post_type === 'QUESTION'
                  ? 'rgba(245, 158, 11, 0.18)'
                  : post.post_type === 'ANNOUNCEMENT'
                  ? 'rgba(239, 68, 68, 0.18)'
                  : 'rgba(59, 130, 246, 0.18)',
              color:
                post.post_type === 'QUESTION'
                  ? '#fbbf24'
                  : post.post_type === 'ANNOUNCEMENT'
                  ? '#f87171'
                  : '#93c5fd',
            }}
          >
            {post.post_type}
          </span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{authorDisplay}</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            · {new Date(post.created_at).toLocaleString('vi-VN')}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {post.accepted_comment_id && <AcceptedAnswerBadge />}
          {post.has_latex && (
            <span
              style={{
                fontSize: 11,
                padding: '2px 7px',
                borderRadius: 4,
                background: 'rgba(139, 92, 246, 0.18)',
                color: '#c4b5fd',
              }}
            >
              ∑ LaTeX
            </span>
          )}
          {post.has_code && (
            <span
              style={{
                fontSize: 11,
                padding: '2px 7px',
                borderRadius: 4,
                background: 'rgba(59, 130, 246, 0.18)',
                color: '#93c5fd',
              }}
            >
              {'</> Code'}
            </span>
          )}
        </div>
      </div>

      <Link
        to={`/feed/posts/${post.id}`}
        style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}
      >
        {post.title}
      </Link>

      <LatexMathRenderer content={post.content_body} />

      {post.courseTags && post.courseTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {post.courseTags.map((tag) => (
            <CourseTagPill key={tag.id} code={tag.code} name={tag.name} />
          ))}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid var(--border-color)',
          paddingTop: 12,
        }}
      >
        <VoteEndorseBar
          upvoteCount={post.upvote_count}
          downvoteCount={post.downvote_count}
          helpfulCount={post.helpful_count}
          onVote={(type) => onVote(post.id, type)}
        />

        <Link
          to={`/feed/posts/${post.id}`}
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}
        >
          💬 {post.comment_count} bình luận / trả lời →
        </Link>
      </div>
    </article>
  );
};
