import { z } from 'zod';
import { envConfig } from '../../config/env.config';
import {
  SkillCategory,
  SkillProficiency,
} from '../../common/constants/roles.constant';
import { AppError } from '../../common/utils/response.util';

/**
 * Checks whether an email belongs to an approved university (.edu / school domain) whitelist.
 */
export function isAllowedEduEmail(email: string): boolean {
  const parts = email.toLowerCase().trim().split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1];

  return envConfig.allowedEduDomains.some(
    (allowed) => domain === allowed || domain.endsWith(`.${allowed}`)
  );
}

/**
 * Extracts student ID (MSSV) automatically from common Vietnamese university email formats
 * e.g. `dat.nt215340@sis.hust.edu.vn` -> `20215340`, `20210001@gm.uit.edu.vn` -> `20210001`
 */
export function extractStudentCodeFromEmail(email: string): string | null {
  const localPart = email.toLowerCase().trim().split('@')[0] || '';

  // Pattern 1: HUST format e.g. dat.nt215340 -> 20215340
  const hustMatch = localPart.match(/\.?[a-z]+(\d{2})(\d{4,6})$/i);
  if (hustMatch) {
    return `20${hustMatch[1]}${hustMatch[2]}`;
  }

  // Pattern 2: Direct 8-digit student code in local part
  const directMatch = localPart.match(/\b(20\d{6})\b/);
  if (directMatch) {
    return directMatch[1];
  }

  return null;
}

export function assertValidEduEmail(email: string): void {
  if (!isAllowedEduEmail(email)) {
    throw new AppError(
      `Email "${email}" không thuộc tên miền trường đại học được hỗ trợ (.edu / .edu.vn). Vui lòng dùng email sinh viên của trường.`,
      400,
      'INVALID_EDU_EMAIL_DOMAIN'
    );
  }
}

export const registerEduSchema = z.object({
  email: z.string().trim().email('Định dạng email không hợp lệ.'),
  password: z
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự.')
    .max(100, 'Mật khẩu quá dài.'),
  fullName: z
    .string()
    .trim()
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự.')
    .max(120),
  studentCode: z.string().trim().max(30).optional(),
  facultyId: z.string().uuid().optional(),
  cohort: z.string().trim().max(30).optional(),
  major: z.string().trim().max(150).optional(),
  className: z.string().trim().max(80).optional(),
});

export const verifyOtpSchema = z.object({
  email: z.string().trim().email('Định dạng email không hợp lệ.'),
  otpCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Mã OTP phải gồm đúng 6 chữ số.'),
});

export const resendOtpSchema = z.object({
  email: z.string().trim().email('Định dạng email không hợp lệ.'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Định dạng email không hợp lệ.'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu.'),
});

export const schoolSsoSchema = z.object({
  email: z.string().trim().email('Định dạng email trường không hợp lệ.'),
  fullName: z.string().trim().min(2).max(120),
  ssoSubjectId: z.string().trim().min(2).max(255),
  avatarUrl: z.string().url().optional(),
});

export const updateAcademicProfileSchema = z.object({
  studentCode: z.string().trim().min(4).max(30).optional(),
  fullName: z.string().trim().min(2).max(120).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  facultyId: z.string().uuid().nullable().optional(),
  major: z.string().trim().max(150).nullable().optional(),
  cohort: z.string().trim().max(30).nullable().optional(),
  className: z.string().trim().max(80).nullable().optional(),
  careerGoal: z.string().trim().max(1000).nullable().optional(),
  bio: z.string().trim().max(1000).nullable().optional(),
  skills: z
    .array(
      z.object({
        skillName: z.string().trim().min(1).max(100),
        category: z.nativeEnum(SkillCategory).default(SkillCategory.TECHNICAL),
        proficiencyLevel: z
          .nativeEnum(SkillProficiency)
          .default(SkillProficiency.INTERMEDIATE),
      })
    )
    .max(30)
    .optional(),
});

export const updateAnonymousHandleSchema = z.object({
  anonymousHandle: z
    .string()
    .trim()
    .min(4, 'Biệt danh ẩn danh phải từ 4 đến 40 ký tự.')
    .max(40, 'Biệt danh ẩn danh tối đa 40 ký tự.')
    .regex(
      /^[a-zA-Z0-9_À-ỹ]+$/,
      'Biệt danh ẩn danh chỉ được chứa chữ cái, chữ số và dấu gạch dưới (_).'
    ),
  anonymousAvatar: z.string().url().nullable().optional(),
});
