export type DocumentType =
  | 'MIDTERM_EXAM'
  | 'FINAL_EXAM'
  | 'ASSIGNMENT_PROJECT'
  | 'LECTURE_SLIDE'
  | 'SUMMARY_NOTE';

export interface UploadDocumentInput {
  facultyId: string;
  courseId: string;
  semester: string;
  docType: DocumentType;
  title: string;
  description?: string | null;
  fileUrl: string;
  previewUrl?: string | null;
  fileName: string;
  fileSize?: number;
  fileSha256?: string;
}

export interface ResourceFilterQuery {
  facultyId?: string;
  courseId?: string;
  courseCode?: string;
  semester?: string;
  docType?: DocumentType;
  q?: string;
  page?: number;
  limit?: number;
}
