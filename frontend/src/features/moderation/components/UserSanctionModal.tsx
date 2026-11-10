import React, { useState } from 'react';
import {
  ModerationActionType,
  ModerationQueueItem,
} from '../../../types/moderation.types';

interface UserSanctionModalProps {
  item: ModerationQueueItem | null;
  onClose: () => void;
  onSubmit: (payload: {
    targetUserId?: string | null;
    targetType: any;
    targetId: string;
    actionTaken: ModerationActionType;
    reason: string;
    deductKarma: boolean;
  }) => Promise<void>;
}

export const UserSanctionModal: React.FC<UserSanctionModalProps> = ({
  item,
  onClose,
  onSubmit,
}) => {
  const [actionTaken, setActionTaken] = useState<ModerationActionType>('WARN');
  const [reason, setReason] = useState(
    'Vi phạm tiêu chuẩn cộng đồng về tính minh bạch học thuật & đời sống sinh viên.'
  );
  const [deductKarma, setDeductKarma] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!item) return null;

  const author = item.target_content?.real_author;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        targetUserId: author?.id || item.target_content?.author_id || null,
        targetType: item.target_type,
        targetId: item.target_id,
        actionTaken,
        reason: reason.trim(),
        deductKarma,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể thực thi chế tài.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
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
          <h3 style={{ margin: 0, fontSize: 18, color: '#fff' }}>
            ⚖️ Thi hành Quyết định Kỷ luật & Chế tài
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

        {author && (
          <div
            style={{
              padding: 12,
              borderRadius: 10,
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid var(--border-color)',
              marginBottom: 14,
            }}
          >
            <div style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>
              Sinh viên vi phạm: {author.full_name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              MSSV: {author.student_code || 'Chưa cập nhật'} • Email: {author.email} • Điểm Karma: {author.karma_points}
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: 10,
              borderRadius: 8,
              background: 'rgba(239, 68, 68, 0.16)',
              color: '#f87171',
              fontSize: 13,
              marginBottom: 12,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Hình thức xử lý kỷ luật
            </label>
            <select
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value as ModerationActionType)}
              style={{
                width: '100%',
                marginTop: 6,
                padding: '9px 12px',
                borderRadius: 8,
                background: '#0f172a',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: 13,
              }}
            >
              <option value="WARN">⚠️ Nhắc nhở & Cảnh cáo sinh viên (WARNED)</option>
              <option value="TEMPORARY_BAN">⛔ Đình chỉ tài khoản tạm thời (SUSPENDED)</option>
              <option value="PERMANENT_BAN">🚫 Cấm tài khoản vĩnh viễn (BANNED)</option>
              <option value="DELETE_CONTENT">🗑️ Chỉ xóa nội dung vi phạm</option>
            </select>
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              color: '#f87171',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={deductKarma}
              onChange={(e) => setDeductKarma(e.target.checked)}
            />
            Áp dụng trừ -20 Karma vi phạm vào sổ cái uy tín
          </label>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Lý do kỷ luật (Lưu nhật ký bất biến)
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{
                width: '100%',
                marginTop: 6,
                padding: 10,
                borderRadius: 8,
                background: '#0f172a',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: 13,
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 16px',
                borderRadius: 8,
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
                borderRadius: 8,
                background: '#ef4444',
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {submitting ? 'Đang thực thi...' : 'Xác nhận Chế tài'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
