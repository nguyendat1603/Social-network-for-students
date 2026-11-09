import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { APP_ROUTES } from '../../../config/routes.config';
import { communicationService } from '../../../services/communication.service';

export const RealtimeNotificationBell: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const fetchCount = async () => {
      try {
        const res = await communicationService.listNotifications();
        if (mounted) {
          setUnreadCount(res.unreadCount || 0);
        }
      } catch {
        // Ignore unauthenticated or transient errors
      }
    };

    fetchCount();
    const timer = window.setInterval(fetchCount, 20000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Link
        to={APP_ROUTES.MESSENGER}
        title="Tin nhắn & Phòng Chat Nhóm"
        style={{
          padding: '6px 10px',
          borderRadius: 8,
          background: 'rgba(59, 130, 246, 0.12)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: '#60a5fa',
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        💬 Chat
      </Link>

      <Link
        to={APP_ROUTES.NOTIFICATIONS}
        title="Thông báo thời gian thực"
        style={{
          position: 'relative',
          padding: '6px 10px',
          borderRadius: 8,
          background: 'rgba(148, 163, 184, 0.12)',
          border: '1px solid var(--border-color)',
          color: '#fff',
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        🔔 Thông báo
        {unreadCount > 0 && (
          <span
            style={{
              marginLeft: 6,
              padding: '1px 6px',
              borderRadius: 999,
              background: '#ef4444',
              color: '#fff',
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {unreadCount}
          </span>
        )}
      </Link>
    </div>
  );
};
