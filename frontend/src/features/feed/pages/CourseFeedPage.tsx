import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { APP_ROUTES } from '../../../config/routes.config';
import { MainLayout } from '../../../components/layout/MainLayout';
import { feedService } from '../../../services/feed.service';
import { identityService } from '../../../services/identity.service';
import { CourseItem, FacultyItem } from '../../../types/identity.types';
import { PostItem, VoteType } from '../../../types/feed.types';
import { PostCard } from '../components/PostCard';
import { PostComposerModal } from '../components/PostComposerModal';

export const CourseFeedPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCourseCode = searchParams.get('code') || searchParams.get('courseCode') || '';

  const [faculties, setFaculties] = useState<FacultyItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const requestVersion = useRef(0);
  const [catalogLoading, setCatalogLoading] = useState(true);

  useEffect(() => {
    let active = true;
    identityService.getCatalog().then((res) => {
      if (!active) return;
      setFaculties(res.faculties);
      setCourses(res.courses);
    }).catch(() => { if (active) setError('Không thể tải danh sách học phần.'); })
      .finally(() => { if (active) setCatalogLoading(false); });
    return () => { active = false; };
  }, []);

  const loadFeed = useCallback(async () => {
    const version = ++requestVersion.current;
    if (!selectedCourseCode || catalogLoading) { setPosts([]); setLoading(false); return; }
    if (!courses.some(course => course.code === selectedCourseCode)) {
      setPosts([]);
      setError('Không tìm thấy học phần. Hãy chọn một môn trong danh sách.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await feedService.listPosts({
        scope: 'COURSE',
        courseCode: selectedCourseCode || undefined,
        postType: 'DISCUSSION',
      });
      if (version !== requestVersion.current) return;
      setPosts(data);
      setError('');
    } catch {
      if (version !== requestVersion.current) return;
      setPosts([]);
      setError('Không thể tải bài viết học phần. Vui lòng thử lại.');
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, [selectedCourseCode, courses, catalogLoading]);

  useEffect(() => {
    loadFeed();
    return () => { requestVersion.current++; };
  }, [loadFeed]);

  const handleSelectCourse = (code: string) => {
    setSearchParams({ code });
  };

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
      {error && <p role="alert">{error} <button type="button" onClick={loadFeed}>Thử lại</button></p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-cahuenga)',
                fontSize: 28,
                fontWeight: 500,
                color: 'var(--color-ink)',
                lineHeight: 1.24,
              }}
            >
              Thảo luận {selectedCourseCode ? `· ${selectedCourseCode}` : 'học phần'}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--color-stone)', marginTop: 4 }}>
              Trao đổi cách học, kinh nghiệm và bài tập lớn. Câu hỏi cần lời giải nằm trong tab Hỏi đáp.
            </p>
          </div>
          <button
            type="button"
            disabled={!courses.some(course => course.code === selectedCourseCode)}
            onClick={() => setShowComposer(true)}
            className="substack-btn-primary"
          >
            + Đăng bài thảo luận
          </button>
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
          Học phần
          <select value={selectedCourseCode} onChange={event => handleSelectCourse(event.target.value)} disabled={catalogLoading}>
            <option value="">Chọn một học phần</option>
            {courses.map(course => <option key={course.id} value={course.code}>{course.code} · {course.name}</option>)}
          </select>
        </label>

        {catalogLoading || loading ? (
          <div>Đang tải bài viết của học phần #{selectedCourseCode}...</div>
        ) : !selectedCourseCode ? <p>Chọn một môn ở trên hoặc <Link to={APP_ROUTES.COURSES}>xem danh mục học phần</Link>.</p> : posts.length === 0 ? (
          <div
            style={{
              padding: 32,
              textAlign: 'center',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
            }}
          >
            Chưa có bài thảo luận cho học phần này. Bạn có thể xem câu hỏi trong tab Hỏi đáp.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {posts.map((p) => (
              <PostCard key={p.id} post={p} onVote={handleVote} />
            ))}
          </div>
        )}

        {showComposer && (
          <PostComposerModal
            defaultScope="COURSE"
            defaultPostType="DISCUSSION"
            defaultCourseId={courses.find(course => course.code === selectedCourseCode)?.id}
            faculties={faculties}
            courses={courses}
            onClose={() => setShowComposer(false)}
            onSubmit={async (payload) => {
              const matchedCourse = courses.find(
                (c) => c.code === selectedCourseCode
              );
              await feedService.createPost({
                ...payload,
                courseId: payload.courseId || matchedCourse?.id || null,
              });
              await loadFeed();
            }}
          />
        )}
      </div>
    </MainLayout>
  );
};
