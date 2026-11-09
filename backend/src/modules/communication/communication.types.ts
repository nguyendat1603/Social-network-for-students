export type ConversationType = 'DIRECT' | 'PROJECT_GROUP' | 'COURSE_GROUP';
export type MessageType = 'TEXT' | 'FILE' | 'SYSTEM';
export type NotificationType =
  | 'POST_REPLY'
  | 'ANSWER_ACCEPTED'
  | 'GROUP_INVITE'
  | 'APPLICATION_STATUS'
  | 'TASK_DEADLINE'
  | 'KARMA_REWARD';

export interface StartDirectConversationDTO {
  targetUserId: string;
  initialMessage?: string;
}

export interface SendMessageDTO {
  messageType?: MessageType;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSizeBytes?: number;
}

export interface DispatchNotificationPayload {
  recipientId: string;
  actorId?: string | null;
  type: NotificationType;
  title: string;
  body: string;
  referenceUrl?: string | null;
}
