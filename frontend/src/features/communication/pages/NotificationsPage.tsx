import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../../components/layout/MainLayout';
import { communicationService } from '../../../services/communication.service';
import { NotificationItem } from '../../../types/communication.types';

export const NotificationsPage: React.FC = () => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await communicationService.listNotifications();
      setItems(res.items || []);
      setUnreadCount(res.unreadCount || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    await communicationService.markNotificationsRead();
    await loadNotifications();
  };

  return (
    <MainLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 14,
            padding: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 21, color: 'var(--text-primary)' }}>
              🔔 Trung tâm Thông báo Thời gian thực
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
              Cập nhật phản hồi bài đăng, câu trả lời được chấp nhận (+Karma), lời mời/duyệt nhóm đồ án và nhắc hạn nộp Task Kanban.
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                background: 'rgba(59, 130, 246, 0.16)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                color: '#60a5fa',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              ✓ Đánh dấu tất cả đã đọc ({unreadCount})
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)' }}>
            Đang tải thông báo...
          </div>
        ) : items.length === 0 ? (
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 14,
              padding: 36,
              textAlign: 'center',
              color: 'var(--text-secondary)',
            }}
          >
            Bạn chưa có thông báo mới nào.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((n) => (
              <div
                key={n.id}
                style={{
                  background: n.is_read
                    ? 'var(--bg-secondary)'
                    : 'rgba(59, 130, 246, 0.12)',
                  border: n.is_read
                    ? '1px solid var(--border-color)'
                    : '1px solid rgba(59, 130, 246, 0.45)',
                  borderRadius: 12,
                  padding: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                    {n.body}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                    {new Date(n.created_at).toLocaleString('vi-VN')}
                  </div>
                </div>

                {n.reference_url && (
                  <Link
                    to={n.reference_url}
                    onClick={() => communicationService.markNotificationsRead(n.id)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: 8,
                      background: 'var(--brand-primary)',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Xem chi tiết →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};
