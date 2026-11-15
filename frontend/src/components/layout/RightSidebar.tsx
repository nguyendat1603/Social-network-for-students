import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../config/routes.config';
import { useChatBubblesStore } from '../../store/chatBubbles.store';

const UP_NEXT_ITEMS = [
  {
    id: 'up-1',
    publication: 'SoICT · #IT3080 Mạng máy tính',
    headline: 'Tổng hợp 50 câu hỏi vấn đáp đồ án Socket TCP/UDP & Wireshark kỳ 2024.1',
    meta: '6 phút đọc · 142 lượt thích · 38 bình luận',
    thumbCode: 'IT3080',
    thumbBg: '#f5f5f5',
    to: `${APP_ROUTES.COURSE_FEED}?code=IT3080`,
  },
  {
    id: 'up-2',
    publication: 'Viện Toán Ứng dụng · #MI1121',
    headline: 'Mẹo đổi biến tọa độ cầu và trụ trong tích phân bội ba Giải tích 2',
    meta: '4 phút đọc · 98 lượt thích · 24 bình luận',
    thumbCode: '∫dV',
    thumbBg: '#fff7f3',
    to: `${APP_ROUTES.COURSE_FEED}?code=MI1121`,
  },
  {
    id: 'up-3',
    publication: 'SEEE · Trường Điện - Điện tử',
    headline: 'Kinh nghiệm chọn hướng đồ án tốt nghiệp Vi mạch bán dẫn & Nhúng',
    meta: '8 phút đọc · 76 lượt thích · 19 bình luận',
    thumbCode: 'IC/SoC',
    thumbBg: '#f5f5f5',
    to: APP_ROUTES.DEPARTMENT_FEED,
  },
];

