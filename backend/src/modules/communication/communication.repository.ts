import { supabase } from '../../database';
import { AppError } from '../../common/errors/app.error';
import { normalizeUserWithProfile } from '../../common/utils/profile.util';
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
        study_group:study_groups!conversations_study_group_id_fkey(id, name, course:courses(code, name)),
        participants:conversation_participants(
          user_id,
          last_read_at,
          user:users(
            id,
            is_verified_student,
            academic_profile:academic_profiles(full_name, avatar_url, student_code)
          )
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
            attachment_url,
            attachment_name,
            created_at,
            sender:users!messages_sender_id_fkey(
              id,
              academic_profile:academic_profiles(full_name, avatar_url, student_code)
            )
          `
          )
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const normalizedParticipants = (conv.participants || []).map(
          (p: { user_id: string; last_read_at?: string | null; user?: any }) => ({
            ...p,
            user: normalizeUserWithProfile(p.user),
          })
        );

        const normalizedStudyGroup = conv.study_group
          ? {
              ...conv.study_group,
              group_name: conv.study_group.name ?? conv.study_group.group_name,
            }
          : null;

        const normalizedLatestMsg = latestMsg
          ? {
              ...latestMsg,
              file_url: latestMsg.attachment_url ?? null,
              file_name: latestMsg.attachment_name ?? null,
              sender: normalizeUserWithProfile(latestMsg.sender),
            }
          : null;

        return {
          ...conv,
          study_group: normalizedStudyGroup,
          participants: normalizedParticipants,
          latest_message: normalizedLatestMsg,
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
        sender:users!messages_sender_id_fkey(
          id,
          is_verified_student,
          academic_profile:academic_profiles(full_name, avatar_url, student_code)
        )
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

    return (data || []).map((m) => ({
      ...m,
      file_url: m.attachment_url ?? m.file_url ?? null,
      file_name: m.attachment_name ?? m.file_name ?? null,
      sender: normalizeUserWithProfile(m.sender),
    }));
  }

  async createMessage(conversationId: string, senderId: string, dto: SendMessageDTO) {
    await this.assertParticipant(conversationId, senderId);

    const contentText =
      dto.content && dto.content.trim().length > 0
        ? dto.content.trim()
        : dto.fileName || 'Đính kèm tệp';

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        message_type: dto.messageType || (dto.fileUrl ? 'FILE' : 'TEXT'),
        content: contentText,
        attachment_url: dto.fileUrl || null,
        attachment_name: dto.fileName || null,
      })
      .select(
        `
        *,
        sender:users!messages_sender_id_fkey(
          id,
          is_verified_student,
          academic_profile:academic_profiles(full_name, avatar_url, student_code)
        )
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

    return {
      ...data,
      file_url: data.attachment_url ?? dto.fileUrl ?? null,
      file_name: data.attachment_name ?? dto.fileName ?? null,
      file_size_bytes: dto.fileSizeBytes ?? null,
      sender: normalizeUserWithProfile(data.sender),
    };
  }
}

export const communicationRepository = new CommunicationRepository();
