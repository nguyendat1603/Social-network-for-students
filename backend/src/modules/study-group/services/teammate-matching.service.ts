import { supabase } from '../../../database';
import { AppError } from '../../../common/errors/app.error';
import {
  ApplyToStudyGroupDTO,
  CreateStudyGroupDTO,
  ReviewGroupApplicationDTO,
} from '../study-group.types';
import { groupWorkspaceService } from './group-workspace.service';
import { groupChatService } from '../../communication/services/group-chat.service';
import { realtimeNotificationService } from '../../communication/services/realtime-notification.service';

export class TeammateMatchingService {
  async createStudyGroup(leaderId: string, dto: CreateStudyGroupDTO) {
    const { data: group, error: groupError } = await supabase
      .from('study_groups')
      .insert({
        course_id: dto.courseId,
        semester: dto.semester,
        group_name: dto.groupName,
        project_topic: dto.projectTopic || null,
        target_grade: dto.targetGrade,
        max_members: dto.maxMembers,
        is_recruiting: true,
        leader_id: leaderId,
      })
      .select('*')
      .single();

    if (groupError || !group) {
      throw new AppError(
        groupError?.message || 'Không thể tạo nhóm đồ án',
        500,
        'STUDY_GROUP_CREATE_FAILED'
      );
    }

    // Add recruitment slots
    const slotsPayload = dto.slots.map((slot) => ({
      group_id: group.id,
      role_name: slot.roleName,
      required_skills: slot.requiredSkills,
      quantity_needed: slot.quantityNeeded,
      quantity_filled: 0,
    }));

    await supabase.from('recruitment_slots').insert(slotsPayload);

    // Add creator as LEAD in group_members
    await supabase.from('group_members').insert({
      group_id: group.id,
      user_id: leaderId,
      member_role: 'LEAD',
      assigned_role: 'Team Leader',
    });

    // Auto-create PROJECT_GROUP conversation in Module 7
    await groupChatService.ensureProjectGroupConversation({
      studyGroupId: group.id,
      groupName: group.group_name,
      leaderId,
    });

    return group;
  }

  async applyToStudyGroup(groupId: string, applicantId: string, dto: ApplyToStudyGroupDTO) {
    const { data: group } = await supabase
      .from('study_groups')
      .select('id, group_name, is_recruiting, leader_id')
      .eq('id', groupId)
      .maybeSingle();

    if (!group) {
      throw new AppError('Không tìm thấy nhóm đồ án', 404, 'STUDY_GROUP_NOT_FOUND');
    }

    if (!group.is_recruiting) {
      throw new AppError('Nhóm đồ án này đã đủ thành viên và ngừng tuyển', 400, 'GROUP_CLOSED');
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId)
      .eq('user_id', applicantId)
      .maybeSingle();

    if (existingMember) {
      throw new AppError('Bạn đã là thành viên của nhóm đồ án này', 400, 'ALREADY_MEMBER');
    }

    // Check slot belongs to group and has capacity
    const { data: slot } = await supabase
      .from('recruitment_slots')
      .select('*')
      .eq('id', dto.slotId)
      .eq('group_id', groupId)
      .maybeSingle();

    if (!slot) {
      throw new AppError('Vị trí ứng tuyển không hợp lệ', 404, 'SLOT_NOT_FOUND');
    }

    if (slot.quantity_filled >= slot.quantity_needed) {
      throw new AppError('Vị trí này đã tuyển đủ số lượng', 400, 'SLOT_FULL');
    }

    const { data: application, error } = await supabase
      .from('group_applications')
      .upsert(
        {
          group_id: groupId,
          slot_id: dto.slotId,
          applicant_id: applicantId,
          cover_letter: dto.coverLetter,
          portfolio_url: dto.portfolioUrl || null,
          status: 'PENDING',
        },
        { onConflict: 'group_id,applicant_id' }
      )
      .select('*')
      .single();

    if (error || !application) {
      throw new AppError(error?.message || 'Không thể gửi đơn ứng tuyển', 500, 'APPLY_FAILED');
    }

    await realtimeNotificationService.dispatchNotification({
      recipientId: group.leader_id,
      actorId: applicantId,
      type: 'GROUP_INVITE',
      title: 'Đơn ứng tuyển nhóm đồ án mới',
      body: `Có ứng viên mới đăng ký vị trí ${slot.role_name} trong nhóm "${group.group_name}".`,
      referenceUrl: `/study-groups/${groupId}/workspace`,
    });

    return application;
  }

