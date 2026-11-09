import { supabase } from '../../../database';
import { UserRole } from '../../../common/constants/roles.constant';
import { AppError } from '../../../common/utils/response.util';
import { postEngineService } from '../../feed/services/post-engine.service';
import { SubjectForumSearchQuery } from '../course-review.types';

export class SubjectForumSearchService {
  /**
   * Searches subject-specific Q&A questions by courseCode / courseId and full-text keywords or error codes.
   */
  async searchSubjectQuestions(
    query: SubjectForumSearchQuery,
    viewerRole?: UserRole
  ) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(query.limit || 20)));
    const offset = (page - 1) * limit;

    let courseId = query.courseId;
    if (!courseId && query.courseCode) {
      const { data: c } = await supabase
        .from('courses')
        .select('id')
        .eq('code', query.courseCode.toUpperCase().trim())
        .maybeSingle();
      courseId = c?.id;
    }

    let taggedPostIds: string[] = [];
    if (courseId) {
      const { data: tagRows } = await supabase
        .from('post_course_tags')
        .select('post_id')
        .eq('course_id', courseId);
      taggedPostIds = (tagRows || []).map((r) => r.post_id);
    }

    let dbQuery = supabase
      .from('posts')
      .select(
        `
        *,
        course:courses(id, code, name),
        faculty:faculties(id, code, name)
      `,
        { count: 'exact' }
      )
      .eq('status', 'PUBLISHED')
      .eq('post_type', 'QUESTION');

    if (courseId) {
      if (taggedPostIds.length > 0) {
        dbQuery = dbQuery.or(
          `course_id.eq.${courseId},id.in.(${taggedPostIds.join(',')})`
        );
      } else {
        dbQuery = dbQuery.eq('course_id', courseId);
      }
    }

    if (query.onlyAccepted) {
      dbQuery = dbQuery.not('accepted_comment_id', 'is', null);
    }

    if (query.q && query.q.trim()) {
      const keyword = query.q.trim();
      dbQuery = dbQuery.or(
        `title.ilike.%${keyword}%,content_body.ilike.%${keyword}%`
      );
    }

    const { data, error, count } = await dbQuery
      .order('accepted_comment_id', { ascending: false, nullsFirst: false })
      .order('upvote_count', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new AppError(error.message, 500, 'FORUM_SEARCH_ERROR');
    }

    const rows = data || [];
    const authorIds = Array.from(new Set(rows.map((r) => r.author_id)));
    const profileMap = new Map<string, Record<string, any>>();

    if (authorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('academic_profiles')
        .select('*')
        .in('user_id', authorIds);
      for (const p of profiles || []) {
        profileMap.set(p.user_id, p);
      }
    }

    const items = rows.map((r) =>
      postEngineService.formatPostForClient(
        r,
        profileMap.get(r.author_id),
        viewerRole
      )
    );

    return {
      items,
      meta: { page, limit, total: count || 0 },
    };
  }
}

export const subjectForumSearchService = new SubjectForumSearchService();
