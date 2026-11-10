import { supabase } from '../../database';
import { AppError } from '../../common/utils/response.util';
import { CreatePostInput, FeedFilterQuery } from './feed.types';

export class FeedRepository {
  async findCourseIdByCode(courseCode: string): Promise<string | null> {
    const { data } = await supabase
      .from('courses')
      .select('id')
      .eq('code', courseCode.toUpperCase().trim())
      .maybeSingle();
    return data?.id || null;
  }

  async listFeedPosts(filter: FeedFilterQuery) {
    const page = Math.max(1, Number(filter.page || 1));
    const limit = Math.min(50, Math.max(1, Number(filter.limit || 20)));
    const offset = (page - 1) * limit;

    let resolvedCourseId = filter.courseId;
    if (!resolvedCourseId && filter.courseCode) {
      resolvedCourseId =
        (await this.findCourseIdByCode(filter.courseCode)) || undefined;
    }

    let taggedPostIds: string[] = [];
    if (resolvedCourseId) {
      const { data: tagRows } = await supabase
        .from('post_course_tags')
        .select('post_id')
        .eq('course_id', resolvedCourseId);
      taggedPostIds = (tagRows || []).map((r) => r.post_id);
    }

    let query = supabase
      .from('posts')
      .select(
        `
        *,
        faculty:faculties(id, code, name),
        course:courses!posts_course_id_fkey(id, code, name),
        attachments:post_attachments(id, file_url, file_name, file_type, file_size)
      `,
        { count: 'exact' }
      )
      .eq('status', 'PUBLISHED');

    if (filter.scope && !resolvedCourseId) {
      query = query.eq('feed_scope', filter.scope);
    }

    if (filter.facultyId) {
      query = query.eq('faculty_id', filter.facultyId);
    }

    if (resolvedCourseId) {
      if (taggedPostIds.length > 0) {
        query = query.or(
          `course_id.eq.${resolvedCourseId},id.in.(${taggedPostIds.join(',')})`
        );
      } else {
        query = query.eq('course_id', resolvedCourseId);
      }
    }

    if (filter.postType) {
      query = query.eq('post_type', filter.postType);
    }

    if (filter.sort === 'unanswered') {
      query = query
        .eq('post_type', 'QUESTION')
        .is('accepted_comment_id', null)
        .order('created_at', { ascending: false });
    } else if (filter.sort === 'hot') {
      query = query
        .order('upvote_count', { ascending: false })
        .order('comment_count', { ascending: false })
        .order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    if (filter.q && filter.q.trim()) {
      const keyword = filter.q.trim();
      query = query.or(
        `title.ilike.%${keyword}%,content_body.ilike.%${keyword}%`
      );
    }

    const { data, error, count } = await query.range(
      offset,
      offset + limit - 1
    );

    if (error) {
      throw new AppError(error.message, 500, 'FEED_QUERY_ERROR');
    }

    return {
      rows: data || [],
      total: count || 0,
      page,
      limit,
    };
  }

  async createPostRecord(params: {
    authorId: string;
    input: CreatePostInput;
    sanitizedBody: string;
    hasLatex: boolean;
    hasCode: boolean;
  }) {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: params.authorId,
        feed_scope: params.input.feedScope,
        faculty_id: params.input.facultyId ?? null,
        course_id: params.input.courseId ?? null,
        post_type: params.input.postType,
        title: params.input.title.trim(),
        content_body: params.sanitizedBody,
        has_latex: params.hasLatex,
        has_code: params.hasCode,
        is_anonymous: Boolean(params.input.isAnonymous),
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new AppError(
        error?.message || 'Không thể tạo bài đăng.',
        500,
        'POST_CREATE_ERROR'
      );
    }

    if (params.input.attachments && params.input.attachments.length > 0) {
      await supabase.from('post_attachments').insert(
        params.input.attachments.map((att) => ({
          post_id: data.id,
          file_url: att.fileUrl,
          file_name: att.fileName,
          file_type: att.fileType || 'application/pdf',
          file_size: att.fileSize || 0,
        }))
      );
    }

    return data;
  }

  async findPostById(postId: string) {
    const { data, error } = await supabase
      .from('posts')
      .select(
        `
        *,
        faculty:faculties(id, code, name),
        course:courses!posts_course_id_fkey(id, code, name),
        attachments:post_attachments(id, file_url, file_name, file_type, file_size)
      `
      )
      .eq('id', postId)
      .maybeSingle();

    if (error) {
      throw new AppError(error.message, 500, 'DB_QUERY_ERROR');
    }
    return data;
  }

  async getCourseTagsForPostIds(postIds: string[]) {
    if (postIds.length === 0) return new Map<string, Array<{ id: string; code: string; name: string }>>();

    const { data } = await supabase
      .from('post_course_tags')
      .select('post_id, course:courses!post_course_tags_course_id_fkey(id, code, name)')
      .in('post_id', postIds);

    const map = new Map<string, Array<{ id: string; code: string; name: string }>>();
    for (const row of (data as any[]) || []) {
      if (!row.course) continue;
      const list = map.get(row.post_id) || [];
      list.push(row.course);
      map.set(row.post_id, list);
    }
    return map;
  }

  async getProfilesForUserIds(userIds: string[]) {
    if (userIds.length === 0) return new Map<string, Record<string, any>>();
    const { data } = await supabase
      .from('academic_profiles')
      .select('*')
      .in('user_id', userIds);

    const map = new Map<string, Record<string, any>>();
    for (const p of data || []) {
      map.set(p.user_id, p);
    }
    return map;
  }
}

export const feedRepository = new FeedRepository();
