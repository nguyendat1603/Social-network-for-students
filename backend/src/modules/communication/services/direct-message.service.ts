import { supabase } from '../../../database';
import { AppError } from '../../../common/errors/app.error';

export class DirectMessageService {
  /**
   * Computes deterministic pair key `min(userA, userB):max(userA, userB)`
   * to guarantee strictly 1 DIRECT conversation per student pair.
   */
  getPairKey(userA: string, userB: string): string {
    return [userA, userB].sort().join(':');
  }

  async getOrCreateDirectConversation(
    currentUserId: string,
    targetUserId: string,
    initialMessage?: string
  ) {
    if (currentUserId === targetUserId) {
      throw new AppError('Không thể tự nhắn tin cho chính mình', 400, 'SELF_MESSAGE_NOT_ALLOWED');
    }

    // Verify target user exists
    const { data: targetUser } = await supabase
      .from('users')
      .select('id, full_name, avatar_url, is_verified_student')
      .eq('id', targetUserId)
      .maybeSingle();

    if (!targetUser) {
      throw new AppError('Không tìm thấy sinh viên nhận tin nhắn', 404, 'USER_NOT_FOUND');
    }

    const pairKey = this.getPairKey(currentUserId, targetUserId);

    let { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('type', 'DIRECT')
      .eq('direct_pair_key', pairKey)
      .maybeSingle();

    if (!conversation) {
      const { data: created, error: createError } = await supabase
        .from('conversations')
        .insert({
          type: 'DIRECT',
          direct_pair_key: pairKey,
          last_message_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (createError || !created) {
        throw new AppError(
          createError?.message || 'Không thể khởi tạo cuộc trò chuyện 1-1',
          500,
          'CONVERSATION_CREATE_FAILED'
        );
      }
      conversation = created;

      await supabase.from('conversation_participants').upsert(
        [
          { conversation_id: conversation.id, user_id: currentUserId },
          { conversation_id: conversation.id, user_id: targetUserId },
        ],
        { onConflict: 'conversation_id,user_id' }
      );
    }

    if (initialMessage) {
      await supabase.from('messages').insert({
        conversation_id: conversation.id,
        sender_id: currentUserId,
        message_type: 'TEXT',
        content: initialMessage,
      });

      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversation.id);
    }

    return conversation;
  }
}

export const directMessageService = new DirectMessageService();
