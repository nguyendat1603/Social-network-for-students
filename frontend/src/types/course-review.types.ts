export interface LecturerItem {
  id: string;
  full_name: string;
  email: string | null;
  faculty_id: string;
  academic_title: string;
  bio: string | null;
}

export interface CourseAggregateMetrics {
  total_reviews: number;
  avg_difficulty: number;
  avg_workload: number;
  avg_fairness: number;
  avg_teaching: number;
  avg_reading_load: number;
}

export interface CourseReviewItem {
  id: string;
  course_id: string;
  lecturer_id: string | null;
  semester: string;
  difficulty_score: number;
  workload_score: number;
  grading_fairness_score: number;
  teaching_quality_score: number;
  reading_load_score: number;
  review_content: string;
  tips_for_junior: string | null;
  expected_grade: string | null;
  is_anonymous: boolean;
  helpful_count: number;
  created_at: string;
  lecturer?: {
    id: string;
    full_name: string;
    academic_title: string;
  } | null;
  author?: {
    id?: string;
    full_name?: string;
    anonymous_handle?: string;
  };
}

export interface CourseWithAggregate {
  id: string;
  code: string;
  name: string;
  faculty_id: string;
  credits: number;
  description: string | null;
  faculty?: { id: string; code: string; name: string };
  aggregate: CourseAggregateMetrics;
}
