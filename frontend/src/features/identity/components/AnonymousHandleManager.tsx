import React, { useState } from 'react';
import { AcademicProfile } from '../../../types/identity.types';

interface AnonymousHandleManagerProps {
  profile: AcademicProfile;
  onUpdateHandle: (newHandle: string) => Promise<void>;
}

export const AnonymousHandleManager: React.FC<AnonymousHandleManagerProps> = ({
  profile,
  onUpdateHandle,
}) => {
  const [handle, setHandle] = useState(profile.anonymousHandle || '');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);
    setErrorMsg(null);
    try {
      await onUpdateHandle(handle);
      setStatusMsg('Đã cập nhật Biệt danh Ẩn danh (Anonymous Handle) thành công!');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Không thể đổi biệt danh ẩn danh.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid rgba(139, 92, 246, 0.4)',
        borderRadius: 'var(--radius-lg)',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#c4b5fd' }}>
            🎭 Định danh Ẩn danh (Anonymous Handle)
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Hiển thị thay cho tên thật và MSSV khi bạn bật chế độ ẩn danh trong Hỏi đáp học tập (Module 2) hoặc Review Giảng viên/Học phần (Module 4).
          </p>
        </div>
        <span
          style={{
            padding: '6px 12px',
            borderRadius: 999,
            background: 'rgba(139, 92, 246, 0.18)',
            color: '#ddd6fe',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          @{profile.anonymousHandle}
        </span>
      </div>

      {statusMsg && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            fontSize: 13,
          }}
        >
          {statusMsg}
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            fontSize: 13,
          }}
        >
          {errorMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
        <input
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="VD: BachKhoaAnDanh_9999"
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            background: '#7c3aed',
            color: '#fff',
            border: 'none',
            padding: '0 20px',
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          {loading ? 'Đang cập nhật...' : 'Đổi Biệt danh Ẩn danh'}
        </button>
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        Lưu ý bảo mật: Hệ thống chặn đặt biệt danh chứa MSSV thật của bạn và giới hạn đổi biệt danh 30 ngày/lần.
        {profile.anonymousLastChangedAt && (
          <span>
            {' '}
            (Lần đổi gần nhất:{' '}
            {new Date(profile.anonymousLastChangedAt).toLocaleDateString('vi-VN')})
          </span>
        )}
      </div>
    </form>
  );
};
