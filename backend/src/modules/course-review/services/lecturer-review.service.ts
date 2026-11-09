import { supabase } from '../../../database';
import { UserRole } from '../../../common/constants/roles.constant';
import { sanitizeAnonymousAuthor } from '../../../common/middlewares/anonymous-context.middleware';
import { AppError } from '../../../common/utils/response.util';
import { CreateCourseReviewInput } from '../course-review.types';
import { reviewStatisticsService } from './review-statistics.service';

export class LecturerReviewService {
  /**
   * Creates a course/lecturer review (anonymous by default) and enforces
   * 1 review per (course_id, lecturer_id, author_id, semester).
   */
  async createReview(
    authorId: string,
    input: CreateCourseReviewInput,
    viewerRole?: UserRole
  ) {
    let dupQuery = supabase
      .from('course_reviews')
      .select('id')
      .eq('course_id', input.courseId)
      .eq('author_id', authorId)
      .eq('semester', input.semester.trim());

    if (input.lecturerId) {
      dupQuery = dupQuery.eq('lecturer_id', input.lecturerId);
    } else {
      dupQuery = dupQuery.is('lecturer_id', null);
    }

    const { data: duplicate } = await dupQuery.maybeSingle();
    if (duplicate) {
      throw new AppError(
        'Bạn đã gửi đánh giá cho học phần và giảng viên này trong kỳ học đã chọn.',
        409,
        'DUPLICATE_COURSE_REVIEW'
      );
    }

    const { data: created, error } = await supabase
      .from('course_reviews')
      .insert({
        course_id: input.courseId,
        lecturer_id: input.lecturerId ?? null,
        author_id: authorId,
        semester: input.semester.trim(),
        difficulty_score: input.difficultyScore,
        workload_score: input.workloadScore,
        grading_fairness_score: input.gradingFairnessScore,
        teaching_quality_score: input.teachingQualityScore,
        reading_load_score: input.readingLoadScore,
        review_content: input.reviewContent.trim(),
        tips_for_junior: input.tipsForJunior?.trim() || null,
        expected_grade: input.expectedGrade?.trim() || null,
        is_anonymous: input.isAnonymous ?? true,
      })
      .select(
        `
        *,
        course:courses(id, code, name),
        lecturer:lecturers(id, full_name, academic_title)
      `
      )
      .single();

    if (error || !created) {
      throw new AppError(
        error?.message || 'Không thể lưu đánh giá học phần.',
        500,
        'REVIEW_CREATE_ERROR'
      );
    }

    const aggregate = await reviewStatisticsService.recalculateCourseAggregate(
      input.courseId,
      input.lecturerId
    );

    const { data: profile } = await supabase
      .from('academic_profiles')
      .select('*')
      .eq('user_id', authorId)
      .maybeSingle();

    const sanitizedReview = sanitizeAnonymousAuthor(
      {
        ...created,
        author: profile
          ? {
              id: profile.user_id,
              full_name: profile.full_name,
              student_code: profile.student_code,
              avatar_url: profile.avatar_url,
              anonymous_handle: profile.anonymous_handle,
              anonymous_avatar: profile.anonymous_avatar,
            }
          : { anonymous_handle: 'SinhVienAnDanh' },
      },
      viewerRole,
      false
    );

    return {
      review: sanitizedReview,
      aggregate,
    };
  }
}

export const lecturerReviewService = new LecturerReviewService();
