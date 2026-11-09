import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChatMessageItem,
  ConversationItem,
} from '../../../types/communication.types';
import { ChatFileAttachment } from './ChatFileAttachment';

interface ChatConversationPanelProps {
  conversation: ConversationItem | null;
  messages: ChatMessageItem[];
  currentUserId?: string;
  onSendMessage: (payload: {
    content?: string;
    fileUrl?: string;
    fileName?: string;
  }) => Promise<void>;
}

export const ChatConversationPanel: React.FC<ChatConversationPanelProps> = ({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
}) => {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  if (!conversation) {
    return (
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 14,
          padding: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          minHeight: 480,
        }}
      >
        Chọn một cuộc trò chuyện bên trái để bắt đầu trao đổi học tập hoặc đồ án.
      </div>
    );
  }

  const peer =
    conversation.type === 'DIRECT'
      ? conversation.participants.find((p) => p.user_id !== currentUserId)?.user
      : null;

  const headerTitle =
    conversation.type === 'DIRECT'
      ? peer?.full_name || 'Trò chuyện 1-1'
      : conversation.title ||
        conversation.study_group?.group_name ||
        'Phòng Chat Nhóm';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await onSendMessage({ content: text.trim() });
      setText('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 14,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 520,
        maxHeight: '75vh',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>
            {headerTitle}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {conversation.type === 'DIRECT'
              ? 'Tin nhắn trực tiếp 1-1'
              : `${conversation.participants.length} thành viên trong nhóm`}
          </div>
        </div>

        {conversation.study_group_id && (
          <Link
            to={`/study-groups/${conversation.study_group_id}/workspace`}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              background: 'rgba(16, 185, 129, 0.16)',
              color: '#34d399',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            🛠️ Mở Group Workspace →
          </Link>
        )}
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          padding: 18,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;
          if (msg.message_type === 'SYSTEM') {
            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: 'center',
                  fontSize: 11,
                  padding: '4px 12px',
                  borderRadius: 999,
                  background: 'rgba(148, 163, 184, 0.12)',
                  color: 'var(--text-secondary)',
                }}
              >
                {msg.content}
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              style={{
                alignSelf: isMine ? 'flex-end' : 'flex-start',
                maxWidth: '72%',
                padding: '10px 14px',
                borderRadius: 12,
                background: isMine
                  ? 'var(--brand-primary)'
                  : 'rgba(15, 23, 42, 0.85)',
                border: isMine ? 'none' : '1px solid var(--border-color)',
                color: '#fff',
              }}
            >
              {!isMine && (
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#93c5fd',
                    marginBottom: 4,
                  }}
                >
                  {msg.sender?.full_name || 'Sinh viên'}
                </div>
              )}
              {msg.content && <div style={{ fontSize: 13 }}>{msg.content}</div>}
              {msg.file_url && (
                <a
                  href={msg.file_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-block',
                    marginTop: 6,
                    padding: '5px 10px',
                    borderRadius: 6,
                    background: 'rgba(2, 6, 23, 0.35)',
                    color: '#bfdbfe',
                    fontSize: 12,
                  }}
                >
                  📎 {msg.file_name || 'Mở tệp đính kèm'} ↗
                </a>
              )}
              <div
                style={{
                  fontSize: 10,
                  opacity: 0.7,
                  marginTop: 4,
                  textAlign: 'right',
                }}
              >
                {new Date(msg.created_at).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <div
        style={{
          padding: 14,
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <ChatFileAttachment
          onAttachFile={async ({ fileName, fileUrl }) => {
            await onSendMessage({
              fileName,
              fileUrl,
              content: `Đã chia sẻ tài liệu: ${fileName}`,
            });
          }}
        />
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
          <input
            placeholder="Nhập tin nhắn trao đổi bài tập / đồ án..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 10,
              background: '#0f172a',
              border: '1px solid var(--border-color)',
              color: '#fff',
              fontSize: 13,
            }}
          />
          <button
            type="submit"
            disabled={sending}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              background: 'var(--brand-primary)',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Gửi
          </button>
        </form>
      </div>
    </div>
  );
};
