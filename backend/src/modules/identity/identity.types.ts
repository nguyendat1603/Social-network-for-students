import {
  SkillCategory,
  SkillProficiency,
  UserRole,
  UserStatus,
  VerificationProvider,
} from '../../common/constants/roles.constant';

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string | null;
  role: UserRole;
  is_verified_student: boolean;
  verified_at: string | null;
  karma_points: number;
  status: UserStatus;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentVerificationRecord {
  id: string;
  user_id: string;
  edu_email: string;
  otp_hash: string | null;
  provider: VerificationProvider;
  sso_subject_id: string | null;
  expires_at: string;
  attempts: number;
  max_attempts: number;
  last_sent_at: string;
  verified_at: string | null;
  created_at: string;
}

export interface AcademicProfileRecord {
  user_id: string;
  student_code: string | null;
  full_name: string;
  avatar_url: string | null;
  faculty_id: string | null;
  major: string | null;
  cohort: string | null;
  class_name: string | null;
  career_goal: string | null;
  bio: string | null;
  anonymous_handle: string;
  anonymous_avatar: string | null;
  anonymous_last_changed_at: string | null;
  created_at: string;
  updated_at: string;
  faculty?: {
    id: string;
    code: string;
    name: string;
  } | null;
}

export interface UserSkillRecord {
  id: string;
  user_id: string;
  skill_name: string;
  category: SkillCategory;
  proficiency_level: SkillProficiency;
  created_at: string;
}

export interface RegisterEduInput {
  email: string;
  password: string;
  fullName: string;
  studentCode?: string;
  facultyId?: string;
  cohort?: string;
  major?: string;
  className?: string;
}

export interface VerifyOtpInput {
  email: string;
  otpCode: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SchoolSsoInput {
  email: string;
  fullName: string;
  ssoSubjectId: string;
  avatarUrl?: string;
}

export interface UpdateAcademicProfileInput {
  studentCode?: string;
  fullName?: string;
  avatarUrl?: string | null;
  facultyId?: string | null;
  major?: string | null;
  cohort?: string | null;
  className?: string | null;
  careerGoal?: string | null;
  bio?: string | null;
  skills?: Array<{
    skillName: string;
    category: SkillCategory;
    proficiencyLevel: SkillProficiency;
  }>;
}
