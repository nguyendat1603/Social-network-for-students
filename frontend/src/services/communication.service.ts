import { apiRequest } from './api.client';
import {
  ChatMessageItem,
  ConversationItem,
  MessageType,
  NotificationItem,
} from '../types/communication.types';

export const NOTIFICATIONS_READ_EVENT = 'mxh-hssv:notifications-read';

export const communicationService = {
  listConversations() {
    return apiRequest<ConversationItem[]>('/communication/conversations');
  },

  startDirectConversation(payload: {
    targetUserId: string;
    initialMessage?: string;
  }) {
    return apiRequest<ConversationItem>('/communication/conversations/direct', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  listMessages(conversationId: string, cursor?: string) {
    const queryStr = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
    return apiRequest<ChatMessageItem[]>(
      `/communication/conversations/${conversationId}/messages${queryStr}`
    );
  },

  sendMessage(
    conversationId: string,
    payload: {
      messageType?: MessageType;
      content?: string;
      fileUrl?: string;
      fileName?: string;
      fileSizeBytes?: number;
    }
  ) {
    return apiRequest<ChatMessageItem>(
      `/communication/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  listNotifications() {
    return apiRequest<{ items: NotificationItem[]; unreadCount: number }>(
      '/communication/notifications'
    );
  },

  async markNotificationsRead(notificationId?: string) {
    const result = await apiRequest<{ updated: boolean }>('/communication/notifications/read', {
      method: 'PATCH',
      body: JSON.stringify(notificationId ? { notificationId } : {}),
    });
    if (result.updated) window.dispatchEvent(new Event(NOTIFICATIONS_READ_EVENT));
    return result;
  },
};
