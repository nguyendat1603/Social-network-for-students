import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { APP_ROUTES } from '../../../config/routes.config';
import { MainLayout } from '../../../components/layout/MainLayout';
import { useAuth } from '../../../hooks/useAuth';
import { identityService } from '../../../services/identity.service';
import { feedService } from '../../../services/feed.service';
import { CourseItem, FacultyItem } from '../../../types/identity.types';
import { PostItem, VoteType } from '../../../types/feed.types';
import { ContextualFeedTabs } from '../components/ContextualFeedTabs';
import { PostCard } from '../components/PostCard';
import { PostComposerModal } from '../components/PostComposerModal';

export const CampusFeedPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [faculties, setFaculties] = useState<FacultyItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [sort, setSort] = useState<'new' | 'hot' | 'unanswered'>('new');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [showComposer, setShowComposer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { setSearchQuery(searchParams.get('q') || ''); }, [searchParams]);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const data = await feedService.listPosts({
        scope: 'CAMPUS',
        sort,
        q: searchQuery || undefined,
      });
      setPosts(data);
      setError('');
    } catch {
      setPosts([]);
      setError('Không thể tải bài viết. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [sort, searchQuery]);

  useEffect(() => {
    identityService
      .getCatalog()
      .then((res) => {
        setFaculties(res.faculties || []);
        setCourses(res.courses || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  // Listen for Left Sidebar 'Viết bài mới' button trigger
  useEffect(() => {
    const handleOpenComposer = () => setShowComposer(true);
    window.addEventListener('open-substack-composer', handleOpenComposer);
    if (searchParams.get('compose') === '1') {
      setShowComposer(true);
    }
    return () => {
      window.removeEventListener('open-substack-composer', handleOpenComposer);
    };
  }, [searchParams]);

  const handleVote = async (postId: string, voteType: VoteType) => {
    try {
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
    } catch {
      setError('Không thể ghi nhận bình chọn. Vui lòng thử lại.');
    }
  };

  const userInitials = (user?.fullName || 'SV')
    .split(' ')
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <MainLayout variant="campus" onAsk={() => setShowComposer(true)}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* 1. SUBSTACK HERO BANNER CARD (Teal/dark gradient, Cahuenga 32px white heading) */}
        <section className="campus-welcome" data-campus-feed-header>
          <p className="campus-eyebrow">GÓC HỌC TẬP CỦA BẠN</p>
          <h1>Học cùng nhau, tiến xa hơn.</h1>
          <p>Hỏi điều đang bí, chia sẻ điều đã biết. Mỗi ngày một chút, cùng cộng đồng sinh viên.</p>
          <details className="campus-guide"><summary>Lần đầu đến đây? Xem hướng dẫn nhanh</summary><p>Chọn học phần để hỏi bài, tìm tài liệu hoặc tìm nhóm. Dùng Khám phá thêm để mở các tiện ích sinh viên.</p></details>
          <nav className="campus-quick-actions" aria-label="Bắt đầu học tập">
            <Link to={APP_ROUTES.COURSE_FEED}><strong>Hỏi về môn học →</strong><small>Trao đổi theo học phần</small></Link>
            <Link to={APP_ROUTES.RESOURCE_HUB}><strong>Tìm tài liệu →</strong><small>Chia sẻ kiến thức có nguồn</small></Link>
            <Link to={APP_ROUTES.STUDY_GROUPS}><strong>Tìm nhóm →</strong><small>Cùng học, cùng làm đồ án</small></Link>
          </nav>
          <nav className="campus-course-links" aria-label="Mở học phần">{courses.map(course => <Link key={course.id} to={`${APP_ROUTES.COURSE_FEED}?code=${encodeURIComponent(course.code)}`}>{course.code} · {course.name}</Link>)}</nav>
        </section>
        {error && <div role="alert">{error} <button type="button" onClick={loadFeed}>Thử lại</button></div>}
        {!loading && !error && posts.length === 0 && <p role="status">Chưa có bài viết phù hợp.</p>}

        {/* 2. Substack Quick Compose Prompt Row */}
        <div
          role="button"
          tabIndex={0}
          onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setShowComposer(true); } }}
          onClick={() => setShowComposer(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '12px 16px',
            borderRadius: 12,
            border: '1px solid var(--color-cloud)',
            backgroundColor: '#fafafa',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: '#f2e6e3',
                color: '#c2410c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {userInitials}
            </div>
            <span style={{ fontSize: 15, color: 'var(--color-stone)' }}>
              Bạn đang thắc mắc môn học nào? Nhập công thức $LaTeX$ hoặc #MãMôn...
            </span>
          </div>

          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--color-signal-orange)',
              flexShrink: 0,
            }}
          >
            Đăng ngay
          </span>
        </div>

        {/* 3. Navigation Scope Tabs & Sort Bar */}
        <div>
          <ContextualFeedTabs />

          <div
            data-campus-feed-filters
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              paddingTop: 14,
              flexWrap: 'wrap',
            }}
          >
            {/* Sort Pills (Secondary Gray Pill vs Orange Active Pill) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {(
                [
                  { id: 'new', label: 'Mới nhất' },
                  { id: 'hot', label: 'Sôi nổi nhất' },
                  { id: 'unanswered', label: 'Chưa có lời giải' },
                ] as const
              ).map((item) => {
                const active = sort === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSort(item.id)}
                    style={{
                      padding: '6px 16px',
                      borderRadius: 9999,
                      fontSize: 13,
                      fontWeight: 500,
                      border: 'none',
                      backgroundColor: active
                        ? 'var(--color-ink)'
                        : 'var(--color-cloud)',
                      color: active ? '#ffffff' : 'var(--color-ink)',
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Inline Keyword Filter */}
            <div style={{ flex: '0 1 220px' }}>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Lọc nhanh theo từ khóa..."
                aria-label="Lọc bài viết"
                style={{
                  borderRadius: 9999,
                  padding: '6px 14px',
                  fontSize: 13,
                  border: '1px solid var(--color-ash)',
                }}
              />
            </div>
          </div>
        </div>

        {/* 4. Feed Post List (Flat editorial rhythm separated by 1px #eeeeee hairlines) */}
        {loading ? (
          <div
            style={{
              padding: '32px 0',
              color: 'var(--color-stone)',
              fontSize: 15,
            }}
          >
            Đang tải bản tin học thuật Bách Khoa...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
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
