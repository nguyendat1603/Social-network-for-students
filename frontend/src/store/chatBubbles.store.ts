import { create } from 'zustand';

export interface QuickChatMessage {
  id: string;
  sender: 'FRIEND' | 'ME';
  text: string;
  time: string;
}

export interface OnlineHustFriend {
  id: string;
  fullName: string;
  initials: string;
  avatarBg: string;
  avatarText: string;
  cohort: string;
  faculty: string;
  studentCode: string;
  isOnline: boolean;
  lastActiveText: string;
  activity: string;
  unreadCount: number;
  windowState: 'CLOSED' | 'BUBBLE' | 'OPEN';
  messages: QuickChatMessage[];
}

interface ChatBubblesState {
  friends: OnlineHustFriend[];
  typingFriendIds: string[];
  openChatWindow: (friendId: string) => void;
  minimizeToBubble: (friendId: string) => void;
  closeChat: (friendId: string) => void;
  toggleBubble: (friendId: string) => void;
  sendMessage: (friendId: string, text: string) => void;
}

const INITIAL_FRIENDS: OnlineHustFriend[] = [
  {
    id: 'hust-friend-1',
    fullName: 'Trần Minh Hiếu',
    initials: 'MH',
    avatarBg: '#ffedd5',
    avatarText: '#c2410c',
    cohort: 'K67',
    faculty: 'SoICT · CNTT Việt Nhật',
    studentCode: '20225142',
    isOnline: true,
    lastActiveText: 'Đang hoạt động',
    activity: 'Đang giải đề Giải tích 2 #MI1121',
    unreadCount: 2,
    windowState: 'BUBBLE',
    messages: [
      {
        id: 'm-101',
        sender: 'FRIEND',
        text: 'Ê cậu ơi, câu 4 đề cuối kỳ Giải tích 2 kỳ 2024.1 tính tích phân mặt kiểu gì thế?',
        time: '21:40',
      },
      {
        id: 'm-102',
        sender: 'FRIEND',
        text: 'Mình áp dụng công thức Ostrogradsky-Gauss mà đang vướng cận z 😅',
        time: '21:41',
      },
    ],
  },
  {
    id: 'hust-friend-2',
    fullName: 'Nguyễn Phương Linh',
    initials: 'PL',
    avatarBg: '#e0f2fe',
    avatarText: '#0369a1',
    cohort: 'K68',
    faculty: 'SoICT · Khoa học Dữ liệu & AI',
    studentCode: '20235088',
    isOnline: true,
    lastActiveText: 'Đang hoạt động',
    activity: 'Tìm đồng đội BTL Mạng máy tính #IT3080',
    unreadCount: 1,
    windowState: 'BUBBLE',
    messages: [
      {
        id: 'm-201',
        sender: 'FRIEND',
        text: 'Chào bạn! Nhóm mình môn Mạng máy tính #IT3080 đang thiếu 1 bạn làm phần Socket TCP bằng C/Python. Cậu có hứng thú ghép nhóm không?',
        time: '21:52',
      },
    ],
  },
  {
    id: 'hust-friend-3',
    fullName: 'Lê Hoàng Bách',
    initials: 'HB',
    avatarBg: '#dcfce7',
    avatarText: '#15803d',
    cohort: 'K66',
    faculty: 'SEEE · Tự động hóa',
    studentCode: '20213810',
    isOnline: true,
    lastActiveText: 'Đang hoạt động',
    activity: 'Thư viện Tạ Quang Bửu — Tầng 4',
    unreadCount: 0,
    windowState: 'BUBBLE',
    messages: [
      {
        id: 'm-301',
        sender: 'ME',
        text: 'Bách ơi chiều nay có ngồi trên Tạ Quang Bửu không?',
        time: '19:15',
      },
      {
        id: 'm-302',
        sender: 'FRIEND',
        text: 'Mình đang ngồi bàn gần cửa sổ tầng 4 nhé, mang laptop lên đây chiến đồ án luôn!',
        time: '19:18',
      },
    ],
  },
  {
    id: 'hust-friend-4',
    fullName: 'Phạm Vũ Khánh Duy',
    initials: 'KD',
    avatarBg: '#f3e8ff',
    avatarText: '#6d28d9',
    cohort: 'K67',
    faculty: 'SME · Cơ điện tử',
    studentCode: '20226109',
    isOnline: true,
    lastActiveText: 'Đang hoạt động',
    activity: 'Đang code mạch STM32 tại nhà C7',
    unreadCount: 0,
    windowState: 'CLOSED',
    messages: [
      {
        id: 'm-401',
        sender: 'FRIEND',
        text: 'Cậu còn giữ slide môn Kỹ thuật Vi xử lý của thầy Nam không cho mình xin với!',
        time: '18:30',
      },
    ],
  },
  {
    id: 'hust-friend-5',
    fullName: 'Đỗ Ngọc Mai Anh',
    initials: 'MA',
    avatarBg: '#fce7f3',
    avatarText: '#be185d',
    cohort: 'K68',
    faculty: 'SAMI · Toán Tin',
    studentCode: '20237015',
    isOnline: true,
    lastActiveText: 'Đang hoạt động',
    activity: 'Đang xem tài liệu Xác suất thống kê #MI2020',
    unreadCount: 0,
    windowState: 'CLOSED',
    messages: [
      {
        id: 'm-501',
        sender: 'FRIEND',
        text: 'Cảm ơn bài giải LaTeX môn Xác suất thống kê của cậu trên Bảng tin nhé, dễ hiểu cực kỳ!',
        time: '20:05',
      },
    ],
  },
  {
    id: 'hust-friend-6',
    fullName: 'Vũ Quốc Khánh',
    initials: 'QK',
    avatarBg: '#f1f5f9',
    avatarText: '#334155',
    cohort: 'K66',
    faculty: 'SoICT · An toàn thông tin',
    studentCode: '20215401',
    isOnline: false,
    lastActiveText: 'Hoạt động 6 phút trước',
    activity: 'Vừa tải lên đề cương Hệ điều hành #IT3070',
    unreadCount: 0,
    windowState: 'CLOSED',
    messages: [
      {
        id: 'm-601',
        sender: 'FRIEND',
        text: 'Mình vừa up full bộ đề cương Hệ điều hành vào Kho Tài liệu Mở rồi đấy.',
        time: '21:10',
      },
    ],
  },
];

