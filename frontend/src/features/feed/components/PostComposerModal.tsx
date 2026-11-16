import { useDialog } from '../../../hooks/useDialog';
import React, { useState } from 'react';
import { RichTextEditor } from '../../../components/common/RichTextEditor';
import { useAnonymousMode } from '../../../hooks/useAnonymousMode';
import { FeedScope, PostType } from '../../../types/feed.types';
import { CourseItem, FacultyItem } from '../../../types/identity.types';

interface PostComposerModalProps {
  defaultScope: FeedScope;
  defaultCourseId?: string;
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
  defaultCourseId,
  faculties,
  courses,
  onClose,
  onSubmit,
}) => {
  const dialogRef = useDialog(onClose);
  const { isAnonymousActive, anonymousHandle } = useAnonymousMode();
  const [feedScope, setFeedScope] = useState<FeedScope>(defaultScope);
  const [postType, setPostType] = useState<PostType>('QUESTION');
  const [facultyId, setFacultyId] = useState('');
  const [courseId, setCourseId] = useState(defaultCourseId || '');
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
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Đăng bài viết" tabIndex={-1}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 6, 23, 0.78)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 90,
        padding: 20,
        overflowY: 'auto',
      }}
    >
      <form
        className="campus-post-composer"
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: 680,
          minWidth: 0,
          maxHeight: 'calc(100dvh - 40px)',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3
            style={{
              fontFamily: 'var(--font-cahuenga)',
              fontSize: 24,
              fontWeight: 500,
              color: 'var(--color-ink)',
            }}
          >
            Xuất bản Bài viết / Câu hỏi Học thuật
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-stone)',
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
              borderRadius: 20,
              background: 'var(--color-fog-mist)',
              color: 'var(--color-charcoal-ink)',
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
            <select aria-label="Học phần"
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
              color: 'var(--color-charcoal-ink)',
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

        <div className="campus-post-composer-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            className="substack-btn-outline"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="substack-btn-primary"
          >
            {submitting ? 'Đang xuất bản...' : 'Đăng bài lên Bảng tin'}
          </button>
        </div>
      </form>
    </div>
  );
};
