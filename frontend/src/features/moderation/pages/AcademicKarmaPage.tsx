import React, { useEffect, useState } from 'react';
import { MainLayout } from '../../../components/layout/MainLayout';
import { moderationService } from '../../../services/moderation.service';
import {
  KarmaLeaderboardItem,
  KarmaSummaryResponse,
  UserPrivilegesResponse,
} from '../../../types/moderation.types';
import { KarmaPointsSummary } from '../components/KarmaPointsSummary';
import { PrivilegeUnlockProgress } from '../components/PrivilegeUnlockProgress';

export const AcademicKarmaPage: React.FC = () => {
  const [summary, setSummary] = useState<KarmaSummaryResponse | null>(null);
  const [privileges, setPrivileges] = useState<UserPrivilegesResponse | null>(null);
  const [leaderboard, setLeaderboard] = useState<KarmaLeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LEADERBOARD'>('OVERVIEW');

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, privRes, leadRes] = await Promise.all([
        moderationService.getMyKarma(),
        moderationService.getMyPrivileges(),
        moderationService.getLeaderboard({ limit: 15 }),
      ]);
      setSummary(sumRes);
      setPrivileges(privRes);
      setLeaderboard(leadRes);
    } catch (err) {
      console.error('Failed to load karma data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <MainLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 14,
            padding: 22,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 22, color: 'var(--text-primary)' }}>
              ⭐ Điểm Uy tín Học thuật & Đặc quyền Sinh viên (Academic Karma)
            </h1>
            <p
              style={{
                margin: '6px 0 0',
                fontSize: 13,
                color: 'var(--text-secondary)',
              }}
            >
              Hệ thống ghi nhận đóng góp học thuật: giải đáp câu hỏi (Accepted Answer +15), chia sẻ tài liệu (+5), hoàn thành Task đồ án (+5) và mở khóa đặc quyền tải tài liệu không giới hạn.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setActiveTab('OVERVIEW')}
              style={{
                padding: '9px 16px',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                background:
                  activeTab === 'OVERVIEW'
                    ? 'var(--brand-primary)'
                    : 'rgba(15, 23, 42, 0.6)',
                color: activeTab === 'OVERVIEW' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Điểm của tôi & Đặc quyền
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('LEADERBOARD')}
              style={{
                padding: '9px 16px',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                background:
                  activeTab === 'LEADERBOARD'
                    ? 'var(--brand-primary)'
                    : 'rgba(15, 23, 42, 0.6)',
                color: activeTab === 'LEADERBOARD' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              🏆 Bảng Vinh danh Cống hiến
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            Đang tải dữ liệu điểm uy tín...
          </div>
        ) : activeTab === 'OVERVIEW' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {summary && <KarmaPointsSummary summary={summary} />}
            {privileges && <PrivilegeUnlockProgress privileges={privileges} />}
          </div>
        ) : (
          /* Leaderboard Tab */
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 14,
              padding: 22,
            }}
          >
            <h3 style={{ margin: '0 0 6px', fontSize: 17, color: 'var(--text-primary)' }}>
              🌟 Top Sinh viên Đóng góp Học thuật Xuất sắc
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
              Vinh danh các bạn sinh viên tích cực giải đáp thắc mắc, chia sẻ tài liệu ôn thi chất lượng và hỗ trợ cộng đồng.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {leaderboard.map((item) => {
                const isTop1 = item.rank === 1;
                const isTop2 = item.rank === 2;
                const isTop3 = item.rank === 3;
                const rankIcon = isTop1
                  ? '🥇'
                  : isTop2
                  ? '🥈'
                  : isTop3
                  ? '🥉'
                  : `#${item.rank}`;

                return (
                  <div
                    key={item.userId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderRadius: 10,
                      background: isTop1
                        ? 'rgba(245, 158, 11, 0.12)'
                        : isTop2
                        ? 'rgba(148, 163, 184, 0.12)'
                        : isTop3
                        ? 'rgba(180, 83, 9, 0.12)'
                        : 'rgba(15, 23, 42, 0.55)',
                      border: isTop1
                        ? '1px solid rgba(245, 158, 11, 0.45)'
                        : '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span
                        style={{
                          fontSize: isTop1 || isTop2 || isTop3 ? 20 : 14,
                          fontWeight: 800,
                          width: 32,
                          textAlign: 'center',
                          color: isTop1 ? '#fbbf24' : '#fff',
                        }}
                      >
                        {rankIcon}
                      </span>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <strong style={{ fontSize: 14, color: '#fff' }}>
                            {item.fullName}
                          </strong>
                          {item.studentCode && (
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              ({item.studentCode})
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 999,
                              background: 'rgba(59, 130, 246, 0.18)',
                              color: '#60a5fa',
                            }}
                          >
                            {item.badgeLabel}
                          </span>
                        </div>
                        {item.major && (
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                            Chuyên ngành: {item.major}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#34d399' }}>
                        +{item.karmaPoints} Karma
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
