import { supabase } from '../../database';
import { AppError } from '../../common/errors/app.error';
import { SendMessageDTO } from './communication.types';

export class CommunicationRepository {
  async listMyConversations(userId: string) {
    const { data: participations, error: partError } = await supabase
      .from('conversation_participants')
      .select('conversation_id, last_read_at')
      .eq('user_id', userId);

    if (partError) {
      throw new AppError(partError.message, 500, 'DB_ERROR');
    }

    const convIds = (participations || []).map((p) => p.conversation_id);
    if (convIds.length === 0) {
      return [];
    }

    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select(
        `
        *,
        study_group:study_groups!conversations_study_group_id_fkey(id, group_name, course:courses(code, name)),
        participants:conversation_participants(
          user_id,
          last_read_at,
          user:users(id, full_name, avatar_url, is_verified_student)
        )
      `
      )
      .in('id', convIds)
      .order('last_message_at', { ascending: false });

    if (convError) {
      throw new AppError(convError.message, 500, 'DB_ERROR');
    }

    // Fetch latest message for each conversation
    const enriched = await Promise.all(
      (conversations || []).map(async (conv) => {
        const { data: latestMsg } = await supabase
          .from('messages')
          .select(
            `
            id,
            content,
            message_type,
            file_name,
            created_at,
            sender:users!messages_sender_id_fkey(id, full_name)
          `
          )
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          ...conv,
          latest_message: latestMsg || null,
        };
      })
    );

    return enriched;
  }

  async assertParticipant(conversationId: string, userId: string) {
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('conversation_id, user_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!participant) {
      throw new AppError(
        'Bạn không phải thành viên của cuộc hội thoại này',
        403,
        'FORBIDDEN_CONVERSATION'
      );
    }
  }

  async listMessages(conversationId: string, userId: string, cursor?: string, limit = 50) {
    await this.assertParticipant(conversationId, userId);

    let query = supabase
      .from('messages')
      .select(
        `
        *,
        sender:users!messages_sender_id_fkey(id, full_name, avatar_url, is_verified_student)
      `
      )
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data, error } = await query;
    if (error) {
      throw new AppError(error.message, 500, 'DB_ERROR');
    }

    await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    return data || [];
  }

  async createMessage(conversationId: string, senderId: string, dto: SendMessageDTO) {
    await this.assertParticipant(conversationId, senderId);

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        message_type: dto.messageType || 'TEXT',
        content: dto.content || null,
        file_url: dto.fileUrl || null,
        file_name: dto.fileName || null,
        file_size_bytes: dto.fileSizeBytes || null,
      })
      .select(
        `
        *,
        sender:users!messages_sender_id_fkey(id, full_name, avatar_url, is_verified_student)
      `
      )
      .single();

    if (error || !data) {
      throw new AppError(error?.message || 'Không thể gửi tin nhắn', 500, 'MESSAGE_SEND_FAILED');
    }

    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data;
  }
}

export const communicationRepository = new CommunicationRepository();
