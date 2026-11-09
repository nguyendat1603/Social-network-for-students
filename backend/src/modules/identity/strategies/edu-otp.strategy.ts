import { envConfig } from '../../../config/env.config';
import { VerificationProvider } from '../../../common/constants/roles.constant';
import {
  generateSixDigitOtp,
  hashOtpCode,
  verifyOtpCodeHash,
} from '../../../common/utils/otp.util';
import { AppError } from '../../../common/utils/response.util';
import { identityRepository } from '../identity.repository';

export class EduOtpStrategy {
  /**
   * Issues a 6-digit OTP code for a school (.edu) email address with 5-minute TTL
   * and enforces a 60-second resend cooldown.
   */
  async issueOtpForUser(
    userId: string,
    eduEmail: string
  ): Promise<{ otpCode: string; expiresAt: string; ttlSeconds: number }> {
    const latestPending =
      await identityRepository.findLatestPendingVerification(userId);

    if (latestPending) {
      const elapsedSeconds =
        (Date.now() - new Date(latestPending.last_sent_at).getTime()) / 1000;
      if (elapsedSeconds < envConfig.otpResendCooldownSeconds) {
        const waitSeconds = Math.ceil(
          envConfig.otpResendCooldownSeconds - elapsedSeconds
        );
        throw new AppError(
          `Vui lòng đợi ${waitSeconds} giây trước khi yêu cầu gửi lại mã OTP.`,
          429,
          'OTP_RESEND_COOLDOWN',
          { retryAfterSeconds: waitSeconds }
        );
      }
    }

    const otpCode = generateSixDigitOtp();
    const otpHash = hashOtpCode(otpCode, eduEmail);
    const expiresAt = new Date(
      Date.now() + envConfig.otpTtlSeconds * 1000
    ).toISOString();

    await identityRepository.createVerificationRecord({
      userId,
      eduEmail,
      otpHash,
      provider: VerificationProvider.EDU_OTP,
      expiresAt,
      maxAttempts: envConfig.otpMaxAttempts,
    });

    return {
      otpCode,
      expiresAt,
      ttlSeconds: envConfig.otpTtlSeconds,
    };
  }

  /**
   * Validates the submitted 6-digit OTP against the latest active verification record.
   */
  async verifyUserOtp(
    userId: string,
    eduEmail: string,
    otpCode: string
  ): Promise<void> {
    const pending =
      await identityRepository.findLatestPendingVerification(userId);

    if (!pending || !pending.otp_hash) {
      throw new AppError(
        'Không tìm thấy yêu cầu xác thực OTP đang chờ. Vui lòng yêu cầu gửi mã mới.',
        404,
        'OTP_NOT_FOUND'
      );
    }

    if (pending.attempts >= pending.max_attempts) {
      throw new AppError(
        'Bạn đã nhập sai OTP quá 5 lần cho phép. Vui lòng yêu cầu gửi mã OTP mới.',
        429,
        'OTP_MAX_ATTEMPTS_EXCEEDED'
      );
    }

    if (new Date(pending.expires_at).getTime() < Date.now()) {
      throw new AppError(
        'Mã OTP đã hết hạn (quá 5 phút). Vui lòng yêu cầu gửi mã OTP mới.',
        410,
        'OTP_EXPIRED'
      );
    }

    const isValid = verifyOtpCodeHash(otpCode, eduEmail, pending.otp_hash);

    if (!isValid) {
      await identityRepository.incrementVerificationAttempt(
        pending.id,
        pending.attempts
      );
      const remaining = Math.max(0, pending.max_attempts - (pending.attempts + 1));
      throw new AppError(
        `Mã OTP không chính xác. Bạn còn ${remaining} lần thử.`,
        400,
        'INVALID_OTP_CODE',
        { remainingAttempts: remaining }
      );
    }

    await identityRepository.markVerificationCompleted(pending.id);
  }
}

export const eduOtpStrategy = new EduOtpStrategy();
