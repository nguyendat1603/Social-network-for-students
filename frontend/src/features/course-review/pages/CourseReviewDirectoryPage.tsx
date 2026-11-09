import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../../components/layout/MainLayout';
import { APP_ROUTES } from '../../../config/routes.config';
import { courseReviewService } from '../../../services/course-review.service';
import { identityService } from '../../../services/identity.service';
import {
  CourseWithAggregate,
  LecturerItem,
} from '../../../types/course-review.types';
import { FacultyItem } from '../../../types/identity.types';

export const CourseReviewDirectoryPage: React.FC = () => {
  const [faculties, setFaculties] = useState<FacultyItem[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [courses, setCourses] = useState<CourseWithAggregate[]>([]);
  const [lecturers, setLecturers] = useState<LecturerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    identityService
      .getCatalog()
      .then((res) => setFaculties(res.faculties))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    courseReviewService
      .getDirectory(selectedFacultyId || undefined)
      .then((res) => {
        setCourses(res.courses);
        setLecturers(res.lecturers);
      })
      .finally(() => setLoading(false));
  }, [selectedFacultyId]);

  return (
    <MainLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>
              ⭐ Kho Review Học phần & Giảng viên (Ẩn danh)
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Đánh giá ẩn danh về độ nặng BTL, tính công bằng chấm điểm và phương pháp giảng dạy theo thang 1–5 sao.
            </p>
          </div>

          <Link
            to={APP_ROUTES.SUBJECT_QA_FORUM}
            style={{
              background: 'var(--brand-primary)',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            🔎 Mở Diễn đàn Hỏi bài theo Môn
          </Link>
        </div>

        <div>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Lọc theo Khoa / Viện:
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
          <div>Đang tải danh mục review từ Supabase Online...</div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
              gap: 16,
            }}
          >
            {courses.map((c) => (
              <Link
                key={c.id}
                to={`/course-reviews/${c.code}`}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 20,
                  color: 'var(--text-primary)',
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
                  }}
                >
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      background: 'rgba(59, 130, 246, 0.18)',
                      color: '#60a5fa',
                      fontWeight: 800,
                      fontSize: 13,
                    }}
                  >
                    #{c.code}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {c.credits} tín chỉ · {c.aggregate.total_reviews} reviews
                  </span>
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 700 }}>{c.name}</h3>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 6,
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    marginTop: 4,
                  }}
                >
                  <span>Độ khó: {Number(c.aggregate.avg_difficulty).toFixed(1)}★</span>
                  <span>Độ nặng BTL: {Number(c.aggregate.avg_workload).toFixed(1)}★</span>
                  <span>Công bằng: {Number(c.aggregate.avg_fairness).toFixed(1)}★</span>
                  <span>Giảng dạy: {Number(c.aggregate.avg_teaching).toFixed(1)}★</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: 20,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
            👨‍🏫 Danh sách Giảng viên trong Khoa/Viện ({lecturers.length})
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 12,
            }}
          >
            {lecturers.map((l) => (
              <div
                key={l.id}
                style={{
                  padding: 14,
                  borderRadius: 10,
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  {l.academic_title} {l.full_name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  {l.bio}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
