import { z } from 'zod';

export const uploadDocumentSchema = z.object({
  facultyId: z.string().uuid('Mã Khoa/Viện không hợp lệ.'),
  courseId: z.string().uuid('Mã học phần không hợp lệ.'),
  semester: z
    .string()
    .trim()
    .regex(
      /^\d{4}\.[123]$/,
      'Kỳ học phải theo định dạng YYYY.1, YYYY.2 hoặc YYYY.3 (VD: 2025.1).'
    ),
  docType: z.enum([
    'MIDTERM_EXAM',
    'FINAL_EXAM',
    'ASSIGNMENT_PROJECT',
    'LECTURE_SLIDE',
    'SUMMARY_NOTE',
  ]),
  title: z.string().trim().min(4, 'Tiêu đề tài liệu tối thiểu 4 ký tự.').max(255),
  description: z.string().trim().max(3000).nullable().optional(),
  fileUrl: z.string().url('URL tài liệu không hợp lệ.'),
  previewUrl: z.string().url().nullable().optional(),
  fileName: z.string().trim().min(1).max(255),
  fileSize: z.number().int().min(0).max(50 * 1024 * 1024).default(0),
  fileSha256: z.string().trim().min(8).max(64).optional(),
});

export const documentVoteSchema = z.object({
  voteType: z.enum(['UPVOTE', 'DOWNVOTE']),
});
