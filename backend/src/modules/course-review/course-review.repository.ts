import { supabase } from '../../database';
import { AppError } from '../../common/utils/response.util';

export class CourseReviewRepository {
  async listLecturers(facultyId?: string) {
    let query = supabase
      .from('lecturers')
      .select('*, faculty:faculties(id, code, name)')
      .order('full_name', { ascending: true });

    if (facultyId) {
      query = query.eq('faculty_id', facultyId);
    }

    const { data, error } = await query;
    if (error) {
      throw new AppError(error.message, 500, 'DB_QUERY_ERROR');
    }
    return data || [];
  }

  async listCoursesWithAggregates(facultyId?: string) {
    let courseQuery = supabase
      .from('courses')
      .select('*, faculty:faculties(id, code, name)')
      .order('code', { ascending: true });

    if (facultyId) {
      courseQuery = courseQuery.eq('faculty_id', facultyId);
    }

    const [{ data: courses, error: courseErr }, { data: aggregates }] =
      await Promise.all([
        courseQuery,
        supabase
          .from('course_review_aggregates')
          .select('*')
          .is('lecturer_id', null),
      ]);

    if (courseErr) {
      throw new AppError(courseErr.message, 500, 'DB_QUERY_ERROR');
    }

    const aggMap = new Map<string, Record<string, any>>();
    for (const a of aggregates || []) {
      aggMap.set(a.course_id, a);
    }

    return (courses || []).map((c) => ({
      ...c,
      aggregate: aggMap.get(c.id) || {
        total_reviews: 0,
        avg_difficulty: 0,
        avg_workload: 0,
        avg_fairness: 0,
        avg_teaching: 0,
        avg_reading_load: 0,
      },
    }));
  }

  async findCourseReviewsByCode(courseCode: string) {
    const { data: course, error: cErr } = await supabase
      .from('courses')
      .select('*, faculty:faculties(id, code, name)')
      .eq('code', courseCode.toUpperCase().trim())
      .maybeSingle();

    if (cErr || !course) {
      throw new AppError(
        `Không tìm thấy học phần "${courseCode}".`,
        404,
        'COURSE_NOT_FOUND'
      );
    }

    const [
      { data: aggregate },
      { data: reviews, error: revErr },
      { data: lecturers },
    ] = await Promise.all([
      supabase
        .from('course_review_aggregates')
        .select('*')
        .eq('course_id', course.id)
        .is('lecturer_id', null)
        .maybeSingle(),
      supabase
        .from('course_reviews')
        .select('*, lecturer:lecturers(id, full_name, academic_title)')
        .eq('course_id', course.id)
        .eq('status', 'PUBLISHED')
        .order('created_at', { ascending: false }),
      supabase
        .from('lecturers')
        .select('*')
        .eq('faculty_id', course.faculty_id)
        .order('full_name', { ascending: true }),
    ]);

    if (revErr) {
      throw new AppError(revErr.message, 500, 'DB_QUERY_ERROR');
    }

    return {
      course,
      aggregate: aggregate || {
        total_reviews: 0,
        avg_difficulty: 0,
        avg_workload: 0,
        avg_fairness: 0,
        avg_teaching: 0,
        avg_reading_load: 0,
      },
      reviews: reviews || [],
      lecturers: lecturers || [],
    };
  }
}

export const courseReviewRepository = new CourseReviewRepository();
