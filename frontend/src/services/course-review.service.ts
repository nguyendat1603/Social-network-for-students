import { apiRequest } from './api.client';
import {
  CourseAggregateMetrics,
  CourseReviewItem,
  CourseWithAggregate,
  LecturerItem,
} from '../types/course-review.types';
import { PostItem } from '../types/feed.types';

export const courseReviewService = {
  getDirectory(facultyId?: string) {
    const qs = facultyId ? `?facultyId=${encodeURIComponent(facultyId)}` : '';
    return apiRequest<{
      courses: CourseWithAggregate[];
      lecturers: LecturerItem[];
    }>(`/course-reviews/directory${qs}`);
  },

  getCourseReviewDetail(courseCode: string) {
    return apiRequest<{
      course: {
        id: string;
        code: string;
        name: string;
        credits: number;
        description: string | null;
        faculty?: { id: string; code: string; name: string };
      };
      aggregate: CourseAggregateMetrics;
      lecturers: LecturerItem[];
      reviews: CourseReviewItem[];
    }>(`/course-reviews/courses/${encodeURIComponent(courseCode)}`);
  },

  createReview(payload: {
    courseId: string;
    lecturerId?: string | null;
    semester: string;
    difficultyScore: number;
    workloadScore: number;
    gradingFairnessScore: number;
    teachingQualityScore: number;
    readingLoadScore: number;
    reviewContent: string;
    tipsForJunior?: string | null;
    expectedGrade?: string | null;
    isAnonymous?: boolean;
  }) {
    return apiRequest<{
      review: CourseReviewItem;
      aggregate: CourseAggregateMetrics;
    }>('/course-reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  searchSubjectForum(params: {
    courseCode?: string;
    q?: string;
    onlyAccepted?: boolean;
  }) {
    const qs = new URLSearchParams();
    if (params.courseCode) qs.set('courseCode', params.courseCode);
    if (params.q) qs.set('q', params.q);
    if (params.onlyAccepted) qs.set('onlyAccepted', 'true');
    const queryStr = qs.toString() ? `?${qs.toString()}` : '';
    return apiRequest<PostItem[]>(`/course-reviews/forum/search${queryStr}`);
  },
};
