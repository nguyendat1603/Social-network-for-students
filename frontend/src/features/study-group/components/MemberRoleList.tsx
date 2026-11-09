import React from 'react';
import {
  GroupApplicationItem,
  GroupMemberItem,
} from '../../../types/study-group.types';

interface MemberRoleListProps {
  members: GroupMemberItem[];
  applications: GroupApplicationItem[];
  isLead: boolean;
  onReviewApplication: (
    applicationId: string,
    status: 'APPROVED' | 'REJECTED'
  ) => Promise<void>;
}

export const MemberRoleList: React.FC<MemberRoleListProps> = ({
  members,
  applications,
  isLead,
  onReviewApplication,
}) => {
  const pendingApps = applications.filter((a) => a.status === 'PENDING');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 12,
          padding: 18,
        }}
      >
        <h4 style={{ margin: '0 0 12px', fontSize: 15, color: '#fff' }}>
          👥 Thành viên Nhóm Đồ án ({members.length})
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {members.map((m) => (
            <div
              key={m.user_id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                borderRadius: 10,
                background: 'rgba(15, 23, 42, 0.55)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>
                  {m.user?.full_name || 'Sinh viên'}
                  {m.member_role === 'LEAD' && (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 11,
                        padding: '2px 7px',
                        borderRadius: 6,
                        background: 'rgba(245, 158, 11, 0.2)',
                        color: '#fbbf24',
                      }}
                    >
                      👑 LEAD
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  Vị trí: <strong>{m.assigned_role}</strong>
                  {m.user?.academic_profile?.student_id &&
                    ` • MSSV: ${m.user.academic_profile.student_id}`}
                </div>
              </div>
              {m.user?.karma_points !== undefined && (
                <span style={{ fontSize: 12, color: '#34d399', fontWeight: 600 }}>
                  {m.user.karma_points} Karma
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {isLead && (
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 12,
            padding: 18,
          }}
        >
          <h4 style={{ margin: '0 0 12px', fontSize: 15, color: '#fff' }}>
            📥 Đơn Ứng tuyển đang chờ duyệt ({pendingApps.length})
          </h4>
          {pendingApps.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Hiện không có đơn ứng tuyển nào đang chờ duyệt.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pendingApps.map((app) => (
                <div
                  key={app.id}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <strong style={{ color: '#fff', fontSize: 14 }}>
                      {app.applicant?.full_name || 'Ứng viên'}
                    </strong>
                    <span
                      style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: 'rgba(59, 130, 246, 0.16)',
                        color: '#60a5fa',
                      }}
                    >
                      Ứng tuyển: {app.slot?.role_name}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: '8px 0',
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {app.cover_letter}
                  </p>
                  {app.portfolio_url && (
                    <a
                      href={app.portfolio_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 12, color: '#60a5fa', display: 'inline-block', marginBottom: 8 }}
                    >
                      🔗 Xem Portfolio / GitHub
                    </a>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => onReviewApplication(app.id, 'APPROVED')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        background: 'rgba(16, 185, 129, 0.2)',
                        border: '1px solid rgba(16, 185, 129, 0.45)',
                        color: '#34d399',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      ✓ Duyệt vào nhóm & Thêm vào Group Chat
                    </button>
                    <button
                      type="button"
                      onClick={() => onReviewApplication(app.id, 'REJECTED')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        background: 'rgba(239, 68, 68, 0.16)',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        color: '#f87171',
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      ✕ Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
