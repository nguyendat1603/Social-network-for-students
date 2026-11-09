import { z } from 'zod';

const starScoreSchema = z
  .number()
  .int()
  .min(1, 'Điểm đánh giá tối thiểu là 1 sao.')
  .max(5, 'Điểm đánh giá tối đa là 5 sao.');

export const createCourseReviewSchema = z.object({
  courseId: z.string().uuid('Mã học phần không hợp lệ.'),
  lecturerId: z.string().uuid().nullable().optional(),
  semester: z
    .string()
    .trim()
    .regex(
      /^\d{4}\.[123]$/,
      'Kỳ học phải theo định dạng YYYY.1, YYYY.2 hoặc YYYY.3 (VD: 2025.1).'
    ),
  difficultyScore: starScoreSchema,
  workloadScore: starScoreSchema,
  gradingFairnessScore: starScoreSchema,
  teachingQualityScore: starScoreSchema,
  readingLoadScore: starScoreSchema.default(3),
  reviewContent: z
    .string()
    .trim()
    .min(15, 'Nội dung review phải có ít nhất 15 ký tự.')
    .max(8000),
  tipsForJunior: z.string().trim().max(3000).nullable().optional(),
  expectedGrade: z.string().trim().max(10).nullable().optional(),
  isAnonymous: z.boolean().default(true),
});
