import React, { useEffect, useState } from 'react';
import { MainLayout } from '../../../components/layout/MainLayout';
import { VerifiedStudentBadge } from '../../../components/common/VerifiedStudentBadge';
import { useAuth } from '../../../hooks/useAuth';
import { identityService } from '../../../services/identity.service';
import { CourseItem, FacultyItem } from '../../../types/identity.types';
import { AcademicInfoForm } from '../components/AcademicInfoForm';
import { AnonymousHandleManager } from '../components/AnonymousHandleManager';

export const AcademicProfilePage: React.FC = () => {
  const { user, setUser } = useAuth();
  const [faculties, setFaculties] = useState<FacultyItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      identityService.getMyProfile(),
      identityService.getCatalog(),
    ])
      .then(([freshProfile, catalog]) => {
        setUser(freshProfile);
        setFaculties(catalog.faculties);
        setCourses(catalog.courses);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Unable to load profile.'))
      .finally(() => setLoading(false));
  }, [setUser]);

  if (loading) {
    return (
      <MainLayout pageClassName="campus-page campus-identity">
      {error && <p role="alert">{error}</p>}
        <div>Đang tải Hồ sơ Học thuật...</div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout pageClassName="campus-page campus-identity">
      {error && <p role="alert">{error}</p>}
        <div>Vui lòng đăng nhập để xem hồ sơ học thuật.</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout pageClassName="campus-page campus-identity">
      {error && <p role="alert">{error}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div
          style={{
            background:
              'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800 }}>{user.fullName}</h1>
              <VerifiedStudentBadge isVerified={user.isVerifiedStudent} />
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                color: 'var(--text-secondary)',
                display: 'flex',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              <span>📧 {user.email}</span>
              <span>🆔 MSSV: {user.studentCode || 'Chưa cập nhật'}</span>
              <span>
                🏛️ Khoa/Viện:{' '}
                {user.faculty
                  ? `[${user.faculty.code}] ${user.faculty.name}`
                  : 'Chưa chọn'}
              </span>
              <span>⭐ Academic Karma: {user.karmaPoints} điểm</span>
            </div>
          </div>
        </div>

        <AnonymousHandleManager
          profile={user}
          onUpdateHandle={async (newHandle) => {
            const updated = await identityService.updateAnonymousHandle(
              newHandle
            );
            setUser(updated);
          }}
        />

        <AcademicInfoForm
          profile={user}
          faculties={faculties}
          onSave={async (payload) => {
            const updated = await identityService.updateMyProfile(payload);
            setUser(updated);
          }}
        />

        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: 20,
          }}
        >
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
            🗂️ Danh mục Mã học phần đã đồng bộ ({courses.length} học phần)
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {courses.map((c) => (
              <span
                key={c.id}
                style={{
                  fontSize: 12,
                  padding: '5px 10px',
                  borderRadius: 9,
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <strong style={{ color: 'var(--color-charcoal-ink)' }}>#{c.code}</strong> —{' '}
                {c.name} ({c.credits} TC)
              </span>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
