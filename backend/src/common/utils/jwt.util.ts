import jwt, { SignOptions } from 'jsonwebtoken';
import { envConfig } from '../../config/env.config';
import { UserRole } from '../constants/roles.constant';

export interface JwtUserPayload {
  userId: string;
  email: string;
  role: UserRole;
  isVerifiedStudent: boolean;
  anonymousHandle?: string;
}

export function signAccessToken(payload: JwtUserPayload): string {
  const options: SignOptions = {
    expiresIn: envConfig.jwtAccessExpiresIn as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, envConfig.jwtAccessSecret, options);
}

export function signRefreshToken(payload: JwtUserPayload): string {
  const options: SignOptions = {
    expiresIn: envConfig.jwtRefreshExpiresIn as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, envConfig.jwtRefreshSecret, options);
}

export function verifyAccessToken(token: string): JwtUserPayload {
  return jwt.verify(token, envConfig.jwtAccessSecret) as JwtUserPayload;
}

export function verifyRefreshToken(token: string): JwtUserPayload {
  return jwt.verify(token, envConfig.jwtRefreshSecret) as JwtUserPayload;
}
