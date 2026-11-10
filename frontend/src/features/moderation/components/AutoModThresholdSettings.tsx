import React, { useState } from 'react';
import {
  AutoModSettingItem,
  ReportReasonCode,
} from '../../../types/moderation.types';

interface AutoModThresholdSettingsProps {
  settings: AutoModSettingItem[];
  onUpdate: (
    reasonCode: ReportReasonCode,
    thresholdCount: number,
    isEnabled: boolean
  ) => Promise<void>;
}

const REASON_TITLES: Record<string, string> = {
  LEAKED_EXAM: 'Đề thi cấm leak / Bảo mật đề thi',
  SCAM_HOUSING: 'Lừa đảo phòng trọ / Gian lận cọc',
  HARASSMENT_TOXIC: 'Công kích cá nhân / Ngôn từ độc hại',
  COPYRIGHT_WRONG_DOC: 'Tài liệu sai kiến thức / Bản quyền',
  SPAM: 'Spam tin rác / Quảng cáo dịch vụ',
};

export const AutoModThresholdSettings: React.FC<AutoModThresholdSettingsProps> = ({
  settings,
  onUpdate,
}) => {
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [tempThreshold, setTempThreshold] = useState<number>(3);
  const [tempEnabled, setTempEnabled] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);

  const startEdit = (s: AutoModSettingItem) => {
    setEditingCode(s.reason_code);
    setTempThreshold(s.threshold_count);
    setTempEnabled(s.is_enabled);
  };

  const handleSave = async (reasonCode: ReportReasonCode) => {
    setSaving(true);
    try {
      await onUpdate(reasonCode, tempThreshold, tempEnabled);
      setEditingCode(null);
    } finally {
      setSaving(false);
    }
  };

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
      <div>
        <h3 style={{ margin: 0, fontSize: 16, color: '#fff' }}>
          ⚙️ Cấu hình Ngưỡng Tự động Ẩn Nội dung (Auto-Moderation)
        </h3>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
          Khi một nội dung nhận đủ số lượng báo cáo độc lập đạt ngưỡng, hệ thống sẽ tự động tạm ẩn nội dung khỏi Bảng tin để chờ Ban quản trị duyệt.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {settings.map((s) => {
          const isEditing = editingCode === s.reason_code;
          return (
            <div
              key={s.reason_code}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: 10,
                background: 'rgba(15, 23, 42, 0.55)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>
                  {REASON_TITLES[s.reason_code] || s.reason_code}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Mã vi phạm: <code>{s.reason_code}</code> • Hành động: <strong>{s.action_to_take}</strong>
                </div>
              </div>

              {isEditing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Ngưỡng:
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={tempThreshold}
                      onChange={(e) => setTempThreshold(Number(e.target.value))}
                      style={{
                        width: 55,
                        marginLeft: 6,
                        padding: '4px 6px',
                        borderRadius: 6,
                        background: '#0f172a',
                        border: '1px solid var(--border-color)',
                        color: '#fff',
                        fontSize: 12,
                      }}
                    />
                  </label>

                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input
                      type="checkbox"
                      checked={tempEnabled}
                      onChange={(e) => setTempEnabled(e.target.checked)}
                    />
                    Bật
                  </label>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSave(s.reason_code)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 6,
                      background: 'var(--brand-primary)',
                      border: 'none',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Lưu
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCode(null)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span
                    style={{
                      fontSize: 12,
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: s.is_enabled
                        ? 'rgba(16, 185, 129, 0.16)'
                        : 'rgba(148, 163, 184, 0.16)',
                      color: s.is_enabled ? '#34d399' : '#94a3b8',
                      fontWeight: 600,
                    }}
                  >
                    {s.is_enabled ? `Ngưỡng: ${s.threshold_count} báo cáo` : 'Đã tắt'}
                  </span>

                  <button
                    type="button"
                    onClick={() => startEdit(s)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 6,
                      background: 'rgba(148, 163, 184, 0.14)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    Sửa
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
