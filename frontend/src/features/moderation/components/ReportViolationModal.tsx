import { useDialog } from '../../../hooks/useDialog';
import React, { useState } from 'react';
import {
  ReportReasonCode,
  ReportTargetType,
} from '../../../types/moderation.types';
import { moderationService } from '../../../services/moderation.service';

interface ReportViolationModalProps {
  isOpen: boolean;
  targetType: ReportTargetType;
  targetId: string;
  targetTitle?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const REASONS: Array<{ code: ReportReasonCode; label: string; desc: string }> = [
  {
    code: 'LEAKED_EXAM',
    label: 'Đề thi cấm tiết lộ / Gian lận học thuật',
    desc: 'Đề thi bảo mật của trường hoặc tài liệu cấm sao chép (Ngưỡng tự động ẩn: 3 báo cáo)',
  },
  {
    code: 'SCAM_HOUSING',
    label: 'Lừa đảo phòng trọ / Thanh lý đồ giả mạo',
    desc: 'Cọc ảo, chiếm đoạt tài sản hoặc thông tin sai lệch (Ngưỡng tự động ẩn: 3 báo cáo)',
  },
  {
    code: 'HARASSMENT_TOXIC',
    label: 'Ngôn từ công kích / Quấy rối / Độc hại',
    desc: 'Xúc phạm danh dự, kỳ thị hoặc vi phạm chuẩn mực văn hóa đại học',
  },
  {
    code: 'COPYRIGHT_WRONG_DOC',
    label: 'Tài liệu sai kiến thức / Vi phạm bản quyền',
    desc: 'Nội dung gây hiểu lầm nghiêm trọng trong học tập hoặc vi phạm sở hữu trí tuệ',
  },
  {
    code: 'SPAM',
    label: 'Spam / Quảng cáo dịch vụ trái phép',
    desc: 'Đăng tin rác lặp lại hoặc nội dung không liên quan đến đời sống học thuật sinh viên',
  },
];

export const ReportViolationModal: React.FC<ReportViolationModalProps> = ({
  isOpen,
  targetType,
  targetId,
  targetTitle,
  onClose,
  onSuccess,
}) => {
  const dialogRef = useDialog(onClose, isOpen);
  const [reasonCode, setReasonCode] = useState<ReportReasonCode>('LEAKED_EXAM');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = useState<{
    autoHidden: boolean;
    currentReportCount: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await moderationService.submitReport({
        targetType,
        targetId,
        reasonCode,
        description: description.trim() || undefined,
      });

      setSubmittedResult({
        autoHidden: res.autoHidden,
        currentReportCount: res.currentReportCount,
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi báo cáo vi phạm.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Báo cáo vi phạm" tabIndex={-1}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(2, 6, 23, 0.78)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 16,
      }}
    >
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 520,
          padding: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)' }}>
            🚩 Báo cáo Vi phạm Tiêu chuẩn Cộng đồng
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: 18,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {submittedResult ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 32 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-charcoal-ink)' }}>
              Báo cáo của bạn đã được ghi nhận!
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
              Cảm ơn bạn đã chung tay bảo vệ môi trường học tập văn minh. Nội dung hiện có{' '}
              <strong>{submittedResult.currentReportCount}</strong> lượt báo cáo.
            </p>
            {submittedResult.autoHidden && (
              <div
                style={{
                  padding: 10,
                  borderRadius: 9,
                  background: 'var(--color-sand-wash)',
                  border: '1px solid var(--color-sand-wash)',
                  color: 'var(--color-charcoal-ink)',
                  fontSize: 12,
                }}
              >
                ⚡ Nội dung này đã đạt ngưỡng tự động ẩn và đã được tạm ẩn khỏi toàn bộ sinh viên để Ban quản trị xét duyệt!
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                marginTop: 10,
                padding: '9px 18px',
                borderRadius: 9,
                background: 'var(--brand-primary)',
                border: 'none',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Đóng cửa sổ
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {targetTitle && (
              <div
                style={{
                  padding: 10,
                  borderRadius: 9,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-color)',
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                }}
              >
                Đối tượng: <strong style={{ color: 'var(--color-charcoal-ink)' }}>{targetTitle}</strong> ({targetType})
              </div>
            )}

            {error && (
              <div
                style={{
                  padding: 10,
                  borderRadius: 9,
                  background: 'var(--color-fog-mist)',
                  color: 'var(--color-charcoal-ink)',
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            )}

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Chọn lý do vi phạm
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
                {REASONS.map((r) => (
                  <label
                    key={r.code}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      padding: 10,
                      borderRadius: 9,
                      background:
                        reasonCode === r.code
                          ? 'var(--color-fog-mist)'
                          : 'rgba(15, 23, 42, 0.4)',
                      border:
                        reasonCode === r.code
                          ? '1px solid var(--color-fog-mist)'
                          : '1px solid var(--border-color)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={r.code}
                      checked={reasonCode === r.code}
                      onChange={() => setReasonCode(r.code)}
                      style={{ marginTop: 2 }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-charcoal-ink)' }}>
                        {r.label}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {r.desc}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="ReportViolationModal-field-1" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Mô tả chi tiết bằng chứng vi phạm (Tùy chọn)
              </label>
              <textarea id="ReportViolationModal-field-1"
                rows={3}
                placeholder="Cung cấp thêm chi tiết để giúp Ban quản trị xử lý nhanh hơn..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: 6,
                  padding: 10,
                  borderRadius: 9,
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  color: 'var(--color-charcoal-ink)',
                  fontSize: 13,
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '9px 16px',
                  borderRadius: 9,
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '9px 18px',
                  borderRadius: 9,
                  background: '#ef4444',
                  border: 'none',
                  color: 'var(--color-charcoal-ink)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {submitting ? 'Đang gửi...' : 'Gửi báo cáo vi phạm'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
