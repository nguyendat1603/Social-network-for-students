import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MainLayout } from '../../../components/layout/MainLayout';
import { RichTextEditor } from '../../../components/common/RichTextEditor';
import { APP_ROUTES } from '../../../config/routes.config';
import { useAnonymousMode } from '../../../hooks/useAnonymousMode';
import { useAuth } from '../../../hooks/useAuth';
import { feedService } from '../../../services/feed.service';
import { PostItem, VoteType } from '../../../types/feed.types';
import { NestedCommentTree } from '../components/NestedCommentTree';
import { PostCard } from '../components/PostCard';

export const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const { user } = useAuth();
  const { isAnonymousActive } = useAnonymousMode();

  const [post, setPost] = useState<PostItem | null>(null);
  const [commentBody, setCommentBody] = useState('');
  const [commentAnon, setCommentAnon] = useState(isAnonymousActive);
  const [loading, setLoading] = useState(true);

  const loadDetail = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const data = await feedService.getPostDetail(postId);
      setPost(data);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleAddRootComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postId || !commentBody.trim()) return;
    await feedService.createComment(postId, {
      contentBody: commentBody,
      isAnonymous: commentAnon,
    });
    setCommentBody('');
    await loadDetail();
  };

  const handleVotePost = async (id: string, voteType: VoteType) => {
    await feedService.votePost(id, voteType);
    await loadDetail();
  };

  if (loading || !post) {
    return (
      <MainLayout>
        <div>Đang tải chi tiết bài thảo luận...</div>
      </MainLayout>
    );
  }

  const canAcceptAnswer =
    post.post_type === 'QUESTION' &&
    Boolean(user && post.author?.id && post.author.id === user.userId);

  return (
    <MainLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Link to={APP_ROUTES.CAMPUS_FEED} style={{ fontSize: 13 }}>
          ← Quay lại Bảng tin Học thuật
        </Link>

        <PostCard post={post} onVote={handleVotePost} />

        <form
          onSubmit={handleAddRootComment}
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
          <h4 style={{ fontSize: 15, fontWeight: 700 }}>
            💡 Gửi Câu trả lời / Bình luận Học thuật
          </h4>
          <RichTextEditor
            rows={4}
            value={commentBody}
            onChange={setCommentBody}
            placeholder="Nhập câu trả lời chi tiết (hỗ trợ LaTeX $$...$$ và Code ```)..."
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
                gap: 8,
                fontSize: 13,
                color: '#c4b5fd',
              }}
            >
              <input
                type="checkbox"
                checked={commentAnon}
                onChange={(e) => setCommentAnon(e.target.checked)}
                style={{ width: 15, height: 15 }}
              />
              Trả lời ẩn danh
            </label>
            <button
              type="submit"
              style={{
                background: 'var(--brand-primary)',
                border: 'none',
                color: '#fff',
                padding: '9px 18px',
                borderRadius: 8,
                fontWeight: 700,
              }}
            >
              Gửi Bình luận
            </button>
          </div>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h4 style={{ fontSize: 16, fontWeight: 700 }}>
            💬 Thảo luận & Câu trả lời ({post.comment_count})
          </h4>
          <NestedCommentTree
            comments={post.comments || []}
            canAcceptAnswer={canAcceptAnswer}
            onReply={async (parentId, body, anon) => {
              await feedService.createComment(post.id, {
                parentCommentId: parentId,
                contentBody: body,
                isAnonymous: anon,
              });
              await loadDetail();
            }}
            onVoteComment={async (commentId, vt) => {
              await feedService.voteComment(commentId, vt);
              await loadDetail();
            }}
            onAcceptAnswer={async (commentId) => {
              await feedService.acceptAnswer(post.id, commentId);
              await loadDetail();
            }}
          />
        </div>
      </div>
    </MainLayout>
  );
};
