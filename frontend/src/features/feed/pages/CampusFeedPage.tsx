import React, { useCallback, useEffect, useState } from 'react';
import { MainLayout } from '../../../components/layout/MainLayout';
import { identityService } from '../../../services/identity.service';
import { feedService } from '../../../services/feed.service';
import { CourseItem, FacultyItem } from '../../../types/identity.types';
import { PostItem, VoteType } from '../../../types/feed.types';
import { ContextualFeedTabs } from '../components/ContextualFeedTabs';
import { PostCard } from '../components/PostCard';
import { PostComposerModal } from '../components/PostComposerModal';

export const CampusFeedPage: React.FC = () => {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [faculties, setFaculties] = useState<FacultyItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [sort, setSort] = useState<'new' | 'hot' | 'unanswered'>('new');
  const [searchQuery, setSearchQuery] = useState('');
  const [showComposer, setShowComposer] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const data = await feedService.listPosts({
        scope: 'CAMPUS',
        sort,
        q: searchQuery || undefined,
      });
      setPosts(data);
    } finally {
      setLoading(false);
    }
  }, [sort, searchQuery]);

  useEffect(() => {
    identityService
      .getCatalog()
      .then((res) => {
        setFaculties(res.faculties);
        setCourses(res.courses);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const handleVote = async (postId: string, voteType: VoteType) => {
    const res = await feedService.votePost(postId, voteType);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              upvote_count: res.upvote_count,
              downvote_count: res.downvote_count,
              helpful_count: res.helpful_count,
            }
          : p
      )
    );
  };

  return (
    <MainLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>
              🌐 Campus Feed — Bảng tin Toàn trường
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Thảo luận học thuật, hỏi bài LaTeX/Code, thông báo sự kiện và đời sống sinh viên.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowComposer(true)}
            style={{
              background: 'var(--brand-primary)',
              color: '#fff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            + Đăng bài / Đặt câu hỏi
          </button>
        </div>

        <ContextualFeedTabs />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Tìm kiếm bài viết, từ khóa môn học hoặc công thức..."
          />
          <div style={{ display: 'flex', gap: 6 }}>
            {(['new', 'hot', 'unanswered'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSort(s)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  border: '1px solid var(--border-color)',
                  background:
                    sort === s ? 'var(--bg-elevated)' : 'var(--bg-secondary)',
                  color: sort === s ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {s === 'new'
                  ? 'Mới nhất'
                  : s === 'hot'
                  ? 'Nổi bật'
                  : 'Chưa có câu trả lời'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div>Đang tải bảng tin từ Supabase Online...</div>
        ) : posts.length === 0 ? (
          <div
            style={{
              padding: 36,
              textAlign: 'center',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
            }}
          >
            Chưa có bài đăng nào trong luồng tin này. Hãy là sinh viên đầu tiên đặt câu hỏi hoặc chia sẻ kiến thức!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onVote={handleVote} />
            ))}
          </div>
        )}

        {showComposer && (
          <PostComposerModal
            defaultScope="CAMPUS"
            faculties={faculties}
            courses={courses}
            onClose={() => setShowComposer(false)}
            onSubmit={async (payload) => {
              await feedService.createPost(payload);
              await loadFeed();
            }}
          />
        )}
      </div>
    </MainLayout>
  );
};
