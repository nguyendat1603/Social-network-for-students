import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { APP_ROUTES } from '../../config/routes.config';

export const RightSidebar: React.FC = () => {
  const { user } = useAuth();

  return (
    <aside
      style={{
        width: 310,
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      {/* Widget 1: Góc học tập cá nhân (Design.txt) */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-card)',
          padding: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="ig-story-ring" style={{ padding: 2 }}>
            <div
              className="avatar-inner"
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: 'var(--brand-primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              {user?.fullName ? user.fullName[0].toUpperCase() : 'S'}
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>
                {user?.fullName || 'Sinh viên UniSphere'}
              </strong>
              <span style={{ color: '#10b981', fontSize: 13 }} title="Verified Student">
                ✓
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {user?.cohort ? `${user.cohort} · ` : 'K65 · '}
              {user?.major || 'Công nghệ thông tin'}
            </div>
          </div>
        </div>

        <div
          style={{
            height: 1,
            backgroundColor: 'var(--border-color)',
            margin: '16px 0',
          }}
        />

        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--brand-primary)' }}>
              {user?.karmaPoints || 450}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '9999px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#d97706',
              }}
            >
              ⚡ Bậc 2
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Academic Karma · Sinh viên tích cực
          </div>

          {/* Karma Progress bar with Instagram Sunset gradient */}
          <div
            style={{
              width: '100%',
              height: 6,
              backgroundColor: '#e2e8f0',
              borderRadius: 3,
              marginTop: 12,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '60%',
                height: '100%',
                background: 'var(--ig-gradient)',
                borderRadius: 3,
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, textAlign: 'right' }}>
            Còn 300 điểm đến Bậc 3 (Đại sứ học thuật)
          </div>
        </div>
      </div>

      {/* Widget 2: Đang được quan tâm / Chủ đề nổi bật (Design.txt) */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-card)',
          padding: '20px',
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>🔥 Chủ đề nổi bật</span>
          <span style={{ fontSize: 11, color: 'var(--brand-primary)', cursor: 'pointer' }}>Xem tất cả</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link
            to={APP_ROUTES.CAMPUS_FEED}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              padding: '6px 8px',
              borderRadius: 6,
              background: 'var(--bg-elevated)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-primary)' }}>
              #IT3080 · Mạng máy tính
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              128 bài thảo luận · 86 sinh viên theo dõi
            </div>
          </Link>

          <Link
            to={APP_ROUTES.CAMPUS_FEED}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              padding: '6px 8px',
              borderRadius: 6,
              background: 'var(--bg-elevated)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-primary)' }}>
              #MI2020 · Xác suất thống kê
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              94 bài thảo luận · 32 đề thi có giải
            </div>
          </Link>

          <Link
            to={APP_ROUTES.STUDY_GROUPS}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              padding: '6px 8px',
              borderRadius: 6,
              background: 'var(--bg-elevated)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-primary)' }}>
              #DoAnTotNghiep · K65
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              24 nhóm đang tìm đồng đội
            </div>
          </Link>
        </div>
      </div>

      {/* Widget 3: Quick CTA */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1877f2 0%, #4338ca 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px 20px',
          color: '#ffffff',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
          📚 Chia sẻ tài liệu học tập
        </div>
        <p style={{ fontSize: 12, opacity: 0.9, lineHeight: 1.4, marginBottom: 12 }}>
          Đóng góp slide, đề thi hoặc đồ án để nhận +30 Karma và mở khóa đặc quyền tải tài liệu không giới hạn.
        </p>
        <Link
          to={APP_ROUTES.RESOURCE_HUB}
          style={{
            backgroundColor: '#ffffff',
            color: '#1877f2',
            padding: '6px 14px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            display: 'inline-block',
          }}
        >
          Tải lên ngay →
        </Link>
      </div>
    </aside>
  );
};
