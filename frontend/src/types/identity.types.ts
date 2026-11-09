export type UserRole =
  | 'UNVERIFIED_USER'
  | 'VERIFIED_STUDENT'
  | 'MODERATOR'
  | 'ADMIN';

export type SkillCategory = 'TECHNICAL' | 'LANGUAGE' | 'SOFT_SKILL';

export type SkillProficiency =
  | 'BEGINNER'
  | 'INTERMEDIATE'
  | 'ADVANCED'
  | 'EXPERT';

export interface FacultyItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

export interface CourseItem {
  id: string;
  code: string;
  name: string;
  faculty_id: string;
  credits: number;
}

export interface UserSkillItem {
  id?: string;
  skillName: string;
  category: SkillCategory;
  proficiencyLevel: SkillProficiency;
}

export interface AcademicProfile {
  userId: string;
  email?: string;
  role: UserRole;
  isVerifiedStudent: boolean;
  verifiedAt: string | null;
  karmaPoints: number;
  studentCode: string | null;
  fullName: string;
  avatarUrl: string | null;
  facultyId: string | null;
  faculty: {
    id: string;
    code: string;
    name: string;
  } | null;
  major: string | null;
  cohort: string | null;
  className: string | null;
  careerGoal: string | null;
  bio: string | null;
  anonymousHandle?: string;
  anonymousAvatar?: string | null;
  anonymousLastChangedAt?: string | null;
  skills: UserSkillItem[];
  updatedAt: string;
}

export interface RegisterEduPayload {
  email: string;
  password: string;
  fullName: string;
  studentCode?: string;
  facultyId?: string;
  cohort?: string;
  major?: string;
  className?: string;
}

export interface RegisterEduResponse {
  userId: string;
  email: string;
  inferredStudentCode: string | null;
  isVerifiedStudent: boolean;
  otpExpiresAt: string;
  otpTtlSeconds: number;
  devOtpPreview?: string;
}

export interface AuthSessionResponse {
  accessToken: string;
  refreshToken: string;
  isNewAccount?: boolean;
  user: AcademicProfile;
}
