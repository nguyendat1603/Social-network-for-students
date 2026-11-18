import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { APP_ROUTES } from '../../../config/routes.config';
import { MainLayout } from '../../../components/layout/MainLayout';
import { identityService } from '../../../services/identity.service';
import { feedService } from '../../../services/feed.service';
import { CourseItem, FacultyItem } from '../../../types/identity.types';
import { PostItem, VoteType } from '../../../types/feed.types';
import { ContextualFeedTabs } from '../components/ContextualFeedTabs';
import { PostCard } from '../components/PostCard';
import { PostComposerModal } from '../components/PostComposerModal';
import styles from './CampusFeedPage.module.css';

export const CampusFeedPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [faculties, setFaculties] = useState<FacultyItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [sort, setSort] = useState<'new' | 'hot' | 'unanswered'>('new');
  const [showComposer, setShowComposer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const requestId = useRef(0);
  const pageSize = 20;

  const loadFeed = useCallback(async (nextPage = 1) => {
    const request = ++requestId.current;
    if (nextPage === 1) {
      setLoading(true);
      setLoadingMore(false);
    } else setLoadingMore(true);
    setError('');
    try {
      const data = await feedService.listPosts({
        scope: 'CAMPUS',
        sort,
        q: searchQuery || undefined,
        page: nextPage,
        limit: pageSize,
      });
      if (request !== requestId.current) return;
      setPosts(previous => nextPage === 1 ? data : [...previous, ...data.filter(post => !previous.some(item => item.id === post.id))]);
      setPage(nextPage);
      setHasMore(data.length === pageSize);
      setError('');
    } catch {
      if (request !== requestId.current) return;
      if (nextPage === 1) {
        setPosts([]);
        setHasMore(false);
      }
      setError('Không thể tải bài viết. Vui lòng thử lại.');
    } finally {
      if (request === requestId.current) {
        setLoading(false);
        setLoadingMore(false);
      }
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
    return () => { requestId.current += 1; };
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

  return (
    <MainLayout variant="campus" onAsk={() => setShowComposer(true)}>
      <div className={styles.feed}>
        <header className={styles.heading}>
          <h1>Bản tin</h1>
          <p>Những trao đổi mới trong cộng đồng sinh viên.</p>
        </header>
        <section className={styles.controls} aria-label="Điều hướng và lọc bản tin">
          <ContextualFeedTabs />
          <div className={styles.filters}>
            <select aria-label="Mở bản tin học phần" value="" onChange={event => {
              if (event.target.value) navigate(`${APP_ROUTES.COURSE_FEED}?code=${encodeURIComponent(event.target.value)}`);
            }}>
              <option value="">Chọn học phần</option>
              {courses.map(course => <option key={course.id} value={course.code}>{course.code} · {course.name}</option>)}
            </select>
            <select aria-label="Sắp xếp bài viết" value={sort} onChange={event => setSort(event.target.value as typeof sort)}>
              <option value="new">Mới nhất</option>
              <option value="hot">Sôi nổi nhất</option>
              <option value="unanswered">Chưa có lời giải</option>
            </select>
          </div>
        </section>
        {searchQuery && <div className={styles.searchResult}>
          <span>Kết quả cho “{searchQuery}”</span>
          <button type="button" data-demo-read-action onClick={() => navigate(APP_ROUTES.CAMPUS_FEED)}>Xóa tìm kiếm</button>
        </div>}
        <section className={styles.posts} aria-label="Danh sách bài viết" aria-busy={loading}>
          {!loading && error && <div className={styles.state} role="alert"><p>{error}</p><button type="button" onClick={() => loadFeed()}>Thử lại</button></div>}
          {loading ? <div className={styles.state} role="status">Đang tải bản tin…</div>
            : posts.length === 0 ? !error && <div className={styles.state} role="status"><strong>Chưa có bài viết phù hợp</strong><p>Thử tìm kiếm khác hoặc quay lại sau.</p></div>
            : posts.map(post => <PostCard key={post.id} post={post} onVote={handleVote} compact />)}
        </section>
        {!loading && hasMore && <div className={styles.loadMore}>
          <button type="button" disabled={loadingMore} onClick={() => loadFeed(page + 1)}>{loadingMore ? 'Đang tải…' : 'Tải thêm bài viết'}</button>
          <span role="status">{posts.length} bài viết đã hiển thị</span>
        </div>}

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
