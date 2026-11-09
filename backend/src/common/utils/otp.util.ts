import crypto from 'crypto';
import { sha256Hash } from './hash.util';

export function generateSixDigitOtp(): string {
  return crypto.randomInt(100000, 999999 + 1).toString();
}

export function hashOtpCode(otpCode: string, email: string): string {
  return sha256Hash(`${email.toLowerCase().trim()}:${otpCode.trim()}`);
}

export function verifyOtpCodeHash(
  otpCode: string,
  email: string,
  expectedHash: string
): boolean {
  const actualHash = hashOtpCode(otpCode, email);
  const actualBuf = Buffer.from(actualHash, 'hex');
  const expectedBuf = Buffer.from(expectedHash, 'hex');
  if (actualBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(actualBuf, expectedBuf);
}
