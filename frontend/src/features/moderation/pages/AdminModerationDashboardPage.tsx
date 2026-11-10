import React, { useEffect, useState } from 'react';
import { MainLayout } from '../../../components/layout/MainLayout';
import { moderationService } from '../../../services/moderation.service';
import {
  AutoModSettingItem,
  ModerationActionItem,
  ModerationQueueItem,
  ReportReasonCode,
  ReportStatus,
  ReportTargetType,
} from '../../../types/moderation.types';
import { ModerationQueueTable } from '../components/ModerationQueueTable';
import { AutoModThresholdSettings } from '../components/AutoModThresholdSettings';
import { UserSanctionModal } from '../components/UserSanctionModal';

export const AdminModerationDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'QUEUE' | 'SETTINGS' | 'ACTIONS'>('QUEUE');
  const [queueItems, setQueueItems] = useState<ModerationQueueItem[]>([]);
  const [settings, setSettings] = useState<AutoModSettingItem[]>([]);
  const [actions, setActions] = useState<ModerationActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState<ReportStatus>('PENDING');
  const [filterTargetType, setFilterTargetType] = useState<ReportTargetType | ''>('');
  const [filterReason, setFilterReason] = useState<ReportReasonCode | ''>('');

  const [selectedItemForSanction, setSelectedItemForSanction] =
    useState<ModerationQueueItem | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'QUEUE') {
        const res = await moderationService.getModerationQueue({
          status: filterStatus,
          targetType: filterTargetType || undefined,
          reasonCode: filterReason || undefined,
        });
        setQueueItems(res || []);
      } else if (activeTab === 'SETTINGS') {
        const res = await moderationService.getAutoModSettings();
        setSettings(res || []);
      } else if (activeTab === 'ACTIONS') {
        const res = await moderationService.listModerationActions();
        setActions(res || []);
      }
    } catch (err) {
      console.error('Failed to load moderation dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, filterStatus, filterTargetType, filterReason]);

  const handleResolve = async (
    targetType: ReportTargetType,
    targetId: string,
    status: 'RESOLVED_REMOVED' | 'RESOLVED_DISMISSED',
    reason?: string
  ) => {
    try {
      await moderationService.resolveReports(targetType, targetId, {
        status,
        reason,
        actionTaken: status === 'RESOLVED_REMOVED' ? 'DELETE_CONTENT' : undefined,
      });
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể giải quyết báo cáo.');
    }
  };

  return (
    <MainLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Dashboard Header */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: 'rgba(239, 68, 68, 0.16)',
                  color: '#f87171',
                }}
              >
                ADMIN / MODERATOR
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Bảo vệ tính toàn vẹn học thuật & an toàn đời sống SV
              </span>
            </div>
            <h1 style={{ margin: 0, fontSize: 22, color: '#fff' }}>
              🛡️ Trung tâm Kiểm duyệt Nội dung & Quản trị Vi phạm
            </h1>
          </div>

          {/* Tab buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setActiveTab('QUEUE')}
              style={{
                padding: '9px 16px',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                background:
                  activeTab === 'QUEUE'
                    ? 'var(--brand-primary)'
                    : 'rgba(15, 23, 42, 0.6)',
                color: activeTab === 'QUEUE' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              🚩 Hàng đợi Báo cáo
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('SETTINGS')}
              style={{
                padding: '9px 16px',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                background:
                  activeTab === 'SETTINGS'
                    ? 'var(--brand-primary)'
                    : 'rgba(15, 23, 42, 0.6)',
                color: activeTab === 'SETTINGS' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              ⚙️ Ngưỡng Tự động Ẩn
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ACTIONS')}
              style={{
                padding: '9px 16px',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                background:
                  activeTab === 'ACTIONS'
                    ? 'var(--brand-primary)'
                    : 'rgba(15, 23, 42, 0.6)',
                color: activeTab === 'ACTIONS' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              📜 Nhật ký Kỷ luật
            </button>
          </div>
        </div>

        {/* Filter bar for Queue */}
        {activeTab === 'QUEUE' && (
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: 12,
              display: 'flex',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Lọc báo cáo:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ReportStatus)}
              style={{
                padding: '7px 10px',
                borderRadius: 6,
                background: '#0f172a',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: 12,
              }}
            >
              <option value="PENDING">Đang chờ xử lý (PENDING)</option>
              <option value="RESOLVED_REMOVED">Đã xóa vi phạm (REMOVED)</option>
              <option value="RESOLVED_DISMISSED">Đã bác bỏ (DISMISSED)</option>
            </select>

            <select
              value={filterTargetType}
              onChange={(e) =>
                setFilterTargetType(e.target.value as ReportTargetType | '')
              }
              style={{
                padding: '7px 10px',
                borderRadius: 6,
                background: '#0f172a',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: 12,
              }}
            >
              <option value="">Tất cả loại nội dung</option>
              <option value="POST">Bài viết (POST)</option>
              <option value="COMMENT">Bình luận (COMMENT)</option>
              <option value="DOCUMENT">Tài liệu (DOCUMENT)</option>
              <option value="COURSE_REVIEW">Review học phần (COURSE_REVIEW)</option>
              <option value="MARKETPLACE_ITEM">Chợ thanh lý (MARKETPLACE_ITEM)</option>
              <option value="HOUSING_LISTING">Nhà trọ / Ở ghép (HOUSING_LISTING)</option>
            </select>

            <select
              value={filterReason}
              onChange={(e) =>
                setFilterReason(e.target.value as ReportReasonCode | '')
              }
              style={{
                padding: '7px 10px',
                borderRadius: 6,
                background: '#0f172a',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: 12,
              }}
            >
              <option value="">Tất cả lý do vi phạm</option>
              <option value="LEAKED_EXAM">Đề thi cấm leak</option>
              <option value="SCAM_HOUSING">Lừa đảo phòng trọ</option>
              <option value="HARASSMENT_TOXIC">Công kích cá nhân / Độc hại</option>
              <option value="COPYRIGHT_WRONG_DOC">Tài liệu sai / Bản quyền</option>
              <option value="SPAM">Spam quảng cáo</option>
            </select>
          </div>
        )}

        {/* Content area */}
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            Đang tải dữ liệu kiểm duyệt...
          </div>
        ) : activeTab === 'QUEUE' ? (
          <ModerationQueueTable
            items={queueItems}
            onResolve={handleResolve}
            onSanctionClick={(item) => setSelectedItemForSanction(item)}
          />
        ) : activeTab === 'SETTINGS' ? (
          <AutoModThresholdSettings
            settings={settings}
            onUpdate={async (reasonCode, thresholdCount, isEnabled) => {
              await moderationService.updateAutoModSetting(reasonCode, {
                thresholdCount,
                isEnabled,
              });
              await loadData();
            }}
          />
        ) : (
          /* Audit Actions Log */
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 14,
              padding: 20,
            }}
          >
            <h3 style={{ margin: '0 0 14px', fontSize: 16, color: '#fff' }}>
              📜 Lịch sử Chế tài & Kỷ luật Đã Thi hành
            </h3>
            {actions.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Chưa có hành động kỷ luật nào được ghi nhận.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {actions.map((act) => (
                  <div
                    key={act.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      borderRadius: 10,
                      background: 'rgba(15, 23, 42, 0.55)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 6,
                            background:
                              act.action_taken === 'PERMANENT_BAN' ||
                              act.action_taken === 'TEMPORARY_BAN'
                                ? 'rgba(239, 68, 68, 0.2)'
                                : 'rgba(245, 158, 11, 0.2)',
                            color:
                              act.action_taken === 'PERMANENT_BAN' ||
                              act.action_taken === 'TEMPORARY_BAN'
                                ? '#f87171'
                                : '#fbbf24',
                          }}
                        >
                          {act.action_taken}
                        </span>
                        <strong style={{ fontSize: 13, color: '#fff' }}>
                          Đối tượng: {act.target_type} ({act.target_id.slice(0, 8)}...)
                        </strong>
                        {act.target_user && (
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            • Sinh viên: {act.target_user.full_name}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                        Lý do: {act.reason}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text-muted)' }}>
                      <div>{new Date(act.created_at).toLocaleString('vi-VN')}</div>
                      <div>Bởi: {act.moderator?.full_name || 'Hệ thống'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <UserSanctionModal
        item={selectedItemForSanction}
        onClose={() => setSelectedItemForSanction(null)}
        onSubmit={async (payload) => {
          await moderationService.executeAction(payload);
          await loadData();
        }}
      />
    </MainLayout>
  );
};
