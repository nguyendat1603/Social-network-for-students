import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../../components/layout/MainLayout';
import { communicationService } from '../../../services/communication.service';
import { NotificationItem } from '../../../types/communication.types';

export const NotificationsPage: React.FC = () => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loadError, setLoadError] = useState(false);
  const [actionError, setActionError] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const requestPending = useRef(false);

  const loadNotifications = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await communicationService.listNotifications();
      setItems(res.items || []);
      setUnreadCount(res.unreadCount || 0);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (notificationId?: string) => {
    if (requestPending.current || loading || loadError) return;
    if (notificationId && !items.some((item) => item.id === notificationId && !item.is_read)) return;

    requestPending.current = true;
    setPendingId(notificationId || 'all');
    setActionError('');
    try {
      const result = await communicationService.markNotificationsRead(notificationId);
      if (!result.updated) throw new Error('Không thể cập nhật thông báo');
      setItems((current) => current.map((item) =>
        !notificationId || item.id === notificationId ? { ...item, is_read: true } : item
      ));
      setUnreadCount((current) => notificationId ? Math.max(0, current - 1) : 0);
    } catch {
      setActionError('Không thể đánh dấu đã đọc. Vui lòng thử lại.');
    } finally {
      requestPending.current = false;
      setPendingId(null);
    }
  };

  const visibleItems = filter === 'unread' ? items.filter((item) => !item.is_read) : items;
  const busy = pendingId !== null;

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
            flexWrap: 'wrap',
            gap: 16,
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
              onClick={() => handleMarkRead()}
              disabled={busy || loading || loadError}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                background: 'rgba(59, 130, 246, 0.16)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                color: '#60a5fa',
                fontWeight: 600,
                fontSize: 12,
                cursor: busy || loading || loadError ? 'not-allowed' : 'pointer',
              }}
            >
              {pendingId === 'all' ? 'Đang cập nhật...' : `✓ Đánh dấu tất cả đã đọc (${unreadCount})`}
            </button>
          )}
        </div>

        <div role="group" aria-label="Lọc thông báo" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {(['all', 'unread'] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              style={{
                padding: '8px 14px', borderRadius: 8,
                border: '1px solid var(--border-color)',
                background: filter === value ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                color: filter === value ? '#fff' : 'var(--text-primary)', cursor: 'pointer',
              }}
            >
              {value === 'all' ? 'Tất cả' : 'Chưa đọc'}
            </button>
          ))}
          <span role="status" style={{ alignSelf: 'center', color: 'var(--text-secondary)' }}>
            {!loading && !loadError && `${unreadCount} thông báo chưa đọc`}
          </span>
        </div>

        {actionError && <div role="alert" style={{ color: 'var(--text-primary)' }}>{actionError}</div>}

        {loading ? (
          <div role="status" style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)' }}>
            Đang tải thông báo...
          </div>
        ) : loadError ? (
          <div role="alert" style={{ padding: 24, color: 'var(--text-primary)' }}>
            <p>Không thể tải thông báo. Vui lòng thử lại.</p>
            <button type="button" onClick={loadNotifications}>Thử lại</button>
          </div>
        ) : visibleItems.length === 0 ? (
          <div
            role="status"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 14,
              padding: 36,
              textAlign: 'center',
              color: 'var(--text-secondary)',
            }}
          >
            {filter === 'unread' ? 'Bạn không có thông báo chưa đọc.' : 'Bạn chưa có thông báo mới nào.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {visibleItems.map((n) => (
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
                  flexWrap: 'wrap',
                  overflowWrap: 'anywhere',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                    {n.body}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                    {new Date(n.created_at).toLocaleString('vi-VN')}
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                  {!n.is_read && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleMarkRead(n.id)}
                      aria-label={`Đánh dấu đã đọc: ${n.title}`}
                      style={{
                        padding: '7px 12px', borderRadius: 8,
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                        cursor: busy ? 'not-allowed' : 'pointer', fontSize: 12,
                      }}
                    >
                      {pendingId === n.id ? 'Đang cập nhật...' : 'Đánh dấu đã đọc'}
                    </button>
                  )}
                  {n.reference_url && (
                    <Link
                      to={n.reference_url}
                      onClick={() => { if (!n.is_read) void handleMarkRead(n.id); }}
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
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};
