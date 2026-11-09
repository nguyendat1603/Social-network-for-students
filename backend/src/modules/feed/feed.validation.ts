import { z } from 'zod';

export const createPostSchema = z.object({
  feedScope: z.enum(['CAMPUS', 'DEPARTMENT', 'COURSE']).default('CAMPUS'),
  facultyId: z.string().uuid().nullable().optional(),
  courseId: z.string().uuid().nullable().optional(),
  postType: z
    .enum(['DISCUSSION', 'QUESTION', 'ANNOUNCEMENT'])
    .default('DISCUSSION'),
  title: z
    .string()
    .trim()
    .min(4, 'Tiêu đề bài đăng phải có ít nhất 4 ký tự.')
    .max(255),
  contentBody: z
    .string()
    .trim()
    .min(5, 'Nội dung bài đăng phải có ít nhất 5 ký tự.')
    .max(20000),
  isAnonymous: z.boolean().default(false),
  attachments: z
    .array(
      z.object({
        fileUrl: z.string().url('URL tệp đính kèm không hợp lệ.'),
        fileName: z.string().trim().min(1).max(255),
        fileType: z.string().trim().max(80).default('application/pdf'),
        fileSize: z.number().int().min(0).default(0),
      })
    )
    .max(10)
    .optional(),
});

export const createCommentSchema = z.object({
  parentCommentId: z.string().uuid().nullable().optional(),
  contentBody: z
    .string()
    .trim()
    .min(1, 'Nội dung bình luận không được để trống.')
    .max(10000),
  isAnonymous: z.boolean().default(false),
});

export const voteSchema = z.object({
  voteType: z.enum(['UPVOTE', 'DOWNVOTE', 'HELPFUL']),
});
