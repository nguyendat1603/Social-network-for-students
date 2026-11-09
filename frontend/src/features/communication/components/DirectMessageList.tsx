import React from 'react';
import { ConversationItem } from '../../../types/communication.types';

interface DirectMessageListProps {
  conversations: ConversationItem[];
  currentUserId?: string;
  selectedId: string | null;
  onSelect: (convId: string) => void;
}

export const DirectMessageList: React.FC<DirectMessageListProps> = ({
  conversations,
  currentUserId,
  selectedId,
  onSelect,
}) => {
  const directConvs = conversations.filter((c) => c.type === 'DIRECT');

  if (directConvs.length === 0) {
    return (
      <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '8px 4px' }}>
        Chưa có tin nhắn 1-1 nào. Bạn có thể bấm "Nhắn tin người bán/người đăng" từ Chợ Sinh viên hoặc Nhóm đồ án.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {directConvs.map((conv) => {
        const peer =
          conv.participants.find((p) => p.user_id !== currentUserId)?.user ||
          conv.participants[0]?.user;
        const isActive = conv.id === selectedId;

        return (
          <button
            key={conv.id}
            type="button"
            onClick={() => onSelect(conv.id)}
            style={{
              textAlign: 'left',
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              background: isActive
                ? 'rgba(59, 130, 246, 0.2)'
                : 'rgba(15, 23, 42, 0.5)',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 13 }}>
              👤 {peer?.full_name || 'Sinh viên'}
            </div>
            {conv.latest_message && (
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  marginTop: 4,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {conv.latest_message.content || conv.latest_message.file_name}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
