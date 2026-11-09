/**
 * WebSocket / Realtime Chat Gateway Registry.
 * Synchronizes room naming conventions (`conversation:${conversationId}` and `user:${userId}`)
 * across Socket.IO and Supabase Realtime channels.
 */
export class ChatGateway {
  getConversationRoom(conversationId: string): string {
    return `conversation:${conversationId}`;
  }

  getUserPersonalRoom(userId: string): string {
    return `user:${userId}`;
  }
}

export const chatGateway = new ChatGateway();
