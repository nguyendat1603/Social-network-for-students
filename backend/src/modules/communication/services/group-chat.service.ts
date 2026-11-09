import { supabase } from '../../../database';

export class GroupChatService {
  /**
   * Ensures a PROJECT_GROUP conversation exists for a study group and adds the leader.
   */
  async ensureProjectGroupConversation(params: {
    studyGroupId: string;
    groupName: string;
    leaderId: string;
  }) {
    let { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('type', 'PROJECT_GROUP')
      .eq('study_group_id', params.studyGroupId)
      .maybeSingle();

    if (!conversation) {
      const { data: created, error } = await supabase
        .from('conversations')
        .insert({
          type: 'PROJECT_GROUP',
          title: `Nhóm đồ án: ${params.groupName}`,
          study_group_id: params.studyGroupId,
          last_message_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (error || !created) {
        return null;
      }
      conversation = created;
    }

    await supabase.from('conversation_participants').upsert(
      {
        conversation_id: conversation.id,
        user_id: params.leaderId,
      },
      { onConflict: 'conversation_id,user_id' }
    );

    return conversation;
  }

  /**
   * Adds an approved member to the study group's PROJECT_GROUP chat and posts a SYSTEM greeting.
   */
  async addMemberToProjectGroupChat(params: {
    studyGroupId: string;
    userId: string;
    memberName: string;
    roleName: string;
  }) {
    const { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('type', 'PROJECT_GROUP')
      .eq('study_group_id', params.studyGroupId)
      .maybeSingle();

    if (!conversation) return null;

    await supabase.from('conversation_participants').upsert(
      {
        conversation_id: conversation.id,
        user_id: params.userId,
      },
      { onConflict: 'conversation_id,user_id' }
    );

    await supabase.from('messages').insert({
      conversation_id: conversation.id,
      sender_id: params.userId,
      message_type: 'SYSTEM',
      content: `${params.memberName} đã tham gia nhóm với vị trí ${params.roleName}.`,
    });

    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversation.id);

    return conversation;
  }
}

export const groupChatService = new GroupChatService();
