import { AppError } from '../../../common/utils/response.util';
import { identityRepository } from '../identity.repository';
import { UpdateAcademicProfileInput } from '../identity.types';

export class AcademicProfileService {
  /**
   * Retrieves the full Academic Profile of a user along with their skills and verification status.
   * Masks `anonymous_handle` if viewed by another regular student (only the owner sees their own anonymous handle in their profile).
   */
  async getAcademicProfile(targetUserId: string, viewerUserId?: string) {
    const [user, profile, skills] = await Promise.all([
      identityRepository.findUserById(targetUserId),
      identityRepository.findProfileByUserId(targetUserId),
      identityRepository.listSkillsByUserId(targetUserId),
    ]);

    if (!user || !profile) {
      throw new AppError(
        'Không tìm thấy hồ sơ học thuật của sinh viên này.',
        404,
        'ACADEMIC_PROFILE_NOT_FOUND'
      );
    }

    const isOwner = viewerUserId === targetUserId;

    return {
      userId: user.id,
      email: isOwner ? user.email : undefined,
      role: user.role,
      isVerifiedStudent: user.is_verified_student,
      verifiedAt: user.verified_at,
      karmaPoints: user.karma_points,
      studentCode: profile.student_code,
      fullName: profile.full_name,
      avatarUrl: profile.avatar_url,
      facultyId: profile.faculty_id,
      faculty: profile.faculty || null,
      major: profile.major,
      cohort: profile.cohort,
      className: profile.class_name,
      careerGoal: profile.career_goal,
      bio: profile.bio,
      // Only expose the link between real identity and anonymous handle to the profile owner
      anonymousHandle: isOwner ? profile.anonymous_handle : undefined,
      anonymousAvatar: isOwner ? profile.anonymous_avatar : undefined,
      anonymousLastChangedAt: isOwner
        ? profile.anonymous_last_changed_at
        : undefined,
      skills: skills.map((s) => ({
        id: s.id,
        skillName: s.skill_name,
        category: s.category,
        proficiencyLevel: s.proficiency_level,
      })),
      updatedAt: profile.updated_at,
    };
  }

  /**
   * Updates Academic Profile fields (MSSV, cohort, faculty, major, class, career goal, skills).
   */
  async updateAcademicProfile(
    userId: string,
    input: UpdateAcademicProfileInput
  ) {
    const existingProfile = await identityRepository.findProfileByUserId(userId);
    if (!existingProfile) {
      throw new AppError(
        'Không tìm thấy hồ sơ học thuật để cập nhật.',
        404,
        'ACADEMIC_PROFILE_NOT_FOUND'
      );
    }

    if (
      input.studentCode &&
      input.studentCode.trim() !== existingProfile.student_code
    ) {
      const duplicateMssv = await identityRepository.findProfileByStudentCode(
        input.studentCode
      );
      if (duplicateMssv && duplicateMssv.user_id !== userId) {
        throw new AppError(
          `Mã số sinh viên "${input.studentCode}" đã được đăng ký bởi một tài khoản khác.`,
          409,
          'DUPLICATE_STUDENT_CODE'
        );
      }
    }

    const updateFields: Record<string, unknown> = {};
    if (input.studentCode !== undefined)
      updateFields.student_code = input.studentCode;
    if (input.fullName !== undefined) updateFields.full_name = input.fullName;
    if (input.avatarUrl !== undefined) updateFields.avatar_url = input.avatarUrl;
    if (input.facultyId !== undefined) updateFields.faculty_id = input.facultyId;
    if (input.major !== undefined) updateFields.major = input.major;
    if (input.cohort !== undefined) updateFields.cohort = input.cohort;
    if (input.className !== undefined) updateFields.class_name = input.className;
    if (input.careerGoal !== undefined)
      updateFields.career_goal = input.careerGoal;
    if (input.bio !== undefined) updateFields.bio = input.bio;

    if (Object.keys(updateFields).length > 0) {
      await identityRepository.updateAcademicProfile(userId, updateFields);
    }

    if (input.skills !== undefined) {
      await identityRepository.replaceUserSkills(userId, input.skills);
    }

    return this.getAcademicProfile(userId, userId);
  }
}

export const academicProfileService = new AcademicProfileService();
