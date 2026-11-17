import {
  UserRole,
  VerificationProvider,
} from '../../../common/constants/roles.constant';
import { AppError } from '../../../common/utils/response.util';
import { identityRepository } from '../identity.repository';
import { SchoolSsoInput, UserRecord } from '../identity.types';
import {
  assertValidEduEmail,
  extractStudentCodeFromEmail,
} from '../identity.validation';
import { anonymousHandleService } from '../services/anonymous-handle.service';

export class SchoolSsoOAuth2Strategy {
  /**
   * Authenticates or provisions a student via University OAuth2 SSO.
   * Blocks unverified client-supplied identity assertions unless explicitly enabled
   * for isolated local development (`ALLOW_UNVERIFIED_DEV_SSO=true`).
   */
  async authenticateWithSchoolSso(input: SchoolSsoInput): Promise<{
    user: UserRecord;
    anonymousHandle: string;
    isNewAccount: boolean;
  }> {
    const isDevSsoAllowed =
      process.env.NODE_ENV !== 'production' &&
      process.env.ALLOW_UNVERIFIED_DEV_SSO === 'true';

    if (!isDevSsoAllowed) {
      throw new AppError(
        'Đăng nhập SSO trường học chưa được cấu hình với nhà cung cấp xác thực (OAuth2 Identity Provider). Vui lòng sử dụng Email sinh viên & Mật khẩu.',
        501,
        'SSO_NOT_CONFIGURED'
      );
    }

    assertValidEduEmail(input.email);

    let user = await identityRepository.findUserByEmail(input.email);
    let isNewAccount = false;
    const nowIso = new Date().toISOString();

    if (!user) {
      isNewAccount = true;
      user = await identityRepository.createUser({
        email: input.email,
        passwordHash: null,
        role: UserRole.VERIFIED_STUDENT,
        isVerifiedStudent: true,
        verifiedAt: nowIso,
      });
    } else {
      if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
        throw new AppError(
          'Tài khoản đã bị tạm khóa hoặc đình chỉ hoạt động.',
          403,
          'ACCOUNT_SUSPENDED'
        );
      }
      if (!user.is_verified_student) {
        user = await identityRepository.markUserVerifiedStudent(user.id);
      } else {
        await identityRepository.updateLastLogin(user.id);
      }
    }

    await identityRepository.createVerificationRecord({
      userId: user.id,
      eduEmail: input.email,
      otpHash: null,
      provider: VerificationProvider.SSO_OAUTH2,
      ssoSubjectId: input.ssoSubjectId,
      expiresAt: nowIso,
      maxAttempts: 1,
      verifiedAt: nowIso,
    });

    let profile = await identityRepository.findProfileByUserId(user.id);
    if (!profile) {
      const generatedHandle =
        await anonymousHandleService.generateUniqueAnonymousHandle();
      const extractedMssv = extractStudentCodeFromEmail(input.email);
      profile = await identityRepository.createAcademicProfile({
        userId: user.id,
        fullName: input.fullName,
        anonymousHandle: generatedHandle,
        studentCode: extractedMssv,
        avatarUrl: input.avatarUrl ?? null,
      });
    }

    return {
      user,
      anonymousHandle: profile.anonymous_handle,
      isNewAccount,
    };
  }
}

export const schoolSsoOAuth2Strategy = new SchoolSsoOAuth2Strategy();
