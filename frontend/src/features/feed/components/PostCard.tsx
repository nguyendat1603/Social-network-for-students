import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [subscribed, setSubscribed] = useState(false);
  const [sharedToast, setSharedToast] = useState(false);

  const authorName = post.is_anonymous
    ? `@${post.author?.anonymous_handle || 'SinhVienAnDanh'}`
    : post.author?.full_name || 'Sinh viên Bách Khoa';

  const authorStudentCode =
    !post.is_anonymous && post.author?.student_code
      ? post.author.student_code
      : null;

  const initials = post.is_anonymous
    ? 'ẨN'
    : authorName
        .split(' ')
        .slice(-2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();

  const postTypeLabel =
    post.post_type === 'QUESTION'
      ? 'Hỏi đáp Học thuật'
      : post.post_type === 'ANNOUNCEMENT'
      ? 'Thông báo Học vụ'
      : 'Góc Chia sẻ & Biên tập';

  const formattedTime = new Date(post.created_at).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleShare = () => {
    const url = `${window.location.origin}/feed/posts/${post.id}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setSharedToast(true);
    setTimeout(() => setSharedToast(false), 1800);
  };

  return (
    <article className="substack-post-item">
      {/* 1. Author Row + Top-right 'Theo dõi' (Subscribe) Link in #ff6719 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            minWidth: 0,
          }}
        >
          {/* 32px Circular Avatar */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: post.is_anonymous ? '#232525' : '#eeeeee',
              color: post.is_anonymous ? '#ffffff' : '#363737',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 6,
              flexWrap: 'wrap',
              minWidth: 0,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-system-ui)',
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--color-ink)',
              }}
            >
              {authorName}
            </span>

            {authorStudentCode && (
              <span
                style={{
                  fontSize: 12.5,
                  color: 'var(--color-stone)',
                  fontFamily: 'var(--font-jetbrains-mono)',
                }}
              >
                ({authorStudentCode})
              </span>
            )}

            <span style={{ fontSize: 13, color: 'var(--color-stone)' }}>
              · {formattedTime}
            </span>
          </div>
        </div>

        {/* Inline 'Theo dõi' (Subscribe) Link in #ff6719 */}
        <button
          type="button"
          onClick={() => setSubscribed((prev) => !prev)}
          className="substack-subscribe-link"
          style={{
            color: subscribed ? 'var(--color-stone)' : 'var(--color-signal-orange)',
            flexShrink: 0,
          }}
        >
          {subscribed ? 'Đã theo dõi' : 'Theo dõi'}
        </button>
      </div>

      {/* 2. Substack AI / Academic Annotation Badge Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 8,
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--color-ink)',
          }}
        >
          <span
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              backgroundColor: 'var(--color-cloud)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
            }}
          >
            {post.post_type === 'QUESTION' ? '?' : '✦'}
          </span>
          <span>{postTypeLabel}</span>
          <span style={{ color: 'var(--color-stone)', fontWeight: 400 }}>
            · 3 phút đọc
          </span>
        </span>

        {post.accepted_comment_id && <AcceptedAnswerBadge />}

        {post.has_latex && (
          <span
            style={{
              fontSize: 12,
              fontFamily: 'var(--font-jetbrains-mono)',
              color: 'var(--color-stone)',
              backgroundColor: 'var(--color-cloud)',
              padding: '2px 8px',
              borderRadius: 9999,
            }}
          >
            ∑ LaTeX
          </span>
        )}

        {post.has_code && (
          <span
            style={{
              fontSize: 12,
              fontFamily: 'var(--font-jetbrains-mono)',
              color: 'var(--color-stone)',
              backgroundColor: 'var(--color-cloud)',
              padding: '2px 8px',
              borderRadius: 9999,
            }}
          >
            &lt;/&gt; Code
          </span>
        )}
      </div>

      {/* 3. Post Title (system-ui 600 at 20px #363737) */}
      <Link
        to={`/feed/posts/${post.id}`}
        style={{
          display: 'block',
          fontFamily: 'var(--font-system-ui)',
          fontSize: 20,
          fontWeight: 600,
          color: 'var(--color-ink)',
          lineHeight: 1.35,
          marginBottom: 8,
          textDecoration: 'none',
        }}
      >
        {post.title}
      </Link>

      {/* 4. Long-form Post Body in Spectral Serif 18.5-19px */}
      <div style={{ marginBottom: 14 }}>
        <LatexMathRenderer content={post.content_body} />
      </div>

      {/* 5. Course Hashtag Pills */}
      {post.courseTags && post.courseTags.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 14,
          }}
        >
          {post.courseTags.map((tag) => (
            <CourseTagPill key={tag.id} code={tag.code} name={tag.name} />
          ))}
        </div>
      )}

      {/* 6. Substack Engagement Action Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          paddingTop: 4,
          flexWrap: 'wrap',
        }}
      >
        <VoteEndorseBar
          upvoteCount={post.upvote_count}
          downvoteCount={post.downvote_count}
          helpfulCount={post.helpful_count}
          commentCount={post.comment_count}
          onVote={(type) => onVote(post.id, type)}
          onOpenComments={() => navigate(`/feed/posts/${post.id}`)}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            type="button"
            onClick={handleShare}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'transparent',
              border: 'none',
              padding: '4px 6px',
              color: 'var(--color-stone)',
              fontSize: 13,
              fontWeight: 400,
            }}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span>{sharedToast ? 'Đã chép link!' : 'Chia sẻ'}</span>
          </button>

          <Link
            to={`/feed/posts/${post.id}`}
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--color-ink)',
            }}
          >
            Đọc chi tiết →
          </Link>
        </div>
      </div>
    </article>
  );
};
