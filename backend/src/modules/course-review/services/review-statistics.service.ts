import { supabase } from '../../../database';

export class ReviewStatisticsService {
  /**
   * Recomputes the 1-5 star multi-criteria averages for a course (and optional lecturer)
   * and upserts into `public.course_review_aggregates`.
   */
  async recalculateCourseAggregate(
    courseId: string,
    lecturerId?: string | null
  ) {
    const { data: reviews } = await supabase
      .from('course_reviews')
      .select(
        'difficulty_score, workload_score, grading_fairness_score, teaching_quality_score, reading_load_score'
      )
      .eq('course_id', courseId)
      .eq('status', 'PUBLISHED');

    const rows = reviews || [];
    const total = rows.length;

    const avg = (key: keyof (typeof rows)[number]) => {
      if (total === 0) return 0;
      const sum = rows.reduce((acc, r) => acc + Number(r[key] || 0), 0);
      return Number((sum / total).toFixed(2));
    };

    const payload = {
      course_id: courseId,
      lecturer_id: null as string | null,
      total_reviews: total,
      avg_difficulty: avg('difficulty_score'),
      avg_workload: avg('workload_score'),
      avg_fairness: avg('grading_fairness_score'),
      avg_teaching: avg('teaching_quality_score'),
      avg_reading_load: avg('reading_load_score'),
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await supabase
      .from('course_review_aggregates')
      .select('id')
      .eq('course_id', courseId)
      .is('lecturer_id', null)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('course_review_aggregates')
        .update(payload)
        .eq('id', existing.id);
    } else {
      await supabase.from('course_review_aggregates').insert(payload);
    }

    if (lecturerId) {
      const { data: lecReviews } = await supabase
        .from('course_reviews')
        .select(
          'difficulty_score, workload_score, grading_fairness_score, teaching_quality_score, reading_load_score'
        )
        .eq('course_id', courseId)
        .eq('lecturer_id', lecturerId)
        .eq('status', 'PUBLISHED');

      const lRows = lecReviews || [];
      const lTotal = lRows.length;
      const lAvg = (key: keyof (typeof lRows)[number]) => {
        if (lTotal === 0) return 0;
        const sum = lRows.reduce((acc, r) => acc + Number(r[key] || 0), 0);
        return Number((sum / lTotal).toFixed(2));
      };

      const lecPayload = {
        course_id: courseId,
        lecturer_id: lecturerId,
        total_reviews: lTotal,
        avg_difficulty: lAvg('difficulty_score'),
        avg_workload: lAvg('workload_score'),
        avg_fairness: lAvg('grading_fairness_score'),
        avg_teaching: lAvg('teaching_quality_score'),
        avg_reading_load: lAvg('reading_load_score'),
        updated_at: new Date().toISOString(),
      };

      const { data: existingLec } = await supabase
        .from('course_review_aggregates')
        .select('id')
        .eq('course_id', courseId)
        .eq('lecturer_id', lecturerId)
        .maybeSingle();

      if (existingLec) {
        await supabase
          .from('course_review_aggregates')
          .update(lecPayload)
          .eq('id', existingLec.id);
      } else {
        await supabase.from('course_review_aggregates').insert(lecPayload);
      }
    }

    return payload;
  }
}

export const reviewStatisticsService = new ReviewStatisticsService();
