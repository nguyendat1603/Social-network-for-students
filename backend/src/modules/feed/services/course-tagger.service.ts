import { supabase } from '../../../database';

const COURSE_HASHTAG_REGEX = /#([A-Z]{2,4}\d{3,4}[A-Z]?)/gi;

export class CourseTaggerService {
  /**
   * Extracts course hashtags like `#IT3080`, `#MI1111`, `#ET2010` from text.
   */
  extractCourseCodesFromText(text: string): string[] {
    const matches = text.matchAll(COURSE_HASHTAG_REGEX);
    const codes = new Set<string>();
    for (const match of matches) {
      if (match[1]) {
        codes.add(match[1].toUpperCase());
      }
    }
    return Array.from(codes);
  }

  /**
   * Resolves extracted hashtag codes against `public.courses` and links them in `post_course_tags`.
   */
  async syncPostCourseTags(
    postId: string,
    title: string,
    contentBody: string,
    explicitCourseId?: string | null
  ): Promise<Array<{ id: string; code: string; name: string }>> {
    const extractedCodes = this.extractCourseCodesFromText(
      `${title} ${contentBody}`
    );

    const courseIds = new Set<string>();
    if (explicitCourseId) {
      courseIds.add(explicitCourseId);
    }

    if (extractedCodes.length > 0) {
      const { data: matchedCourses } = await supabase
        .from('courses')
        .select('id, code, name')
        .in('code', extractedCodes);

      for (const c of matchedCourses || []) {
        courseIds.add(c.id);
      }
    }

    await supabase.from('post_course_tags').delete().eq('post_id', postId);

    const idList = Array.from(courseIds);
    if (idList.length === 0) {
      return [];
    }

    await supabase.from('post_course_tags').insert(
      idList.map((courseId) => ({
        post_id: postId,
        course_id: courseId,
      }))
    );

    const { data: linkedCourses } = await supabase
      .from('courses')
      .select('id, code, name')
      .in('id', idList);

    return linkedCourses || [];
  }
}

export const courseTaggerService = new CourseTaggerService();
