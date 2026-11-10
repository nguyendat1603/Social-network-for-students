import React from 'react';
import { KarmaSummaryResponse } from '../../../types/moderation.types';

interface KarmaPointsSummaryProps {
  summary: KarmaSummaryResponse;
}

const ACTION_LABELS: Record<string, { label: string; icon: string }> = {
  DOCUMENT_UPVOTED: { label: 'Tài liệu nhận Upvote', icon: '📄' },
  ANSWER_ACCEPTED: { label: 'Câu trả lời được chọn là Accepted Answer', icon: '✅' },
  POST_OR_COMMENT_UPVOTED: { label: 'Bài viết/bình luận nhận Upvote', icon: '👍' },
  KANBAN_TASK_COMPLETED_ON_TIME: { label: 'Hoàn thành Task Kanban đúng hạn', icon: '⏱️' },
  MARKETPLACE_FREE_GIVEAWAY: { label: 'Tặng đồ học tập miễn phí trên Chợ', icon: '🎁' },
  CONTENT_REMOVED_VIOLATION: { label: 'Vi phạm quy định bị gỡ nội dung', icon: '⚠️' },
};

export const KarmaPointsSummary: React.FC<KarmaPointsSummaryProps> = ({ summary }) => {
  const isPositive = summary.currentKarma >= 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
        }}
      >
        {/* Main Karma Score */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 14,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Điểm Uy tín Học thuật (Karma)
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: isPositive ? '#34d399' : '#f87171',
              marginTop: 6,
            }}
          >
            {summary.currentKarma > 0 ? `+${summary.currentKarma}` : summary.currentKarma}
          </div>
          <div style={{ marginTop: 8 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 999,
                background: 'rgba(59, 130, 246, 0.16)',
                color: '#60a5fa',
              }}
            >
              {summary.tier.badgeLabel}
            </span>
          </div>
        </div>

        {/* Total Earned */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 14,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Tổng điểm đã tích lũy
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#34d399',
              marginTop: 6,
            }}
          >
            +{summary.stats.totalEarned} Karma
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            Từ câu trả lời đúng, chia sẻ tài liệu & BTL
          </div>
        </div>

        {/* Total Deducted */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 14,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Điểm trừ do vi phạm
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: summary.stats.totalDeducted > 0 ? '#f87171' : 'var(--text-muted)',
              marginTop: 6,
            }}
          >
            -{summary.stats.totalDeducted} Karma
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            {summary.stats.totalDeducted === 0
              ? 'Hồ sơ trong sạch, không vi phạm tiêu chuẩn'
              : 'Nội dung bị report hoặc vi phạm quy tắc'}
          </div>
        </div>
      </div>

      {/* Recent Ledger Transactions */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 14,
          padding: 20,
        }}
      >
        <h3 style={{ margin: '0 0 14px', fontSize: 16, color: '#fff' }}>
          📜 Sổ cái Biến động Điểm Uy tín Gần đây
        </h3>

        {summary.recentTransactions.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '16px 0' }}>
            Chưa có biến động điểm Karma nào. Hãy chia sẻ tài liệu hoặc giải đáp thắc mắc của bạn học để nhận điểm đầu tiên!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {summary.recentTransactions.map((tx) => {
              const meta = ACTION_LABELS[tx.action_type] || {
                label: tx.action_type,
                icon: '⭐',
              };
              const isPlus = tx.points_delta > 0;

              return (
                <div
                  key={tx.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: 'rgba(15, 23, 42, 0.55)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{meta.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                        {meta.label}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {new Date(tx.created_at).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: isPlus ? '#34d399' : '#f87171',
                    }}
                  >
                    {isPlus ? `+${tx.points_delta}` : tx.points_delta} Karma
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