const AUTO_REPLIES: Record<string, string[]> = {
  'hust-friend-1': [
    'À chuẩn luôn! Đổi sang tọa độ trụ r, φ, z là triệt tiêu hết phần r^3. Cảm ơn đồng môn nhé! 🔥',
    'Tối nay 9h lên thư viện số giải nốt đề kỳ 2023.2 không cậu?',
  ],
  'hust-friend-2': [
    'Tuyệt vời quá! Để mình gửi link nhóm Workspace #IT3080 qua cho cậu luôn nhé 🚀',
    'Nhóm mình đặt mục tiêu điểm A+ học phần này, có cậu vào gánh phần Backend/Socket là yên tâm rồi!',
  ],
  'hust-friend-3': [
    'Ok chốt nhé! Khi nào tới sảnh Tạ Quang Bửu thì nháy mình xuống đón.',
    'Nhớ mang theo ổ cắm nối dài nhé, trên tầng 4 hôm nay đông sinh viên ôn thi lắm!',
  ],
};

export const useChatBubblesStore = create<ChatBubblesState>((set, get) => ({
  friends: INITIAL_FRIENDS,
  typingFriendIds: [],

  openChatWindow: (friendId) => {
    set((state) => {
      // Limit maximum 2 open windows simultaneously so screen stays clean
      const currentlyOpen = state.friends.filter(
        (f) => f.windowState === 'OPEN' && f.id !== friendId
      );
      const demoteId = currentlyOpen.length >= 2 ? currentlyOpen[0].id : null;

      return {
        friends: state.friends.map((f) => {
          if (f.id === friendId) {
            return { ...f, windowState: 'OPEN', unreadCount: 0 };
          }
          if (demoteId && f.id === demoteId) {
            return { ...f, windowState: 'BUBBLE' };
          }
          return f;
        }),
      };
    });
  },

  minimizeToBubble: (friendId) => {
    set((state) => ({
      friends: state.friends.map((f) =>
        f.id === friendId ? { ...f, windowState: 'BUBBLE' } : f
      ),
    }));
  },

  closeChat: (friendId) => {
    set((state) => ({
      friends: state.friends.map((f) =>
        f.id === friendId ? { ...f, windowState: 'CLOSED' } : f
      ),
    }));
  },

  toggleBubble: (friendId) => {
    const target = get().friends.find((f) => f.id === friendId);
    if (!target) return;
    if (target.windowState === 'OPEN') {
      get().minimizeToBubble(friendId);
    } else {
      get().openChatWindow(friendId);
    }
  },

  sendMessage: (friendId, text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const nowTime = new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    set((state) => ({
      friends: state.friends.map((f) =>
        f.id === friendId
          ? {
              ...f,
              unreadCount: 0,
              messages: [
                ...f.messages,
                {
                  id: `msg-${Date.now()}`,
                  sender: 'ME',
                  text: trimmed,
                  time: nowTime,
                },
              ],
            }
          : f
      ),
      typingFriendIds: [...state.typingFriendIds, friendId],
    }));

    setTimeout(() => {
      const replies = AUTO_REPLIES[friendId] || [
        'Ok đồng môn ơi! Mình vừa nhận được tin nhắn, lát tan ca kíp 4 ở giảng đường D9 mình phản hồi chi tiết nhé!',
      ];
      const replyText = replies[Math.floor(Math.random() * replies.length)];
      const replyTime = new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });

      set((state) => ({
        typingFriendIds: state.typingFriendIds.filter((id) => id !== friendId),
        friends: state.friends.map((f) =>
          f.id === friendId
            ? {
                ...f,
                messages: [
                  ...f.messages,
                  {
                    id: `msg-reply-${Date.now()}`,
                    sender: 'FRIEND',
                    text: replyText,
                    time: replyTime,
                  },
                ],
              }
            : f
        ),
      }));
    }, 1000);
  },
}));
