import React, { useState } from 'react';
import {
  OnlineHustFriend,
  useChatBubblesStore,
} from '../../store/chatBubbles.store';

const QUICK_ACADEMIC_PROMPTS = [
  'Cho mình xin đề cương môn này nhé!',
  'Tối nay lên Tạ Quang Bửu học nhóm không?',
  'Cậu còn slot nhóm BTL không?',
];

const OpenChatBox: React.FC<{ friend: OnlineHustFriend }> = ({ friend }) => {
  const { minimizeToBubble, closeChat, sendMessage, typingFriendIds } =
    useChatBubblesStore();
  const [draft, setDraft] = useState('');
  const isTyping = typingFriendIds.includes(friend.id);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendMessage(friend.id, draft);
    setDraft('');
  };

  return (
    <div
      style={{
        width: 324,
        height: 420,
        backgroundColor: '#ffffff',
        border: '1px solid #d8d8d8',
        borderBottom: 'none',
        borderRadius: '12px 12px 0 0',
        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.14)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'var(--font-system-ui)',
      }}
    >
      {/* Top Header (Facebook Messenger Web Style) */}
      <div
        onClick={() => minimizeToBubble(friend.id)}
        style={{
          padding: '10px 12px',
          borderBottom: '1px solid #eeeeee',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                backgroundColor: friend.avatarBg,
                color: friend.avatarText,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              {friend.initials}
            </div>
            {friend.isOnline && (
              <span
                style={{
                  position: 'absolute',
                  right: -1,
                  bottom: -1,
                  width: 11,
                  height: 11,
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  border: '2px solid #ffffff',
                }}
              />
            )}
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#363737',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {friend.fullName}
            </div>
            <div
              style={{
                fontSize: 11,
                color: '#777777',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {friend.cohort} · {friend.faculty}
            </div>
          </div>
        </div>

        {/* Header Window Controls */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            title="Thu nhỏ thành bong bóng chat"
            onClick={() => minimizeToBubble(friend.id)}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#777777',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}
          >
            —
          </button>
          <button
            type="button"
            title="Đóng cửa sổ chat"
            onClick={() => closeChat(friend.id)}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#777777',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Sub-banner: Current Academic Activity */}
      <div
        style={{
          padding: '6px 12px',
          backgroundColor: '#fafafa',
          borderBottom: '1px solid #eeeeee',
          fontSize: 11,
          color: '#5e5e5e',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span style={{ color: '#ff6719', fontWeight: 600 }}>●</span>
        <span
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {friend.activity}
        </span>
      </div>

      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          padding: '12px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          backgroundColor: '#ffffff',
        }}
      >
        {friend.messages.map((m) => {
          const isMe = m.sender === 'ME';
          return (
            <div
              key={m.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMe ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '82%',
                  padding: '8px 13px',
                  borderRadius: isMe
                    ? '16px 16px 4px 16px'
                    : '16px 16px 16px 4px',
                  backgroundColor: isMe ? '#ff6719' : '#f1f1f1',
                  color: isMe ? '#ffffff' : '#363737',
                  fontSize: 13.5,
                  lineHeight: 1.42,
                }}
              >
                {m.text}
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: '#999999',
                  marginTop: 2,
                  padding: '0 4px',
                }}
              >
                {m.time}
              </span>
            </div>
          );
        })}

        {isTyping && (
          <div
            style={{
              alignSelf: 'flex-start',
              padding: '6px 12px',
              borderRadius: 14,
              backgroundColor: '#f1f1f1',
              color: '#777777',
              fontSize: 12,
              fontStyle: 'italic',
            }}
          >
            {friend.fullName.split(' ').slice(-1)[0]} đang soạn tin...
          </div>
        )}
      </div>

      {/* Quick Academic Suggestion Chips */}
      <div
        style={{
          padding: '6px 10px',
          borderTop: '1px solid #f3f3f3',
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        {QUICK_ACADEMIC_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => sendMessage(friend.id, prompt)}
            style={{
              padding: '4px 10px',
              borderRadius: 9999,
              border: '1px solid #e5e5e5',
              backgroundColor: '#fafafa',
              color: '#5e5e5e',
              fontSize: 11,
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Bottom Message Input */}
      <form
        onSubmit={handleSend}
        style={{
          padding: '8px 10px',
          borderTop: '1px solid #eeeeee',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: '#ffffff',
        }}
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Nhập tin nhắn (Enter để gửi)..."
          style={{
            flex: 1,
            padding: '7px 14px',
            borderRadius: 9999,
            border: '1px solid #e0e0e0',
            backgroundColor: '#f7f7f7',
            fontSize: 13,
            color: '#363737',
          }}
        />
        <button
          type="submit"
          aria-label="Gửi tin nhắn"
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: 'none',
            backgroundColor: '#ff6719',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: 13,
          }}
        >
          ➤
        </button>
      </form>
    </div>
  );
};

export const FloatingChatBubbles: React.FC = () => {
  const { friends, openChatWindow, closeChat } = useChatBubblesStore();
  const [hoveredBubbleId, setHoveredBubbleId] = useState<string | null>(null);

  const openWindows = friends.filter((f) => f.windowState === 'OPEN');
  const bubbleHeads = friends.filter((f) => f.windowState === 'BUBBLE');

  return (
    <>
      {/* 1. Expanded Facebook-style Chat Boxes docked at bottom-right (left of bubbles) */}
      {openWindows.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            right: 84,
            zIndex: 85,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 12,
          }}
        >
          {openWindows.map((friend) => (
            <OpenChatBox key={friend.id} friend={friend} />
          ))}
        </div>
      )}

      {/* 2. Floating Circular Chat Bubbles (Chat Heads) at Bottom-Right Corner */}
      <div
        style={{
          position: 'fixed',
          bottom: 18,
          right: 18,
          zIndex: 88,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {bubbleHeads.map((friend) => {
          const isHovered = hoveredBubbleId === friend.id;
          return (
            <div
              key={friend.id}
              style={{ position: 'relative' }}
              onMouseEnter={() => setHoveredBubbleId(friend.id)}
              onMouseLeave={() => setHoveredBubbleId(null)}
            >
              {/* Hover Name & Activity Tooltip on the left */}
              {isHovered && (
                <div
                  style={{
                    position: 'absolute',
                    right: 60,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: '#232525',
                    color: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: 12,
                    whiteSpace: 'nowrap',
                    boxShadow: 'var(--shadow-sm)',
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{friend.fullName}</div>
                  <div style={{ fontSize: 11, color: '#c8c8c8' }}>
                    {friend.activity}
                  </div>
                </div>
              )}

              {/* Dismiss '×' button on top-left when hovered */}
              {isHovered && (
                <button
                  type="button"
                  title="Ẩn bong bóng chat"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeChat(friend.id);
                  }}
                  style={{
                    position: 'absolute',
                    top: -4,
                    left: -4,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: '#363737',
                    color: '#ffffff',
                    border: '1.5px solid #ffffff',
                    fontSize: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 3,
                  }}
                >
                  ✕
                </button>
              )}

              {/* Circular Avatar Chat Head */}
              <button
                type="button"
                onClick={() => openChatWindow(friend.id)}
                aria-label={`Mở chat với ${friend.fullName}`}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  backgroundColor: friend.avatarBg,
                  color: friend.avatarText,
                  border: '2.5px solid #ffffff',
                  boxShadow:
                    'rgba(0, 0, 0, 0.14) 0px 4px 12px, rgba(0, 0, 0, 0.08) 0px 2px 4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 15,
                  position: 'relative',
                  transform: isHovered ? 'scale(1.06)' : 'scale(1)',
                  transition: 'transform 0.15s ease',
                }}
              >
                {friend.initials}

                {/* Online Green Dot */}
                {friend.isOnline && (
                  <span
                    className="online-dot-pulse"
                    style={{
                      position: 'absolute',
                      right: 0,
                      bottom: 0,
                      width: 13,
                      height: 13,
                      borderRadius: '50%',
                      backgroundColor: '#22c55e',
                      border: '2px solid #ffffff',
                    }}
                  />
                )}

                {/* Unread Message Count Badge */}
                {friend.unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      minWidth: 20,
                      height: 20,
                      padding: '0 5px',
                      borderRadius: 9999,
                      backgroundColor: '#ff6719',
                      color: '#ffffff',
                      fontSize: 11,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #ffffff',
                    }}
                  >
                    {friend.unreadCount}
                  </span>
                )}
              </button>
            </div>
          );
        })}

        {/* Floating New Message / Restore Bubbles Pill Button (Substack Floating Button spec) */}
        <button
          type="button"
          onClick={() => {
            const firstFriend = friends[0];
            if (firstFriend) openChatWindow(firstFriend.id);
          }}
          title="Mở cửa sổ chat nhanh với đồng môn Bách Khoa"
          style={{
            backgroundColor: '#ffffff',
            color: '#363737',
            border: '1px solid #e5e5e5',
            borderRadius: 9999,
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: 600,
            boxShadow: 'var(--shadow-sm)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              display: 'inline-block',
            }}
          />
          <span>Chat SV</span>
        </button>
      </div>
    </>
  );
};
