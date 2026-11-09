import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MainLayout } from '../../../components/layout/MainLayout';
import { APP_ROUTES } from '../../../config/routes.config';
import { courseReviewService } from '../../../services/course-review.service';
import {
  CourseAggregateMetrics,
  CourseReviewItem,
  LecturerItem,
} from '../../../types/course-review.types';
import { CourseCriteriaRadarChart } from '../components/CourseCriteriaRadarChart';
import { LecturerReviewList } from '../components/LecturerReviewList';
import { WriteAnonymousReviewModal } from '../components/WriteAnonymousReviewModal';

export const CourseReviewDetailPage: React.FC = () => {
  const { courseCode } = useParams<{ courseCode: string }>();
  const [course, setCourse] = useState<{
    id: string;
    code: string;
    name: string;
    credits: number;
    description: string | null;
  } | null>(null);
  const [aggregate, setAggregate] = useState<CourseAggregateMetrics | null>(
    null
  );
  const [lecturers, setLecturers] = useState<LecturerItem[]>([]);
  const [reviews, setReviews] = useState<CourseReviewItem[]>([]);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadDetail = useCallback(async () => {
    if (!courseCode) return;
    setLoading(true);
    try {
      const res = await courseReviewService.getCourseReviewDetail(courseCode);
      setCourse(res.course);
      setAggregate(res.aggregate);
      setLecturers(res.lecturers);
      setReviews(res.reviews);
    } finally {
      setLoading(false);
    }
  }, [courseCode]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  if (loading || !course || !aggregate) {
    return (
      <MainLayout>
        <div>Đang tải dữ liệu đánh giá học phần #{courseCode}...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Link to={APP_ROUTES.COURSE_REVIEWS} style={{ fontSize: 13 }}>
          ← Quay lại Danh mục Học phần
        </Link>

        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>
              #{course.code} — {course.name} ({course.credits} TC)
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              {course.description}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link
              to={`/course-reviews/forum?courseCode=${course.code}`}
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                color: '#93c5fd',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              🔎 Hỏi đáp môn #{course.code}
            </Link>
            <button
              type="button"
              onClick={() => setShowWriteModal(true)}
              style={{
                background: '#7c3aed',
                color: '#fff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              🎭 Viết Review Ẩn danh
            </button>
          </div>
        </div>

        <CourseCriteriaRadarChart aggregate={aggregate} />

        <LecturerReviewList reviews={reviews} />

        {showWriteModal && (
          <WriteAnonymousReviewModal
            courseId={course.id}
            courseCode={course.code}
            lecturers={lecturers}
            onClose={() => setShowWriteModal(false)}
            onSubmit={async (payload) => {
              await courseReviewService.createReview(payload);
              await loadDetail();
            }}
          />
        )}
      </div>
    </MainLayout>
  );
};
