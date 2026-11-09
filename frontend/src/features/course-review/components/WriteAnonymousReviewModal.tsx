import React, { useState } from 'react';
import { LecturerItem } from '../../../types/course-review.types';

interface WriteAnonymousReviewModalProps {
  courseId: string;
  courseCode: string;
  lecturers: LecturerItem[];
  onClose: () => void;
  onSubmit: (payload: {
    courseId: string;
    lecturerId?: string | null;
    semester: string;
    difficultyScore: number;
    workloadScore: number;
    gradingFairnessScore: number;
    teachingQualityScore: number;
    readingLoadScore: number;
    reviewContent: string;
    tipsForJunior?: string | null;
    expectedGrade?: string | null;
    isAnonymous?: boolean;
  }) => Promise<void>;
}

export const WriteAnonymousReviewModal: React.FC<
  WriteAnonymousReviewModalProps
> = ({ courseId, courseCode, lecturers, onClose, onSubmit }) => {
  const [lecturerId, setLecturerId] = useState('');
  const [semester, setSemester] = useState('2025.1');
  const [difficultyScore, setDifficultyScore] = useState(3);
  const [workloadScore, setWorkloadScore] = useState(4);
  const [gradingFairnessScore, setGradingFairnessScore] = useState(5);
  const [teachingQualityScore, setTeachingQualityScore] = useState(5);
  const [readingLoadScore, setReadingLoadScore] = useState(3);
  const [expectedGrade, setExpectedGrade] = useState('A');
  const [reviewContent, setReviewContent] = useState('');
  const [tipsForJunior, setTipsForJunior] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        courseId,
        lecturerId: lecturerId || null,
        semester,
        difficultyScore,
        workloadScore,
        gradingFairnessScore,
        teachingQualityScore,
        readingLoadScore,
        reviewContent,
        tipsForJunior: tipsForJunior.trim() || null,
        expectedGrade: expectedGrade || null,
        isAnonymous: true,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 6, 23, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 95,
        padding: 20,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: 640,
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>
            🎭 Viết Review Ẩn danh cho Học phần #{courseCode}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#fff' }}
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

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr',
            gap: 12,
          }}
        >
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Giảng viên phụ trách (Tùy chọn)
            </label>
            <select
              value={lecturerId}
              onChange={(e) => setLecturerId(e.target.value)}
            >
              <option value="">-- Đánh giá chung học phần --</option>
              {lecturers.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.academic_title} {l.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Kỳ học (YYYY.1/2/3) *
            </label>
            <input
              required
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              placeholder="2025.1"
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Điểm đạt/kỳ vọng
            </label>
            <select
              value={expectedGrade}
              onChange={(e) => setExpectedGrade(e.target.value)}
            >
              <option value="A+">A+</option>
              <option value="A">A</option>
              <option value="B+">B+</option>
              <option value="B">B</option>
              <option value="C+">C+</option>
              <option value="C">C</option>
            </select>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 10,
          }}
        >
          {[
            { label: 'Độ khó', val: difficultyScore, set: setDifficultyScore },
            { label: 'Độ nặng BTL', val: workloadScore, set: setWorkloadScore },
            {
              label: 'Công bằng',
              val: gradingFairnessScore,
              set: setGradingFairnessScore,
            },
            {
              label: 'Giảng dạy',
              val: teachingQualityScore,
              set: setTeachingQualityScore,
            },
            {
              label: 'Tài liệu đọc',
              val: readingLoadScore,
              set: setReadingLoadScore,
            },
          ].map((item) => (
            <div key={item.label}>
              <label style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                {item.label} (1-5★)
              </label>
              <select
                value={item.val}
                onChange={(e) => item.set(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} ★
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Nhận xét chi tiết về học phần, bài tập lớn và cách chấm điểm *
          </label>
          <textarea
            rows={4}
            required
            minLength={15}
            value={reviewContent}
            onChange={(e) => setReviewContent(e.target.value)}
            placeholder="Chia sẻ khách quan về khối lượng bài tập lớn, đề thi giữa kỳ/cuối kỳ, phong cách giảng dạy..."
          />
        </div>

        <div>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Bí kíp / Lời khuyên cho khóa sau (Tips for Juniors)
          </label>
          <input
            value={tipsForJunior}
            onChange={(e) => setTipsForJunior(e.target.value)}
            placeholder="VD: Nên làm BTL sớm từ tuần 4, đọc kỹ slide chương 3..."
          />
        </div>

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
              background: '#7c3aed',
              border: 'none',
              color: '#fff',
              padding: '9px 20px',
              borderRadius: 8,
              fontWeight: 700,
            }}
          >
            {submitting ? 'Đang gửi ẩn danh...' : 'Gửi Review Ẩn danh'}
          </button>
        </div>
      </form>
    </div>
  );
};
