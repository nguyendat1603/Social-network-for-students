import React, { useState } from 'react';
import { CommentItem, VoteType } from '../../../types/feed.types';
import { LatexMathRenderer } from '../../../components/common/LatexMathRenderer';
import { AcceptedAnswerBadge } from './AcceptedAnswerBadge';
import { VoteEndorseBar } from './VoteEndorseBar';

interface NestedCommentTreeProps {
  comments: CommentItem[];
  canAcceptAnswer: boolean;
  onReply: (
    parentCommentId: string | null,
    contentBody: string,
    isAnonymous: boolean
  ) => Promise<void>;
  onVoteComment: (commentId: string, voteType: VoteType) => Promise<void>;
  onAcceptAnswer: (commentId: string) => Promise<void>;
  depth?: number;
}

export const NestedCommentTree: React.FC<NestedCommentTreeProps> = ({
  comments,
  canAcceptAnswer,
  onReply,
  onVoteComment,
  onAcceptAnswer,
  depth = 0,
}) => {
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [replyAnon, setReplyAnon] = useState(false);

  const handleReplySubmit = async (parentId: string) => {
    if (!replyBody.trim()) return;
    await onReply(parentId, replyBody, replyAnon);
    setReplyBody('');
    setReplyingToId(null);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        marginLeft: depth > 0 ? 24 : 0,
        borderLeft: depth > 0 ? '2px solid var(--border-color)' : 'none',
        paddingLeft: depth > 0 ? 14 : 0,
      }}
    >
      {comments.map((c) => {
        const authorLabel = c.is_anonymous
          ? `🎭 @${c.author?.anonymous_handle || 'SinhVienAnDanh'}`
          : `👤 ${c.author?.full_name || 'Sinh viên'}${
              c.author?.student_code ? ` (${c.author.student_code})` : ''
            }`;

        return (
          <div
            key={c.id}
            style={{
              backgroundColor: c.is_accepted
                ? 'rgba(16, 185, 129, 0.08)'
                : 'var(--bg-secondary)',
              border: c.is_accepted
                ? '1px solid rgba(16, 185, 129, 0.45)'
                : '1px solid var(--border-color)',
              borderRadius: 10,
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <strong style={{ fontSize: 13 }}>{authorLabel}</strong>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {new Date(c.created_at).toLocaleString('vi-VN')}
                </span>
              </div>
              {c.is_accepted && <AcceptedAnswerBadge />}
            </div>

            <LatexMathRenderer content={c.content_body} />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
                marginTop: 4,
              }}
            >
              <VoteEndorseBar
                upvoteCount={c.upvote_count}
                downvoteCount={c.downvote_count}
                helpfulCount={c.helpful_count}
                onVote={(vt) => onVoteComment(c.id, vt)}
              />

              <div style={{ display: 'flex', gap: 8 }}>
                {depth < 2 && (
                  <button
                    type="button"
                    onClick={() =>
                      setReplyingToId(replyingToId === c.id ? null : c.id)
                    }
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                  >
                    ↩ Trả lời
                  </button>
                )}

                {canAcceptAnswer && !c.is_accepted && (
                  <button
                    type="button"
                    onClick={() => onAcceptAnswer(c.id)}
                    style={{
                      background: 'rgba(16, 185, 129, 0.18)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      color: '#34d399',
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    ✓ Chọn làm Câu trả lời đúng
                  </button>
                )}
              </div>
            </div>

            {replyingToId === c.id && (
              <div
                style={{
                  marginTop: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <textarea
                  rows={2}
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Nhập phản hồi của bạn (hỗ trợ LaTeX $...$ và Code ```)..."
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      color: '#c4b5fd',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={replyAnon}
                      onChange={(e) => setReplyAnon(e.target.checked)}
                      style={{ width: 14, height: 14 }}
                    />
                    Phản hồi ẩn danh
                  </label>
                  <button
                    type="button"
                    onClick={() => handleReplySubmit(c.id)}
                    style={{
                      background: 'var(--brand-primary)',
                      border: 'none',
                      color: '#fff',
                      padding: '6px 14px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    Gửi phản hồi
                  </button>
                </div>
              </div>
            )}

            {c.replies && c.replies.length > 0 && (
              <NestedCommentTree
                comments={c.replies}
                canAcceptAnswer={canAcceptAnswer}
                onReply={onReply}
                onVoteComment={onVoteComment}
                onAcceptAnswer={onAcceptAnswer}
                depth={depth + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
