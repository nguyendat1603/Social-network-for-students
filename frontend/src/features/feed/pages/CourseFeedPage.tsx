import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '../../../components/layout/MainLayout';
import { feedService } from '../../../services/feed.service';
import { identityService } from '../../../services/identity.service';
import { CourseItem, FacultyItem } from '../../../types/identity.types';
import { PostItem, VoteType } from '../../../types/feed.types';
import { ContextualFeedTabs } from '../components/ContextualFeedTabs';
import { PostCard } from '../components/PostCard';
import { PostComposerModal } from '../components/PostComposerModal';

export const CourseFeedPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || 'IT3080';

  const [faculties, setFaculties] = useState<FacultyItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCourseCode, setSelectedCourseCode] = useState(initialCode);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    identityService.getCatalog().then((res) => {
      setFaculties(res.faculties);
      setCourses(res.courses);
    });
  }, []);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const data = await feedService.listPosts({
        scope: 'COURSE',
        courseCode: selectedCourseCode || undefined,
      });
      setPosts(data);
    } finally {
      setLoading(false);
    }
  }, [selectedCourseCode]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const handleSelectCourse = (code: string) => {
    setSelectedCourseCode(code);
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
              📘 Course Feed — Bảng tin Học phần #{selectedCourseCode}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Tự động gom mọi bài đăng & câu hỏi có gắn thẻ #{selectedCourseCode}.
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
            + Đặt câu hỏi cho #{selectedCourseCode}
          </button>
        </div>

        <ContextualFeedTabs />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {courses.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleSelectCourse(c.code)}
              style={{
                padding: '7px 14px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                border: '1px solid var(--border-color)',
                background:
                  selectedCourseCode === c.code
                    ? 'var(--brand-primary)'
                    : 'var(--bg-secondary)',
                color:
                  selectedCourseCode === c.code
                    ? '#fff'
                    : 'var(--text-secondary)',
              }}
            >
              #{c.code} · {c.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div>Đang tải bài viết của học phần #{selectedCourseCode}...</div>
        ) : posts.length === 0 ? (
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
            Chưa có bài viết nào gắn thẻ #{selectedCourseCode}.
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
