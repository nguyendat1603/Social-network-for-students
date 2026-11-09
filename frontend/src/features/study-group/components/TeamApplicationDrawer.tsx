import React, { useState } from 'react';
import { StudyGroupItem } from '../../../types/study-group.types';

interface TeamApplicationDrawerProps {
  group: StudyGroupItem | null;
  onClose: () => void;
  onSubmit: (
    groupId: string,
    payload: { slotId: string; coverLetter: string; portfolioUrl?: string }
  ) => Promise<void>;
}

export const TeamApplicationDrawer: React.FC<TeamApplicationDrawerProps> = ({
  group,
  onClose,
  onSubmit,
}) => {
  const availableSlots = (group?.slots || []).filter(
    (s) => s.quantity_filled < s.quantity_needed
  );
  const [slotId, setSlotId] = useState<string>(availableSlots[0]?.id || '');
  const [coverLetter, setCoverLetter] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!group) return null;

  const selectedSlotId = slotId || availableSlots[0]?.id || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(group.id, {
        slotId: selectedSlotId,
        coverLetter,
        portfolioUrl: portfolioUrl || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gửi đơn ứng tuyển thất bại');
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
        justifyContent: 'flex-end',
        zIndex: 100,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 460,
          background: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-color)',
          height: '100%',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 18, color: '#fff' }}>
            📩 Ứng tuyển vào nhóm đồ án
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

        <div
          style={{
            padding: 12,
            borderRadius: 10,
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.28)',
          }}
        >
          <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>
            {group.group_name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            Mục tiêu điểm: <strong>{group.target_grade}</strong> • Hồ sơ học thuật (MSSV, Khóa, Kỹ năng) của bạn sẽ tự động đính kèm cho Nhóm trưởng xem xét.
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: 10,
              borderRadius: 8,
              background: 'rgba(239, 68, 68, 0.16)',
              color: '#f87171',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Chọn vị trí ứng tuyển
            </label>
            <select
              value={selectedSlotId}
              onChange={(e) => setSlotId(e.target.value)}
              style={{
                width: '100%',
                marginTop: 6,
                padding: '10px 12px',
                borderRadius: 8,
                background: '#0f172a',
                border: '1px solid var(--border-color)',
                color: '#fff',
              }}
            >
              {availableSlots.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.role_name} (Còn trống {slot.quantity_needed - slot.quantity_filled} slot)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Tóm tắt kinh nghiệm & cam kết làm việc nhóm
            </label>
            <textarea
              required
              rows={5}
              placeholder="Giới thiệu kỹ năng của bạn, các project từng làm và thời gian có thể dành cho đồ án..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              style={{
                width: '100%',
                marginTop: 6,
                padding: 12,
                borderRadius: 8,
                background: '#0f172a',
                border: '1px solid var(--border-color)',
                color: '#fff',
                resize: 'vertical',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Link GitHub / Portfolio / CV (Tùy chọn)
            </label>
            <input
              type="url"
              placeholder="https://github.com/username"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              style={{
                width: '100%',
                marginTop: 6,
                padding: '10px 12px',
                borderRadius: 8,
                background: '#0f172a',
                border: '1px solid var(--border-color)',
                color: '#fff',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: 8,
              padding: '11px 16px',
              borderRadius: 8,
              background: 'var(--brand-primary)',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {submitting ? 'Đang gửi đơn...' : 'Gửi đơn ứng tuyển'}
          </button>
        </form>
      </div>
    </div>
  );
};
