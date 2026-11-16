import React from 'react';
import { ConversationItem } from '../../../types/communication.types';

interface ProjectGroupChatListProps {
  conversations: ConversationItem[];
  selectedId: string | null;
  onSelect: (convId: string) => void;
}

export const ProjectGroupChatList: React.FC<ProjectGroupChatListProps> = ({
  conversations,
  selectedId,
  onSelect,
}) => {
  const groupConvs = conversations.filter((c) => c.type !== 'DIRECT');

  if (groupConvs.length === 0) {
    return (
      <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '8px 4px' }}>
        Chưa có phòng chat Nhóm Đồ án nào. Khi tạo hoặc được duyệt vào nhóm đồ án, phòng chat sẽ tự động xuất hiện tại đây.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {groupConvs.map((conv) => {
        const isActive = conv.id === selectedId;
        return (
          <button
            key={conv.id}
            type="button"
            onClick={() => onSelect(conv.id)}
            style={{
              textAlign: 'left',
              padding: '10px 12px',
              borderRadius: 20,
              border: '1px solid var(--border-color)',
              background: isActive
                ? 'var(--color-highlight-yellow)'
                : 'rgba(15, 23, 42, 0.5)',
              color: 'var(--color-charcoal-ink)',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 13 }}>
              🛠️ {conv.title || conv.study_group?.group_name || 'Nhóm đồ án'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-charcoal-ink)', marginTop: 2 }}>
              {conv.participants.length} thành viên
              {conv.study_group?.course?.code &&
                ` • #${conv.study_group.course.code}`}
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
