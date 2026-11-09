export type DocumentType =
  | 'MIDTERM_EXAM'
  | 'FINAL_EXAM'
  | 'ASSIGNMENT_PROJECT'
  | 'LECTURE_SLIDE'
  | 'SUMMARY_NOTE';

export interface DocumentItem {
  id: string;
  uploader_id: string;
  faculty_id: string;
  course_id: string;
  semester: string;
  doc_type: DocumentType;
  title: string;
  description: string | null;
  file_url: string;
  preview_url: string | null;
  file_name: string;
  file_size: number;
  file_sha256: string;
  download_count: number;
  upvote_count: number;
  downvote_count: number;
  created_at: string;
  faculty?: { id: string; code: string; name: string };
  course?: { id: string; code: string; name: string };
  uploader?: {
    user_id?: string;
    full_name: string;
    student_code?: string | null;
  };
}

export interface HierarchyFacultyNode {
  id: string;
  code: string;
  name: string;
  courses: Array<{
    id: string;
    code: string;
    name: string;
    faculty_id: string;
    credits: number;
    documentCount: number;
    semesters: string[];
  }>;
}
