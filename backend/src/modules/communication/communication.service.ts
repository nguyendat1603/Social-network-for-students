import { communicationRepository } from './communication.repository';
import { directMessageService } from './services/direct-message.service';
import { realtimeNotificationService } from './services/realtime-notification.service';
import { SendMessageDTO, StartDirectConversationDTO } from './communication.types';

export class CommunicationService {
  async listMyConversations(userId: string) {
    return communicationRepository.listMyConversations(userId);
  }

  async startDirectConversation(userId: string, dto: StartDirectConversationDTO) {
    return directMessageService.getOrCreateDirectConversation(
      userId,
      dto.targetUserId,
      dto.initialMessage
    );
  }

  async listMessages(conversationId: string, userId: string, cursor?: string) {
    return communicationRepository.listMessages(conversationId, userId, cursor);
  }

  async sendMessage(conversationId: string, userId: string, dto: SendMessageDTO) {
    return communicationRepository.createMessage(conversationId, userId, dto);
  }

  async listNotifications(userId: string) {
    return realtimeNotificationService.listNotifications(userId);
  }

  async markNotificationsRead(userId: string, notificationId?: string) {
    return realtimeNotificationService.markAsRead(userId, notificationId);
  }
}

export const communicationService = new CommunicationService();
