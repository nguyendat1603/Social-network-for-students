import React from 'react';
import { Link } from 'react-router-dom';
import { StudyGroupItem } from '../../../types/study-group.types';

interface TeamRecruitmentCardProps {
  group: StudyGroupItem;
  onApplyClick: (group: StudyGroupItem) => void;
}

const GRADE_COLORS: Record<string, { bg: string; color: string }> = {
  'A+': { bg: 'rgba(16, 185, 129, 0.16)', color: '#34d399' },
  A: { bg: 'rgba(59, 130, 246, 0.16)', color: '#60a5fa' },
  'B+': { bg: 'rgba(245, 158, 11, 0.16)', color: '#fbbf24' },
  PASS: { bg: 'rgba(148, 163, 184, 0.16)', color: '#cbd5e1' },
};

export const TeamRecruitmentCard: React.FC<TeamRecruitmentCardProps> = ({
  group,
  onApplyClick,
}) => {
  const gradeStyle = GRADE_COLORS[group.target_grade] || GRADE_COLORS.A;

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 14,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            {group.course && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                }}
              >
                #{group.course.code} — {group.course.name}
              </span>
            )}
            <span
              style={{
                fontSize: 11,
                padding: '3px 8px',
                borderRadius: 6,
                background: 'rgba(148, 163, 184, 0.12)',
                color: 'var(--text-secondary)',
              }}
            >
              HK {group.semester}
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: 17, color: 'var(--text-primary)' }}>
            {group.group_name}
          </h3>
          {group.project_topic && (
            <p
              style={{
                margin: '6px 0 0',
                fontSize: 13,
                color: 'var(--text-secondary)',
              }}
            >
              Đề tài: <strong>{group.project_topic}</strong>
            </p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 999,
              background: gradeStyle.bg,
              color: gradeStyle.color,
            }}
          >
            Mục tiêu: {group.target_grade}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Thành viên: {group.member_count}/{group.max_members}
          </span>
        </div>
      </div>

      {/* Slots */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
          Vị trí đang tuyển:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(group.slots || []).map((slot) => {
            const isFull = slot.quantity_filled >= slot.quantity_needed;
            return (
              <div
                key={slot.id}
                style={{
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: '1px solid var(--border-color)',
                  background: isFull
                    ? 'rgba(15, 23, 42, 0.45)'
                    : 'rgba(30, 41, 59, 0.7)',
                  minWidth: 180,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                    color: isFull ? 'var(--text-muted)' : '#fff',
                  }}
                >
                  <span>{slot.role_name}</span>
                  <span style={{ fontSize: 11 }}>
                    {slot.quantity_filled}/{slot.quantity_needed}
                  </span>
                </div>
                {slot.required_skills?.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 4,
                      marginTop: 6,
                    }}
                  >
                    {slot.required_skills.map((skill) => (
                      <span
                        key={skill}
                        style={{
                          fontSize: 11,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: 'rgba(59, 130, 246, 0.12)',
                          color: '#93c5fd',
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 10,
          borderTop: '1px solid var(--border-color)',
        }}
      >
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Nhóm trưởng:{' '}
          <strong style={{ color: '#fff' }}>
            {group.leader?.full_name || 'Sinh viên'}
          </strong>
          {group.leader?.karma_points !== undefined && (
            <span style={{ marginLeft: 6, color: '#fbbf24' }}>
              ★ {group.leader.karma_points} Karma
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {group.is_member ? (
            <Link
              to={`/study-groups/${group.id}/workspace`}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.45)',
                color: '#34d399',
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              Vào Group Workspace →
            </Link>
          ) : group.my_application_status === 'PENDING' ? (
            <span
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                background: 'rgba(245, 158, 11, 0.16)',
                color: '#fbbf24',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              ⏳ Đang chờ Leader duyệt
            </span>
          ) : group.is_recruiting ? (
            <button
              type="button"
              onClick={() => onApplyClick(group)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: 'var(--brand-primary)',
                border: 'none',
                color: '#fff',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Ứng tuyển vào nhóm
            </button>
          ) : (
            <span
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                background: 'rgba(148, 163, 184, 0.12)',
                color: 'var(--text-muted)',
                fontSize: 12,
              }}
            >
              Đã đủ thành viên
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
