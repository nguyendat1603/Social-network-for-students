import { apiRequest } from './api.client';
import {
  AcademicProfile,
  AuthSessionResponse,
  CourseItem,
  FacultyItem,
  RegisterEduPayload,
  RegisterEduResponse,
  UserSkillItem,
} from '../types/identity.types';

export const identityService = {
  getCatalog() {
    return apiRequest<{ faculties: FacultyItem[]; courses: CourseItem[] }>(
      '/identity/catalog'
    );
  },

  registerEdu(payload: RegisterEduPayload) {
    return apiRequest<RegisterEduResponse>('/identity/register-edu', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  verifyOtp(email: string, otpCode: string) {
    return apiRequest<AuthSessionResponse>('/identity/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otpCode }),
    });
  },

  resendOtp(email: string) {
    return apiRequest<{
      email: string;
      otpExpiresAt: string;
      otpTtlSeconds: number;
      devOtpPreview?: string;
    }>('/identity/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  login(email: string, password: string) {
    return apiRequest<AuthSessionResponse>('/identity/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  schoolSsoLogin(payload: {
    email: string;
    fullName: string;
    ssoSubjectId: string;
    avatarUrl?: string;
  }) {
    return apiRequest<AuthSessionResponse>('/identity/oauth/school/callback', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getMyProfile() {
    return apiRequest<AcademicProfile>('/identity/profile/me');
  },

  updateMyProfile(payload: {
    studentCode?: string;
    fullName?: string;
    avatarUrl?: string | null;
    facultyId?: string | null;
    major?: string | null;
    cohort?: string | null;
    className?: string | null;
    careerGoal?: string | null;
    bio?: string | null;
    skills?: UserSkillItem[];
  }) {
    return apiRequest<AcademicProfile>('/identity/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  updateAnonymousHandle(anonymousHandle: string, anonymousAvatar?: string | null) {
    return apiRequest<AcademicProfile>('/identity/anonymous-handle', {
      method: 'PATCH',
      body: JSON.stringify({ anonymousHandle, anonymousAvatar }),
    });
  },
};
