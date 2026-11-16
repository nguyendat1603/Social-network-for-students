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

export const useChatBubblesStore = create<ChatBubblesState>((set, get) => ({
  friends: [],
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

  sendMessage: () => { throw new Error('Use the API-backed messenger to send messages.'); },
}));
