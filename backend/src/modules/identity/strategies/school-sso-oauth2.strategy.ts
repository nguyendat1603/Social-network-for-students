import {
  UserRole,
  VerificationProvider,
} from '../../../common/constants/roles.constant';
import { identityRepository } from '../identity.repository';
import { SchoolSsoInput, UserRecord } from '../identity.types';
import {
  assertValidEduEmail,
  extractStudentCodeFromEmail,
} from '../identity.validation';
import { anonymousHandleService } from '../services/anonymous-handle.service';

export class SchoolSsoOAuth2Strategy {
  /**
   * Authenticates or provisions a student via University OAuth2 SSO
   * and immediately grants the "Verified Student" badge.
   */
  async authenticateWithSchoolSso(input: SchoolSsoInput): Promise<{
    user: UserRecord;
    anonymousHandle: string;
    isNewAccount: boolean;
  }> {
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
    } else if (!user.is_verified_student) {
      user = await identityRepository.markUserVerifiedStudent(user.id);
    } else {
      await identityRepository.updateLastLogin(user.id);
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
