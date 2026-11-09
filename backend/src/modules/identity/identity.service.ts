import { envConfig } from '../../config/env.config';
import { UserRole } from '../../common/constants/roles.constant';
import { hashPassword, verifyPassword } from '../../common/utils/hash.util';
import {
  JwtUserPayload,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../common/utils/jwt.util';
import { AppError } from '../../common/utils/response.util';
import { identityRepository } from './identity.repository';
import {
  LoginInput,
  RegisterEduInput,
  SchoolSsoInput,
  UpdateAcademicProfileInput,
  VerifyOtpInput,
} from './identity.types';
import {
  assertValidEduEmail,
  extractStudentCodeFromEmail,
} from './identity.validation';
import { eduOtpStrategy } from './strategies/edu-otp.strategy';
import { schoolSsoOAuth2Strategy } from './strategies/school-sso-oauth2.strategy';
import { academicProfileService } from './services/academic-profile.service';
import { anonymousHandleService } from './services/anonymous-handle.service';

export class IdentityService {
  /**
   * 1. Registers a new student with a university (.edu) email and issues a 6-digit OTP.
   */
  async registerWithEduEmail(input: RegisterEduInput) {
    assertValidEduEmail(input.email);

    const existingUser = await identityRepository.findUserByEmail(input.email);
    if (existingUser && existingUser.is_verified_student) {
      throw new AppError(
        `Email sinh viên "${input.email}" đã được đăng ký và xác thực trước đó.`,
        409,
        'EDU_EMAIL_ALREADY_REGISTERED'
      );
    }

    const inferredStudentCode =
      input.studentCode?.trim() || extractStudentCodeFromEmail(input.email);

    if (inferredStudentCode) {
      const existingMssv =
        await identityRepository.findProfileByStudentCode(inferredStudentCode);
      if (existingMssv && (!existingUser || existingMssv.user_id !== existingUser.id)) {
        throw new AppError(
          `Mã số sinh viên "${inferredStudentCode}" đã tồn tại trên hệ thống.`,
          409,
          'DUPLICATE_STUDENT_CODE'
        );
      }
    }

    const passwordHash = hashPassword(input.password);
    let user = existingUser;

    if (!user) {
      user = await identityRepository.createUser({
        email: input.email,
        passwordHash,
        role: UserRole.UNVERIFIED_USER,
        isVerifiedStudent: false,
      });

      const generatedAnonymousHandle =
        await anonymousHandleService.generateUniqueAnonymousHandle();

      await identityRepository.createAcademicProfile({
        userId: user.id,
        fullName: input.fullName,
        anonymousHandle: generatedAnonymousHandle,
        studentCode: inferredStudentCode,
        facultyId: input.facultyId ?? null,
        cohort: input.cohort ?? null,
        major: input.major ?? null,
        className: input.className ?? null,
      });
    }

    const otpResult = await eduOtpStrategy.issueOtpForUser(
      user.id,
      input.email
    );

    return {
      userId: user.id,
      email: user.email,
      inferredStudentCode,
      isVerifiedStudent: false,
      otpExpiresAt: otpResult.expiresAt,
      otpTtlSeconds: otpResult.ttlSeconds,
      // In development/demo mode, return otpPreview so the user can test immediately without an SMTP server
      ...(envConfig.nodeEnv !== 'production'
        ? { devOtpPreview: otpResult.otpCode }
        : {}),
    };
  }

  /**
   * 2. Verifies the 6-digit OTP and activates the "Verified Student" badge.
   */
  async verifyEduOtp(input: VerifyOtpInput) {
    assertValidEduEmail(input.email);

    const user = await identityRepository.findUserByEmail(input.email);
    if (!user) {
      throw new AppError(
        'Không tìm thấy tài khoản ứng với email này.',
        404,
        'USER_NOT_FOUND'
      );
    }

    await eduOtpStrategy.verifyUserOtp(user.id, input.email, input.otpCode);

    const verifiedUser = await identityRepository.markUserVerifiedStudent(
      user.id
    );
    const profile = await identityRepository.findProfileByUserId(user.id);

    const jwtPayload: JwtUserPayload = {
      userId: verifiedUser.id,
      email: verifiedUser.email,
      role: verifiedUser.role,
      isVerifiedStudent: verifiedUser.is_verified_student,
      anonymousHandle: profile?.anonymous_handle,
    };

    const accessToken = signAccessToken(jwtPayload);
    const refreshToken = signRefreshToken(jwtPayload);
    const fullProfile = await academicProfileService.getAcademicProfile(
      verifiedUser.id,
      verifiedUser.id
    );

    return {
      accessToken,
      refreshToken,
      user: fullProfile,
    };
  }

  /**
   * 3. Resends a new 6-digit OTP (respecting the 60s cooldown).
   */
  async resendEduOtp(email: string) {
    assertValidEduEmail(email);

    const user = await identityRepository.findUserByEmail(email);
    if (!user) {
      throw new AppError(
        'Không tìm thấy tài khoản với email này.',
        404,
        'USER_NOT_FOUND'
      );
    }

    if (user.is_verified_student) {
      throw new AppError(
        'Tài khoản này đã được xác thực Verified Student.',
        400,
        'ALREADY_VERIFIED_STUDENT'
      );
    }

    const otpResult = await eduOtpStrategy.issueOtpForUser(user.id, email);
    return {
      email: user.email,
      otpExpiresAt: otpResult.expiresAt,
      otpTtlSeconds: otpResult.ttlSeconds,
      ...(envConfig.nodeEnv !== 'production'
        ? { devOtpPreview: otpResult.otpCode }
        : {}),
    };
  }

  /**
   * 4. Logs in with email & password.
   */
  async login(input: LoginInput) {
    const user = await identityRepository.findUserByEmail(input.email);
    if (!user || !user.password_hash) {
      throw new AppError(
        'Email hoặc mật khẩu không chính xác.',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    const isPasswordValid = verifyPassword(input.password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError(
        'Email hoặc mật khẩu không chính xác.',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    await identityRepository.updateLastLogin(user.id);
    const profile = await identityRepository.findProfileByUserId(user.id);

    const jwtPayload: JwtUserPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      isVerifiedStudent: user.is_verified_student,
      anonymousHandle: profile?.anonymous_handle,
    };

    const accessToken = signAccessToken(jwtPayload);
    const refreshToken = signRefreshToken(jwtPayload);
    const fullProfile = await academicProfileService.getAcademicProfile(
      user.id,
      user.id
    );

    return {
      accessToken,
      refreshToken,
      user: fullProfile,
    };
  }

  /**
   * 5. School SSO OAuth2 Login / Registration.
   */
  async loginWithSchoolSso(input: SchoolSsoInput) {
    const { user, anonymousHandle, isNewAccount } =
      await schoolSsoOAuth2Strategy.authenticateWithSchoolSso(input);

    const jwtPayload: JwtUserPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      isVerifiedStudent: user.is_verified_student,
      anonymousHandle,
    };

    const accessToken = signAccessToken(jwtPayload);
    const refreshToken = signRefreshToken(jwtPayload);
    const fullProfile = await academicProfileService.getAcademicProfile(
      user.id,
      user.id
    );

    return {
      accessToken,
      refreshToken,
      isNewAccount,
      user: fullProfile,
    };
  }

  /**
   * 6. Refresh JWT tokens.
   */
  async refreshTokens(refreshToken: string) {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await identityRepository.findUserById(decoded.userId);
    if (!user) {
      throw new AppError('Tài khoản không tồn tại.', 401, 'USER_NOT_FOUND');
    }
    const profile = await identityRepository.findProfileByUserId(user.id);

    const payload: JwtUserPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      isVerifiedStudent: user.is_verified_student,
      anonymousHandle: profile?.anonymous_handle,
    };

    return {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    };
  }

  /**
   * 7. Academic Profile & Anonymous Handle Delegation.
   */
  async getProfile(targetUserId: string, viewerUserId?: string) {
    return academicProfileService.getAcademicProfile(
      targetUserId,
      viewerUserId
    );
  }

  async updateProfile(userId: string, input: UpdateAcademicProfileInput) {
    return academicProfileService.updateAcademicProfile(userId, input);
  }

  async updateAnonymousHandle(
    userId: string,
    anonymousHandle: string,
    anonymousAvatar?: string | null
  ) {
    await anonymousHandleService.updateAnonymousHandle(
      userId,
      anonymousHandle,
      anonymousAvatar
    );
    return academicProfileService.getAcademicProfile(userId, userId);
  }

  async getAcademicCatalog() {
    return identityRepository.listFacultiesAndCourses();
  }
}

export const identityService = new IdentityService();
