export enum UserRole {
  UNVERIFIED_USER = 'UNVERIFIED_USER',
  VERIFIED_STUDENT = 'VERIFIED_STUDENT',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  WARNED = 'WARNED',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
}

export enum VerificationProvider {
  EDU_OTP = 'EDU_OTP',
  SSO_OAUTH2 = 'SSO_OAUTH2',
}

export enum SkillCategory {
  TECHNICAL = 'TECHNICAL',
  LANGUAGE = 'LANGUAGE',
  SOFT_SKILL = 'SOFT_SKILL',
}

export enum SkillProficiency {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}
