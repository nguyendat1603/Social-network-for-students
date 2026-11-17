export interface RawAcademicProfileRow {
  user_id?: string;
  student_code?: string | null;
  student_id?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  faculty_id?: string | null;
  major?: string | null;
  cohort?: string | null;
  class_name?: string | null;
  career_goal?: string | null;
  bio?: string | null;
}

export interface RawUserWithProfileRow {
  id: string;
  email?: string;
  role?: string;
  karma_points?: number;
  is_verified_student?: boolean;
  full_name?: string | null;
  avatar_url?: string | null;
  academic_profile?: RawAcademicProfileRow | RawAcademicProfileRow[] | null;
  skills?: unknown[];
}

export function normalizeUserWithProfile(
  input: RawUserWithProfileRow | RawUserWithProfileRow[] | null | undefined
) {
  const user = Array.isArray(input) ? input[0] || null : input || null;
  if (!user) return null;

  const rawProfile = Array.isArray(user.academic_profile)
    ? user.academic_profile[0] || null
    : user.academic_profile || null;

  const fullName = user.full_name || rawProfile?.full_name || 'Sinh viên';
  const avatarUrl = user.avatar_url ?? rawProfile?.avatar_url ?? null;
  const studentCode = rawProfile?.student_code ?? rawProfile?.student_id ?? null;

  return {
    ...user,
    full_name: fullName,
    avatar_url: avatarUrl,
    academic_profile: rawProfile
      ? {
          ...rawProfile,
          student_code: studentCode,
          student_id: studentCode,
        }
      : null,
  };
}