  async reviewApplication(
    groupId: string,
    applicationId: string,
    leaderId: string,
    dto: ReviewGroupApplicationDTO
  ) {
    await groupWorkspaceService.assertGroupLead(groupId, leaderId);

    const { data: application } = await supabase
      .from('group_applications')
      .select(
        `
        *,
        slot:recruitment_slots(*),
        applicant:users!group_applications_applicant_id_fkey(id, full_name),
        group:study_groups(id, group_name, max_members)
      `
      )
      .eq('id', applicationId)
      .eq('group_id', groupId)
      .maybeSingle();

    if (!application) {
      throw new AppError('Không tìm thấy đơn ứng tuyển', 404, 'APPLICATION_NOT_FOUND');
    }

    if (application.status !== 'PENDING') {
      throw new AppError('Đơn ứng tuyển này đã được xử lý trước đó', 400, 'ALREADY_REVIEWED');
    }

    const { data: updatedApp, error: updateError } = await supabase
      .from('group_applications')
      .update({
        status: dto.status,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .select('*')
      .single();

    if (updateError) {
      throw new AppError(updateError.message, 500, 'APPLICATION_UPDATE_FAILED');
    }

    if (dto.status === 'APPROVED') {
      const roleName = application.slot?.role_name || 'Member';

      // 1. Add to group_members
      await supabase.from('group_members').upsert(
        {
          group_id: groupId,
          user_id: application.applicant_id,
          member_role: 'MEMBER',
          assigned_role: roleName,
        },
        { onConflict: 'group_id,user_id' }
      );

      // 2. Increment slot quantity_filled
      const newFilled = (application.slot?.quantity_filled || 0) + 1;
      await supabase
        .from('recruitment_slots')
        .update({ quantity_filled: newFilled })
        .eq('id', application.slot_id);

      // 3. Check if group reached max_members or all slots are full
      const [{ count: memberCount }, { data: allSlots }] = await Promise.all([
        supabase
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', groupId),
        supabase.from('recruitment_slots').select('*').eq('group_id', groupId),
      ]);

      const allSlotsFull = (allSlots || []).every(
        (s) => s.quantity_filled >= s.quantity_needed
      );
      const maxReached = (memberCount || 0) >= (application.group?.max_members || 4);

      if (allSlotsFull || maxReached) {
        await supabase
          .from('study_groups')
          .update({ is_recruiting: false })
          .eq('id', groupId);
      }

      // 4. Add member to PROJECT_GROUP chat & send notification
      await groupChatService.addMemberToProjectGroupChat({
        studyGroupId: groupId,
        userId: application.applicant_id,
        memberName: application.applicant?.full_name || 'Thành viên mới',
        roleName,
      });

      await realtimeNotificationService.dispatchNotification({
        recipientId: application.applicant_id,
        actorId: leaderId,
        type: 'APPLICATION_STATUS',
        title: 'Đơn ứng tuyển nhóm đồ án đã được duyệt!',
        body: `Chúc mừng! Bạn đã trở thành ${roleName} của nhóm "${application.group?.group_name}".`,
        referenceUrl: `/study-groups/${groupId}/workspace`,
      });
    } else {
      await realtimeNotificationService.dispatchNotification({
        recipientId: application.applicant_id,
        actorId: leaderId,
        type: 'APPLICATION_STATUS',
        title: 'Cập nhật kết quả ứng tuyển nhóm đồ án',
        body: `Đơn ứng tuyển vào nhóm "${application.group?.group_name}" chưa phù hợp lần này.`,
        referenceUrl: `/study-groups`,
      });
    }

    return updatedApp;
  }
}

export const teammateMatchingService = new TeammateMatchingService();
