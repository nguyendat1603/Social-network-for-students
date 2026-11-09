export type ConversationType = 'DIRECT' | 'PROJECT_GROUP' | 'COURSE_GROUP';
export type MessageType = 'TEXT' | 'FILE' | 'SYSTEM';
export type NotificationType =
  | 'POST_REPLY'
  | 'ANSWER_ACCEPTED'
  | 'GROUP_INVITE'
  | 'APPLICATION_STATUS'
  | 'TASK_DEADLINE'
  | 'KARMA_REWARD';

export interface ConversationParticipant {
  user_id: string;
  last_read_at?: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
    is_verified_student?: boolean;
  };
}

export interface ConversationItem {
  id: string;
  type: ConversationType;
  title?: string | null;
  study_group_id?: string | null;
  course_id?: number | null;
  direct_pair_key?: string | null;
  last_message_at: string;
  created_at: string;
  study_group?: {
    id: string;
    group_name: string;
    course?: {
      code: string;
      name: string;
    };
  } | null;
  participants: ConversationParticipant[];
  latest_message?: {
    id: string;
    content?: string | null;
    message_type: MessageType;
    file_name?: string | null;
    created_at: string;
    sender?: {
      id: string;
      full_name: string;
    };
  } | null;
}

export interface ChatMessageItem {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_type: MessageType;
  content?: string | null;
  file_url?: string | null;
  file_name?: string | null;
  file_size_bytes?: number | null;
  created_at: string;
  sender?: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
    is_verified_student?: boolean;
  };
}

export interface NotificationItem {
  id: string;
  recipient_id: string;
  actor_id?: string | null;
  type: NotificationType;
  title: string;
  body: string;
  reference_url?: string | null;
  is_read: boolean;
  created_at: string;
  actor?: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
  } | null;
}
