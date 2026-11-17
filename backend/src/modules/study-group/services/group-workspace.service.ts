import { supabase } from '../../../database';
import { AppError } from '../../../common/errors/app.error';
import { normalizeUserWithProfile } from '../../../common/utils/profile.util';

export class GroupWorkspaceService {
  async assertGroupMember(groupId: string, userId: string) {
    const { data: member } = await supabase
      .from('group_members')
      .select('group_id, user_id, member_role, assigned_position, joined_at')
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

    return {
      ...member,
      assigned_role: member.assigned_position || 'Member',
    };
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
          leader:users!study_groups_leader_id_fkey(
            id,
            karma_points,
            is_verified_student,
            academic_profile:academic_profiles(full_name, avatar_url, student_code)
          )
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
            karma_points,
            is_verified_student,
            academic_profile:academic_profiles(full_name, avatar_url, student_code, cohort, major, bio),
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
          assignee:users!kanban_tasks_assignee_id_fkey(
            id,
            academic_profile:academic_profiles(full_name, avatar_url, student_code)
          )
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
          uploader:users!group_documents_uploader_id_fkey(
            id,
            academic_profile:academic_profiles(full_name, avatar_url, student_code)
          )
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
            karma_points,
            is_verified_student,
            academic_profile:academic_profiles(full_name, avatar_url, student_code, cohort, major, career_goal),
            skills:user_skills(id, skill_name, proficiency_level)
          )
        `
        )
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      applications = (apps || []).map((app) => ({
        ...app,
        cover_letter: app.cover_note ?? app.cover_letter ?? '',
        applicant: normalizeUserWithProfile(app.applicant),
      }));
    }

    const rawGroup = groupRes.data;
    const normalizedGroup = {
      ...rawGroup,
      group_name: rawGroup.name ?? rawGroup.group_name,
      project_topic: rawGroup.description ?? rawGroup.project_topic ?? null,
      leader: normalizeUserWithProfile(rawGroup.leader),
    };

    const normalizedMembers = (membersRes.data || []).map((m) => ({
      ...m,
      assigned_role: m.assigned_position ?? m.assigned_role ?? 'Member',
      user: normalizeUserWithProfile(m.user),
    }));

    const normalizedTasks = (tasksRes.data || []).map((t) => ({
      ...t,
      assignee: normalizeUserWithProfile(t.assignee),
    }));

    const normalizedDocs = (docsRes.data || []).map((d) => ({
      ...d,
      uploaded_by: d.uploader_id ?? d.uploaded_by,
      file_size_bytes: d.file_size ?? d.file_size_bytes ?? null,
      uploader: normalizeUserWithProfile(d.uploader),
    }));

    return {
      group: normalizedGroup,
      myMembership,
      members: normalizedMembers,
      slots: slotsRes.data || [],
      tasks: normalizedTasks,
      documents: normalizedDocs,
      applications,
      conversationId: convRes.data?.id || null,
    };
  }
}

export const groupWorkspaceService = new GroupWorkspaceService();
