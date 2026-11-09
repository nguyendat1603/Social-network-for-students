import { supabase } from '../../database';
import {
  SkillCategory,
  SkillProficiency,
  UserRole,
  VerificationProvider,
} from '../../common/constants/roles.constant';
import { AppError } from '../../common/utils/response.util';
import {
  AcademicProfileRecord,
  StudentVerificationRecord,
  UserRecord,
  UserSkillRecord,
} from './identity.types';

export class IdentityRepository {
  async findUserByEmail(email: string): Promise<UserRecord | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (error) {
      throw new AppError(error.message, 500, 'DB_QUERY_ERROR');
    }
    return data as UserRecord | null;
  }

  async findUserById(userId: string): Promise<UserRecord | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw new AppError(error.message, 500, 'DB_QUERY_ERROR');
    }
    return data as UserRecord | null;
  }

  async createUser(params: {
    email: string;
    passwordHash: string | null;
    role?: UserRole;
    isVerifiedStudent?: boolean;
    verifiedAt?: string | null;
  }): Promise<UserRecord> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: params.email.toLowerCase().trim(),
        password_hash: params.passwordHash,
        role: params.role || UserRole.UNVERIFIED_USER,
        is_verified_student: params.isVerifiedStudent ?? false,
        verified_at: params.verifiedAt ?? null,
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new AppError(
        error?.message || 'Không thể tạo tài khoản người dùng.',
        500,
        'DB_INSERT_ERROR'
      );
    }
    return data as UserRecord;
  }

  async markUserVerifiedStudent(userId: string): Promise<UserRecord> {
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from('users')
      .update({
        role: UserRole.VERIFIED_STUDENT,
        is_verified_student: true,
        verified_at: nowIso,
        last_login_at: nowIso,
      })
      .eq('id', userId)
      .select('*')
      .single();

    if (error || !data) {
      throw new AppError(
        error?.message || 'Không thể kích hoạt trạng thái Verified Student.',
        500,
        'DB_UPDATE_ERROR'
      );
    }
    return data as UserRecord;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId);
  }

  async createVerificationRecord(params: {
    userId: string;
    eduEmail: string;
    otpHash: string | null;
    provider: VerificationProvider;
    ssoSubjectId?: string | null;
    expiresAt: string;
    maxAttempts: number;
    verifiedAt?: string | null;
  }): Promise<StudentVerificationRecord> {
    const { data, error } = await supabase
      .from('student_verifications')
      .insert({
        user_id: params.userId,
        edu_email: params.eduEmail.toLowerCase().trim(),
        otp_hash: params.otpHash,
        provider: params.provider,
        sso_subject_id: params.ssoSubjectId ?? null,
        expires_at: params.expiresAt,
        attempts: 0,
        max_attempts: params.maxAttempts,
        last_sent_at: new Date().toISOString(),
        verified_at: params.verifiedAt ?? null,
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new AppError(
        error?.message || 'Không thể tạo bản ghi xác thực OTP.',
        500,
        'DB_INSERT_ERROR'
      );
    }
    return data as StudentVerificationRecord;
  }

  async findLatestPendingVerification(
    userId: string
  ): Promise<StudentVerificationRecord | null> {
    const { data, error } = await supabase
      .from('student_verifications')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', VerificationProvider.EDU_OTP)
      .is('verified_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new AppError(error.message, 500, 'DB_QUERY_ERROR');
    }
    return data as StudentVerificationRecord | null;
  }

  async incrementVerificationAttempt(
    verificationId: string,
    currentAttempts: number
  ): Promise<void> {
    await supabase
      .from('student_verifications')
      .update({ attempts: currentAttempts + 1 })
      .eq('id', verificationId);
  }

  async markVerificationCompleted(verificationId: string): Promise<void> {
    await supabase
      .from('student_verifications')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', verificationId);
  }

  async findProfileByUserId(
    userId: string
  ): Promise<AcademicProfileRecord | null> {
    const { data, error } = await supabase
      .from('academic_profiles')
      .select(
        `
        *,
        faculty:faculties (
          id,
          code,
          name
        )
      `
      )
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new AppError(error.message, 500, 'DB_QUERY_ERROR');
    }
    return data as AcademicProfileRecord | null;
  }

  async findProfileByAnonymousHandle(
    handle: string
  ): Promise<AcademicProfileRecord | null> {
    const { data, error } = await supabase
      .from('academic_profiles')
      .select('*')
      .eq('anonymous_handle', handle)
      .maybeSingle();

    if (error) {
      throw new AppError(error.message, 500, 'DB_QUERY_ERROR');
    }
    return data as AcademicProfileRecord | null;
  }

  async findProfileByStudentCode(
    studentCode: string
  ): Promise<AcademicProfileRecord | null> {
    const { data, error } = await supabase
      .from('academic_profiles')
      .select('*')
      .eq('student_code', studentCode.trim())
      .maybeSingle();

    if (error) {
      throw new AppError(error.message, 500, 'DB_QUERY_ERROR');
    }
    return data as AcademicProfileRecord | null;
  }

  async createAcademicProfile(params: {
    userId: string;
    fullName: string;
    anonymousHandle: string;
    studentCode?: string | null;
    facultyId?: string | null;
    cohort?: string | null;
    major?: string | null;
    className?: string | null;
    avatarUrl?: string | null;
  }): Promise<AcademicProfileRecord> {
    const { data, error } = await supabase
      .from('academic_profiles')
      .insert({
        user_id: params.userId,
        full_name: params.fullName.trim(),
        anonymous_handle: params.anonymousHandle,
        student_code: params.studentCode ?? null,
        faculty_id: params.facultyId ?? null,
        cohort: params.cohort ?? null,
        major: params.major ?? null,
        class_name: params.className ?? null,
        avatar_url: params.avatarUrl ?? null,
      })
      .select(
        `
        *,
        faculty:faculties (
          id,
          code,
          name
        )
      `
      )
      .single();

    if (error || !data) {
      throw new AppError(
        error?.message || 'Không thể khởi tạo hồ sơ học thuật.',
        500,
        'DB_INSERT_ERROR'
      );
    }
    return data as AcademicProfileRecord;
  }

  async updateAcademicProfile(
    userId: string,
    payload: Record<string, unknown>
  ): Promise<AcademicProfileRecord> {
    const { data, error } = await supabase
      .from('academic_profiles')
      .update(payload)
      .eq('user_id', userId)
      .select(
        `
        *,
        faculty:faculties (
          id,
          code,
          name
        )
      `
      )
      .single();

    if (error || !data) {
      throw new AppError(
        error?.message || 'Không thể cập nhật hồ sơ học thuật.',
        500,
        'DB_UPDATE_ERROR'
      );
    }
    return data as AcademicProfileRecord;
  }

  async listSkillsByUserId(userId: string): Promise<UserSkillRecord[]> {
    const { data, error } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', userId)
      .order('category', { ascending: true });

    if (error) {
      throw new AppError(error.message, 500, 'DB_QUERY_ERROR');
    }
    return (data || []) as UserSkillRecord[];
  }

  async replaceUserSkills(
    userId: string,
    skills: Array<{
      skillName: string;
      category: SkillCategory;
      proficiencyLevel: SkillProficiency;
    }>
  ): Promise<UserSkillRecord[]> {
    const { error: deleteErr } = await supabase
      .from('user_skills')
      .delete()
      .eq('user_id', userId);

    if (deleteErr) {
      throw new AppError(deleteErr.message, 500, 'DB_DELETE_ERROR');
    }

    if (skills.length === 0) {
      return [];
    }

    const rows = skills.map((s) => ({
      user_id: userId,
      skill_name: s.skillName.trim(),
      category: s.category,
      proficiency_level: s.proficiencyLevel,
    }));

    const { data, error } = await supabase
      .from('user_skills')
      .insert(rows)
      .select('*');

    if (error) {
      throw new AppError(error.message, 500, 'DB_INSERT_ERROR');
    }
    return (data || []) as UserSkillRecord[];
  }

  async listFacultiesAndCourses(): Promise<{
    faculties: Array<{ id: string; code: string; name: string; description: string | null }>;
    courses: Array<{
      id: string;
      code: string;
      name: string;
      faculty_id: string;
      credits: number;
    }>;
  }> {
    const [facultiesRes, coursesRes] = await Promise.all([
      supabase.from('faculties').select('id, code, name, description').order('code'),
      supabase
        .from('courses')
        .select('id, code, name, faculty_id, credits')
        .order('code'),
    ]);

    if (facultiesRes.error) {
      throw new AppError(facultiesRes.error.message, 500, 'DB_QUERY_ERROR');
    }
    if (coursesRes.error) {
      throw new AppError(coursesRes.error.message, 500, 'DB_QUERY_ERROR');
    }

    return {
      faculties: facultiesRes.data || [],
      courses: coursesRes.data || [],
    };
  }
}

export const identityRepository = new IdentityRepository();
