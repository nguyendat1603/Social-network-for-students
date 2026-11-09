import React, { useCallback, useEffect, useState } from 'react';
import { MainLayout } from '../../../components/layout/MainLayout';
import { useAuth } from '../../../hooks/useAuth';
import { feedService } from '../../../services/feed.service';
import { identityService } from '../../../services/identity.service';
import { CourseItem, FacultyItem } from '../../../types/identity.types';
import { PostItem, VoteType } from '../../../types/feed.types';
import { ContextualFeedTabs } from '../components/ContextualFeedTabs';
import { PostCard } from '../components/PostCard';
import { PostComposerModal } from '../components/PostComposerModal';

export const DepartmentFeedPage: React.FC = () => {
  const { user } = useAuth();
  const [faculties, setFaculties] = useState<FacultyItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState(
    user?.facultyId || ''
  );
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    identityService.getCatalog().then((res) => {
      setFaculties(res.faculties);
      setCourses(res.courses);
      if (!selectedFacultyId && res.faculties.length > 0) {
        setSelectedFacultyId(user?.facultyId || res.faculties[0].id);
      }
    });
  }, [user?.facultyId, selectedFacultyId]);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const data = await feedService.listPosts({
        scope: 'DEPARTMENT',
        facultyId: selectedFacultyId || undefined,
      });
      setPosts(data);
    } finally {
      setLoading(false);
    }
  }, [selectedFacultyId]);

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
              🏛️ Department / Major Feed — Thảo luận theo Khoa/Viện
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Không gian trao đổi học thuật chuyên sâu theo từng trường/khoa/viện.
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
            + Đăng bài trong Khoa/Viện
          </button>
        </div>

        <ContextualFeedTabs />

        <div>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Chọn Khoa / Viện hiển thị:
          </label>
          <select
            value={selectedFacultyId}
            onChange={(e) => setSelectedFacultyId(e.target.value)}
            style={{ marginTop: 4 }}
          >
            <option value="">-- Tất cả Khoa / Viện --</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>
                [{f.code}] {f.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div>Đang tải bài viết theo Khoa/Viện...</div>
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
            Chưa có thảo luận nào trong Khoa/Viện này.
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
            defaultScope="DEPARTMENT"
            faculties={faculties}
            courses={courses}
            onClose={() => setShowComposer(false)}
            onSubmit={async (payload) => {
              await feedService.createPost({
                ...payload,
                facultyId: payload.facultyId || selectedFacultyId || null,
              });
              await loadFeed();
            }}
          />
        )}
      </div>
    </MainLayout>
  );
};