export const RightSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { friends, openChatWindow } = useChatBubblesStore();
  const [searchText, setSearchText] = useState('');

  const onlineCount = friends.filter((f) => f.isOnline).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchText.trim();
    if (!q) return;
    if (q.startsWith('#')) {
      navigate(
        `${APP_ROUTES.COURSE_FEED}?code=${encodeURIComponent(q.slice(1))}`
      );
    } else {
      navigate(`${APP_ROUTES.CAMPUS_FEED}?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <aside
      className="substack-right-col"
      style={{
        width: 310,
        flexShrink: 0,
        position: 'sticky',
        top: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
      }}
    >
      {/* 1. Search Input (Substack Spec: Full-width pill, #ffffff bg, 1px solid #b6b6b6, 9999px radius) */}
      <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
        <span
          style={{
            position: 'absolute',
            left: 13,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-stone)',
            display: 'inline-flex',
            pointerEvents: 'none',
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>

        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Tìm trên BáchKhoa (#IT3080, Giải tích...)"
          aria-label="Tìm kiếm bài viết và học phần"
          style={{
            width: '100%',
            backgroundColor: '#ffffff',
            border: '1px solid #b6b6b6',
            borderRadius: 9999,
            padding: '8px 14px 8px 36px',
            fontSize: 13,
            color: '#363737',
          }}
        />
      </form>

      {/* 2. Bạn bè / Đồng môn đang Online (Click to open Facebook Chat Bubble/Box!) */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #eeeeee',
          borderRadius: 12,
          padding: '18px 16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-cahuenga)',
              fontSize: 21,
              fontWeight: 500,
              color: '#363737',
              lineHeight: 1.24,
            }}
          >
            Bạn bè đang Online
          </h3>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 12,
              fontWeight: 500,
              color: '#15803d',
              backgroundColor: '#dcfce7',
              padding: '2px 9px',
              borderRadius: 9999,
            }}
          >
            <span
              className="online-dot-pulse"
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: '#22c55e',
              }}
            />
            {onlineCount} online
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {friends.map((friend) => (
            <button
              key={friend.id}
              type="button"
              onClick={() => openChatWindow(friend.id)}
              title={`Nhắn tin ngay với ${friend.fullName}`}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                padding: '7px 8px',
                borderRadius: 8,
                border: 'none',
                backgroundColor:
                  friend.windowState === 'OPEN' ? '#fff7f3' : 'transparent',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (friend.windowState !== 'OPEN') {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                }
              }}
              onMouseLeave={(e) => {
                if (friend.windowState !== 'OPEN') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  minWidth: 0,
                  flex: 1,
                }}
              >
                {/* Avatar + Green Online Indicator */}
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
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {friend.initials}
                  </div>
                  <span
                    style={{
                      position: 'absolute',
                      right: -1,
                      bottom: -1,
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: friend.isOnline ? '#22c55e' : '#b6b6b6',
                      border: '2px solid #ffffff',
                    }}
                  />
                </div>

                {/* Name + Study Activity */}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: '#363737',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {friend.fullName}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: '#777777',
                        flexShrink: 0,
                      }}
                    >
                      · {friend.cohort}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#777777',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {friend.activity}
                  </div>
                </div>
              </div>

              {/* Right Unread Pill or Chat Icon */}
              {friend.unreadCount > 0 ? (
                <span
                  style={{
                    minWidth: 18,
                    height: 18,
                    padding: '0 5px',
                    borderRadius: 9999,
                    backgroundColor: '#ff6719',
                    color: '#ffffff',
                    fontSize: 11,
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {friend.unreadCount}
                </span>
              ) : (
                <span
                  style={{
                    color: '#777777',
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  💬
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Up Next Feed Items (Substack Spec: 64px thumbnail left, text block right) */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-cahuenga)',
              fontSize: 22,
              fontWeight: 500,
              color: '#363737',
              lineHeight: 1.25,
            }}
          >
            Đáng đọc tuần này
          </h3>
          <Link
            to={APP_ROUTES.RESOURCE_HUB}
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: '#ff6719',
            }}
          >
            Xem tất cả
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {UP_NEXT_ITEMS.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                textDecoration: 'none',
              }}
            >
              {/* 64px rounded 8px thumbnail */}
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 8,
                  backgroundColor: item.thumbBg,
                  border: '1px solid #eeeeee',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontFamily: 'var(--font-jetbrains-mono)',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#363737',
                }}
              >
                <span>{item.thumbCode}</span>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 500,
                    color: '#ff6719',
                    marginTop: 2,
                  }}
                >
                  HUST
                </span>
              </div>

              {/* Right Text Block */}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: '#363737',
                    marginBottom: 2,
                  }}
                >
                  {item.publication}
                </div>
                <div
                  style={{
                    fontSize: 14.5,
                    fontWeight: 400,
                    color: '#363737',
                    lineHeight: 1.35,
                    marginBottom: 4,
                  }}
                >
                  {item.headline}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: '#777777',
                  }}
                >
                  {item.meta}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 4. Right Sidebar Recommendation / Promo Card (Substack Spec) */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #eeeeee',
          borderRadius: 12,
          padding: 20,
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-cahuenga)',
            fontSize: 22,
            fontWeight: 500,
            color: '#363737',
            lineHeight: 1.25,
            marginBottom: 8,
          }}
        >
          Ghép nhóm Đồ án &amp; BTL kỳ 2025.2
        </h3>
        <p
          style={{
            fontSize: 14,
            color: '#777777',
            lineHeight: 1.5,
            marginBottom: 16,
          }}
        >
          Kết nối đồng môn cùng lớp học phần, quản lý tiến độ bằng bảng Kanban và chia sẻ tài liệu LaTeX nội bộ.
        </p>
        <Link
          to={APP_ROUTES.STUDY_GROUPS}
          className="substack-btn-primary"
          style={{
            width: '100%',
            textDecoration: 'none',
          }}
        >
          Tìm nhóm Đồ án ngay
        </Link>
      </div>
    </aside>
  );
};
