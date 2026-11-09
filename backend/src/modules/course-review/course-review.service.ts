import { supabase } from '../../database';
import { UserRole } from '../../common/constants/roles.constant';
import { sanitizeAnonymousAuthor } from '../../common/middlewares/anonymous-context.middleware';
import { courseReviewRepository } from './course-review.repository';
import {
  CreateCourseReviewInput,
  SubjectForumSearchQuery,
} from './course-review.types';
import { lecturerReviewService } from './services/lecturer-review.service';
import { subjectForumSearchService } from './services/subject-forum-search.service';

export class CourseReviewService {
  async listDirectory(facultyId?: string) {
    const [courses, lecturers] = await Promise.all([
      courseReviewRepository.listCoursesWithAggregates(facultyId),
      courseReviewRepository.listLecturers(facultyId),
    ]);

    return { courses, lecturers };
  }

  async getCourseReviewDetail(courseCode: string, viewerRole?: UserRole) {
    const { course, aggregate, reviews, lecturers } =
      await courseReviewRepository.findCourseReviewsByCode(courseCode);

    const authorIds = Array.from(new Set(reviews.map((r) => r.author_id)));
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

    const sanitizedReviews = reviews.map((rev) => {
      const profile = profileMap.get(rev.author_id);
      return sanitizeAnonymousAuthor(
        {
          ...rev,
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
    });

    return {
      course,
      aggregate,
      lecturers,
      reviews: sanitizedReviews,
    };
  }

  async createReview(
    authorId: string,
    input: CreateCourseReviewInput,
    viewerRole?: UserRole
  ) {
    return lecturerReviewService.createReview(authorId, input, viewerRole);
  }

  async searchSubjectForum(
    query: SubjectForumSearchQuery,
    viewerRole?: UserRole
  ) {
    return subjectForumSearchService.searchSubjectQuestions(query, viewerRole);
  }
}

export const courseReviewService = new CourseReviewService();
