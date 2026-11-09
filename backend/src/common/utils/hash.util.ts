import crypto from 'crypto';

const SCRYPT_KEYLEN = 64;

export function hashPassword(plainText: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto
    .scryptSync(plainText, salt, SCRYPT_KEYLEN)
    .toString('hex');
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(plainText: string, storedHash: string): boolean {
  const [salt, keyHex] = storedHash.split(':');
  if (!salt || !keyHex) return false;
  const keyBuffer = Buffer.from(keyHex, 'hex');
  const derivedBuffer = crypto.scryptSync(plainText, salt, SCRYPT_KEYLEN);
  if (keyBuffer.length !== derivedBuffer.length) return false;
  return crypto.timingSafeEqual(keyBuffer, derivedBuffer);
}

export function sha256Hash(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}
