export interface CreateCourseReviewInput {
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
}

export interface SubjectForumSearchQuery {
  courseCode?: string;
  courseId?: string;
  q?: string;
  onlyAccepted?: boolean;
  page?: number;
  limit?: number;
}
