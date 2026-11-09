import crypto from 'crypto';
import { envConfig } from '../../../config/env.config';
import { AppError } from '../../../common/utils/response.util';
import { identityRepository } from '../identity.repository';

const ADJECTIVES = [
  'BachKhoa',
  'SinhVien',
  'KySu',
  'HocGia',
  'TinhAnh',
  'SangTao',
  'TriThuc',
  'TienPhong',
];

export class AnonymousHandleService {
  /**
   * Generates a unique default anonymous handle (e.g., `SinhVienAnDanh_4829`)
   * for newly registered students.
   */
  async generateUniqueAnonymousHandle(): Promise<string> {
    for (let attempt = 0; attempt < 10; attempt++) {
      const prefix = ADJECTIVES[crypto.randomInt(0, ADJECTIVES.length)];
      const suffix = crypto.randomInt(1000, 99999);
      const candidate = `${prefix}AnDanh_${suffix}`;
      const existing =
        await identityRepository.findProfileByAnonymousHandle(candidate);
      if (!existing) {
        return candidate;
      }
    }
    return `SinhVienAnDanh_${Date.now().toString().slice(-6)}`;
  }

  /**
   * Updates a student's `anonymous_handle` while enforcing:
   * 1. Anti-self-doxing check (cannot contain student's own MSSV).
   * 2. Global uniqueness across `academic_profiles`.
   * 3. 30-day cooldown between changes.
   */
  async updateAnonymousHandle(
    userId: string,
    newHandle: string,
    anonymousAvatar?: string | null
  ) {
    const profile = await identityRepository.findProfileByUserId(userId);
    if (!profile) {
      throw new AppError(
        'Không tìm thấy hồ sơ học thuật của sinh viên.',
        404,
        'PROFILE_NOT_FOUND'
      );
    }

    const normalizedHandle = newHandle.trim();

    if (profile.anonymous_handle === normalizedHandle) {
      if (anonymousAvatar !== undefined) {
        return identityRepository.updateAcademicProfile(userId, {
          anonymous_avatar: anonymousAvatar,
        });
      }
      return profile;
    }

    if (
      profile.student_code &&
      normalizedHandle.toLowerCase().includes(profile.student_code.toLowerCase())
    ) {
      throw new AppError(
        'Biệt danh ẩn danh không được chứa Mã số sinh viên (MSSV) thật của bạn để đảm bảo tính ẩn danh.',
        400,
        'ANONYMOUS_HANDLE_CONTAINS_MSSV'
      );
    }

    if (profile.anonymous_last_changed_at) {
      const lastChangedMs = new Date(
        profile.anonymous_last_changed_at
      ).getTime();
      const cooldownMs =
        envConfig.anonymousHandleCooldownDays * 24 * 60 * 60 * 1000;
      const elapsedMs = Date.now() - lastChangedMs;

      if (elapsedMs < cooldownMs) {
        const remainingDays = Math.ceil(
          (cooldownMs - elapsedMs) / (24 * 60 * 60 * 1000)
        );
        throw new AppError(
          `Bạn chỉ có thể đổi biệt danh ẩn danh mỗi ${envConfig.anonymousHandleCooldownDays} ngày/lần. Còn ${remainingDays} ngày nữa mới có thể đổi tiếp.`,
          429,
          'ANONYMOUS_HANDLE_COOLDOWN_ACTIVE',
          { remainingDays }
        );
      }
    }

    const existing =
      await identityRepository.findProfileByAnonymousHandle(normalizedHandle);
    if (existing && existing.user_id !== userId) {
      throw new AppError(
        `Biệt danh ẩn danh "${normalizedHandle}" đã được sử dụng. Vui lòng chọn biệt danh khác.`,
        409,
        'ANONYMOUS_HANDLE_TAKEN'
      );
    }

    const updatePayload: Record<string, unknown> = {
      anonymous_handle: normalizedHandle,
      anonymous_last_changed_at: new Date().toISOString(),
    };

    if (anonymousAvatar !== undefined) {
      updatePayload.anonymous_avatar = anonymousAvatar;
    }

    return identityRepository.updateAcademicProfile(userId, updatePayload);
  }
}

export const anonymousHandleService = new AnonymousHandleService();
