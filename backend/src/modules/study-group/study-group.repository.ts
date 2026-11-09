import { supabase } from '../../database';
import { AppError } from '../../common/errors/app.error';
import { StudyGroupFilterQuery } from './study-group.types';

export class StudyGroupRepository {
  async listStudyGroups(filters: StudyGroupFilterQuery, currentUserId?: string) {
    let query = supabase
      .from('study_groups')
      .select(
        `
        *,
        course:courses(id, code, name),
        leader:users!study_groups_leader_id_fkey(id, full_name, avatar_url, karma_points, is_verified_student),
        slots:recruitment_slots(*),
        members:group_members(user_id, member_role, assigned_role)
      `
      )
      .order('created_at', { ascending: false });

    if (filters.courseId) {
      query = query.eq('course_id', filters.courseId);
    }
    if (filters.targetGrade) {
      query = query.eq('target_grade', filters.targetGrade);
    }
    if (filters.onlyRecruiting !== undefined) {
      query = query.eq('is_recruiting', filters.onlyRecruiting);
    }
    if (filters.search) {
      query = query.or(
        `group_name.ilike.%${filters.search}%,project_topic.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;
    if (error) {
      throw new AppError(error.message, 500, 'DB_ERROR');
    }

    let groups = data || [];
    if (filters.roleName) {
      const roleFilter = filters.roleName.toLowerCase();
      groups = groups.filter((group) =>
        (group.slots || []).some((slot: { role_name: string }) =>
          slot.role_name.toLowerCase().includes(roleFilter)
        )
      );
    }

    // Attach current user's membership or application state
    let myApplicationsMap: Record<string, string> = {};
    if (currentUserId && groups.length > 0) {
      const { data: myApps } = await supabase
        .from('group_applications')
        .select('group_id, status')
        .eq('applicant_id', currentUserId)
        .in(
          'group_id',
          groups.map((g) => g.id)
        );

      for (const app of myApps || []) {
        myApplicationsMap[app.group_id] = app.status;
      }
    }

    return groups.map((group) => {
      const members = group.members || [];
      const myMember = currentUserId
        ? members.find((m: { user_id: string }) => m.user_id === currentUserId)
        : null;

      return {
        ...group,
        member_count: members.length,
        is_member: Boolean(myMember),
        my_member_role: myMember?.member_role || null,
        my_application_status: myApplicationsMap[group.id] || null,
      };
    });
  }
}

export const studyGroupRepository = new StudyGroupRepository();
