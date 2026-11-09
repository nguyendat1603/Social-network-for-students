import { supabase } from '../../../database';
import { AppError } from '../../../common/errors/app.error';

export class GroupWorkspaceService {
  async assertGroupMember(groupId: string, userId: string) {
    const { data: member } = await supabase
      .from('group_members')
      .select('group_id, user_id, member_role, assigned_role, joined_at')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!member) {
      throw new AppError(
        'Chỉ thành viên chính thức của nhóm đồ án mới được truy cập không gian làm việc này',
        403,
        'FORBIDDEN_WORKSPACE'
      );
    }

    return member;
  }

  async assertGroupLead(groupId: string, userId: string) {
    const member = await this.assertGroupMember(groupId, userId);
    if (member.member_role !== 'LEAD') {
      throw new AppError(
        'Chỉ Nhóm trưởng (LEAD) mới có quyền thực hiện thao tác này',
        403,
        'FORBIDDEN_NOT_LEAD'
      );
    }
    return member;
  }

  async getWorkspaceData(groupId: string, userId: string) {
    const myMembership = await this.assertGroupMember(groupId, userId);

    const [groupRes, membersRes, slotsRes, tasksRes, docsRes, convRes] = await Promise.all([
      supabase
        .from('study_groups')
        .select(
          `
          *,
          course:courses(id, code, name),
          leader:users!study_groups_leader_id_fkey(id, full_name, avatar_url, karma_points)
        `
        )
        .eq('id', groupId)
        .single(),
      supabase
        .from('group_members')
        .select(
          `
          *,
          user:users(
            id,
            full_name,
            avatar_url,
            karma_points,
            is_verified_student,
            academic_profile:academic_profiles(student_id, cohort, major, bio),
            skills:user_skills(id, skill_name, proficiency_level)
          )
        `
        )
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true }),
      supabase
        .from('recruitment_slots')
        .select('*')
        .eq('group_id', groupId)
        .order('role_name', { ascending: true }),
      supabase
        .from('kanban_tasks')
        .select(
          `
          *,
          assignee:users!kanban_tasks_assignee_id_fkey(id, full_name, avatar_url)
        `
        )
        .eq('group_id', groupId)
        .order('position_order', { ascending: true })
        .order('created_at', { ascending: true }),
      supabase
        .from('group_documents')
        .select(
          `
          *,
          uploader:users!group_documents_uploaded_by_fkey(id, full_name, avatar_url)
        `
        )
        .eq('group_id', groupId)
        .order('created_at', { ascending: false }),
      supabase
        .from('conversations')
        .select('id, title')
        .eq('type', 'PROJECT_GROUP')
        .eq('study_group_id', groupId)
        .maybeSingle(),
    ]);

    if (groupRes.error || !groupRes.data) {
      throw new AppError('Không tìm thấy nhóm đồ án', 404, 'STUDY_GROUP_NOT_FOUND');
    }

    let applications: unknown[] = [];
    if (myMembership.member_role === 'LEAD') {
      const { data: apps } = await supabase
        .from('group_applications')
        .select(
          `
          *,
          slot:recruitment_slots(id, role_name, required_skills, quantity_needed, quantity_filled),
          applicant:users!group_applications_applicant_id_fkey(
            id,
            full_name,
            avatar_url,
            karma_points,
            is_verified_student,
            academic_profile:academic_profiles(student_id, cohort, major, career_goal),
            skills:user_skills(id, skill_name, proficiency_level)
          )
        `
        )
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });
      applications = apps || [];
    }

    return {
      group: groupRes.data,
      myMembership,
      members: membersRes.data || [],
      slots: slotsRes.data || [],
      tasks: tasksRes.data || [],
      documents: docsRes.data || [],
      applications,
      conversationId: convRes.data?.id || null,
    };
  }
}

export const groupWorkspaceService = new GroupWorkspaceService();
