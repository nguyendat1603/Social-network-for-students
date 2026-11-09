import React, { useState } from 'react';
import { RichTextEditor } from '../../../components/common/RichTextEditor';
import { useAnonymousMode } from '../../../hooks/useAnonymousMode';
import { FeedScope, PostType } from '../../../types/feed.types';
import { CourseItem, FacultyItem } from '../../../types/identity.types';

interface PostComposerModalProps {
  defaultScope: FeedScope;
  faculties: FacultyItem[];
  courses: CourseItem[];
  onClose: () => void;
  onSubmit: (payload: {
    feedScope: FeedScope;
    facultyId?: string | null;
    courseId?: string | null;
    postType: PostType;
    title: string;
    contentBody: string;
    isAnonymous?: boolean;
  }) => Promise<void>;
}

export const PostComposerModal: React.FC<PostComposerModalProps> = ({
  defaultScope,
  faculties,
  courses,
  onClose,
  onSubmit,
}) => {
  const { isAnonymousActive, anonymousHandle } = useAnonymousMode();
  const [feedScope, setFeedScope] = useState<FeedScope>(defaultScope);
  const [postType, setPostType] = useState<PostType>('QUESTION');
  const [facultyId, setFacultyId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [contentBody, setContentBody] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(isAnonymousActive);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        feedScope,
        facultyId: facultyId || null,
        courseId: courseId || null,
        postType,
        title,
        contentBody,
        isAnonymous: postType === 'ANNOUNCEMENT' ? false : isAnonymous,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo bài đăng.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 6, 23, 0.78)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 90,
        padding: 20,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: 680,
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>
            ✍️ Tạo Bài đăng / Câu hỏi Học thuật (Post Engine)
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: 18,
            }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Luồng bảng tin (Contextual Scope)
            </label>
            <select
              value={feedScope}
              onChange={(e) => setFeedScope(e.target.value as FeedScope)}
            >
              <option value="CAMPUS">Campus Feed (Toàn trường)</option>
              <option value="DEPARTMENT">Department Feed (Theo Khoa/Viện)</option>
              <option value="COURSE">Course Feed (Theo Học phần)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Loại bài đăng
            </label>
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value as PostType)}
            >
              <option value="QUESTION">Hỏi đáp học tập (Q&A - Có Accepted Answer)</option>
              <option value="DISCUSSION">Thảo luận chuyên môn / Chia sẻ</option>
              <option value="ANNOUNCEMENT">Thông báo / Sự kiện</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Gắn Khoa / Viện (Tùy chọn)
            </label>
            <select
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value)}
            >
              <option value="">-- Tất cả Khoa / Viện --</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  [{f.code}] {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Gắn Học phần (Hoặc gõ #MãMôn trong nội dung)
            </label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              <option value="">-- Tự động nhận diện từ #Hashtag --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  [{c.code}] {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Tiêu đề bài đăng / câu hỏi *
          </label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: Cách tính tích phân đường loại 2 trong #MI1131 hoặc lỗi Socket TCP trong #IT3080"
          />
        </div>

        <RichTextEditor value={contentBody} onChange={setContentBody} />

        {postType !== 'ANNOUNCEMENT' && (
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 13,
              cursor: 'pointer',
              color: '#c4b5fd',
            }}
          >
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              style={{ width: 16, height: 16 }}
            />
            <span>
              Đăng dưới biệt danh ẩn danh <strong>@{anonymousHandle}</strong> (Ẩn tên thật & MSSV)
            </span>
          </label>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              padding: '9px 16px',
              borderRadius: 8,
            }}
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{
              background: 'var(--brand-primary)',
              border: 'none',
              color: '#fff',
              padding: '9px 20px',
              borderRadius: 8,
              fontWeight: 700,
            }}
          >
            {submitting ? 'Đang đăng...' : 'Đăng bài lên Bảng tin'}
          </button>
        </div>
      </form>
    </div>
  );
};
