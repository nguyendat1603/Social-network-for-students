import React from 'react';
import { CourseReviewItem } from '../../../types/course-review.types';

interface LecturerReviewListProps {
  reviews: CourseReviewItem[];
}

export const LecturerReviewList: React.FC<LecturerReviewListProps> = ({
  reviews,
}) => {
  if (reviews.length === 0) {
    return (
      <div
        style={{
          padding: 28,
          textAlign: 'center',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--text-muted)',
        }}
      >
        Chưa có đánh giá ẩn danh nào cho học phần này. Hãy chia sẻ trải nghiệm của bạn cho khóa sau!
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {reviews.map((rev) => (
        <div
          key={rev.id}
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: 'var(--color-highlight-cyan)',
                  color: 'var(--color-charcoal-ink)',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                🎭 @{rev.author?.anonymous_handle || 'SinhVienAnDanh'}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Kỳ học: <strong>{rev.semester}</strong>
              </span>
              {rev.lecturer && (
                <span style={{ fontSize: 12, color: 'var(--color-charcoal-ink)' }}>
                  · GV: {rev.lecturer.academic_title} {rev.lecturer.full_name}
                </span>
              )}
              {rev.expected_grade && (
                <span
                  style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 20,
                    background: 'var(--color-highlight-yellow)',
                    color: 'var(--color-charcoal-ink)',
                  }}
                >
                  Điểm kỳ vọng/đạt: {rev.expected_grade}
                </span>
              )}
            </div>

            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {new Date(rev.created_at).toLocaleDateString('vi-VN')}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              fontSize: 12,
              color: 'var(--text-secondary)',
            }}
          >
            <span>Độ khó: {rev.difficulty_score}★</span>
            <span>· Bài tập lớn: {rev.workload_score}★</span>
            <span>· Công bằng chấm điểm: {rev.grading_fairness_score}★</span>
            <span>· Giảng dạy: {rev.teaching_quality_score}★</span>
            <span>· Tài liệu đọc: {rev.reading_load_score}★</span>
          </div>

          <p style={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>
            {rev.review_content}
          </p>

          {rev.tips_for_junior && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 20,
                background: 'var(--color-highlight-yellow)',
                border: '1px solid var(--color-highlight-yellow)',
                fontSize: 13,
                color: '#a7f3d0',
              }}
            >
              💡 <strong>Lời khuyên cho khóa sau:</strong> {rev.tips_for_junior}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
