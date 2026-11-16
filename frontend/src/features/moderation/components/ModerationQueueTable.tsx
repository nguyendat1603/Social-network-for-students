import React from 'react';
import {
  ModerationQueueItem,
  ReportTargetType,
} from '../../../types/moderation.types';

interface ModerationQueueTableProps {
  items: ModerationQueueItem[];
  onResolve: (
    targetType: ReportTargetType,
    targetId: string,
    status: 'RESOLVED_REMOVED' | 'RESOLVED_DISMISSED',
    reason?: string
  ) => Promise<void>;
  onSanctionClick: (item: ModerationQueueItem) => void;
}

const REASON_LABELS: Record<string, { label: string; color: string }> = {
  LEAKED_EXAM: { label: 'Đề thi cấm leak', color: 'var(--color-charcoal-ink)' },
  SCAM_HOUSING: { label: 'Lừa đảo phòng trọ', color: '#8b6227' },
  HARASSMENT_TOXIC: { label: 'Công kích / Độc hại', color: '#f43f5e' },
  COPYRIGHT_WRONG_DOC: { label: 'Tài liệu sai / Bản quyền', color: '#eab308' },
  SPAM: { label: 'Spam quảng cáo', color: 'var(--color-graphite)' },
};

export const ModerationQueueTable: React.FC<ModerationQueueTableProps> = ({
  items,
  onResolve,
  onSanctionClick,
}) => {
  if (items.length === 0) {
    return (
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 9,
          padding: 36,
          textAlign: 'center',
          color: 'var(--text-muted)',
        }}
      >
        🎉 Hiện không có nội dung nào trong Hàng đợi Kiểm duyệt! Cộng đồng sinh viên đang hoạt động rất tích cực và an toàn.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {items.map((item) => {
        const reasonMeta = REASON_LABELS[item.latest_reason] || {
          label: item.latest_reason,
          color: 'var(--color-charcoal-ink)',
        };

        const author = item.target_content?.real_author;

        return (
          <div
            key={`${item.target_type}:${item.target_id}`}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 9,
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 9,
                      background: 'var(--color-fog-mist)',
                      color: 'var(--color-charcoal-ink)',
                    }}
                  >
                    {item.target_type}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 9,
                      background: 'var(--color-fog-mist)',
                      color: reasonMeta.color,
                    }}
                  >
                    {reasonMeta.label}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Báo cáo lần cuối: {new Date(item.latest_reported_at).toLocaleString('vi-VN')}
                  </span>
                </div>

                <h4 style={{ margin: 0, fontSize: 16, color: 'var(--text-primary)' }}>
                  {item.target_content?.title || `Nội dung ID: ${item.target_id}`}
                </h4>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  borderRadius: 9,
                  background: 'var(--color-fog-mist)',
                  border: '1px solid var(--color-fog-mist)',
                  color: 'var(--color-charcoal-ink)',
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                🚩 {item.report_count} lượt báo cáo ({item.unique_reporters_count} SV độc lập)
              </div>
            </div>

            {/* Content snippet */}
            {item.target_content?.content && (
              <div
                style={{
                  padding: 12,
                  borderRadius: 9,
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid var(--border-color)',
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  maxHeight: 120,
                  overflowY: 'auto',
                }}
              >
                {item.target_content.content}
              </div>
            )}

            {/* Author disclosure (Even if anonymous) */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: 9,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                fontSize: 12,
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Tác giả thực tế: </span>
                <strong style={{ color: 'var(--color-charcoal-ink)' }}>
                  {author?.full_name || item.target_content?.author_name || 'Không xác định'}
                </strong>
                {author?.student_code && ` (MSSV: ${author.student_code})`}
                {author?.email && ` • ${author.email}`}
                {item.target_content?.is_anonymous && (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 10,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: 'var(--color-fog-mist)',
                      color: 'var(--color-charcoal-ink)',
                    }}
                  >
                    🎭 Bài đăng Ẩn danh
                  </span>
                )}
              </div>

              {author?.karma_points !== undefined && (
                <span style={{ color: 'var(--color-charcoal-ink)', fontWeight: 600 }}>
                  Karma: {author.karma_points}
                </span>
              )}
            </div>

            {/* Reports list preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Chi tiết các đơn báo cáo:
              </div>
              {item.reports.map((r) => (
                <div
                  key={r.id}
                  style={{
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>
                    • {r.reporter?.full_name || 'SV ẩn'}:{' '}
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {r.description || '(Không có mô tả thêm)'}
                    </span>
                  </span>
                  <span>{new Date(r.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
              ))}
            </div>

            {/* Actions Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 10,
                marginTop: 4,
                paddingTop: 10,
                borderTop: '1px solid var(--border-color)',
              }}
            >
              <button
                type="button"
                onClick={() =>
                  onResolve(
                    item.target_type,
                    item.target_id,
                    'RESOLVED_DISMISSED',
                    'Báo cáo không đủ cơ sở vi phạm.'
                  )
                }
                style={{
                  padding: '7px 14px',
                  borderRadius: 9,
                  background: 'var(--color-fog-mist)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ✓ Bác bỏ báo cáo & Khôi phục
              </button>

              <button
                type="button"
                onClick={() =>
                  onResolve(
                    item.target_type,
                    item.target_id,
                    'RESOLVED_REMOVED',
                    'Nội dung vi phạm tiêu chuẩn cộng đồng và đã bị xóa (-20 Karma).'
                  )
                }
                style={{
                  padding: '7px 14px',
                  borderRadius: 9,
                  background: 'var(--color-fog-mist)',
                  border: '1px solid var(--color-fog-mist)',
                  color: 'var(--color-charcoal-ink)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                🗑️ Xóa vĩnh viễn & Trừ -20 Karma
              </button>

              <button
                type="button"
                onClick={() => onSanctionClick(item)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 9,
                  background: 'var(--brand-primary)',
                  border: 'none',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ⚖️ Kỷ luật tài khoản...
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
