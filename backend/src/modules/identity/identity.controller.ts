import { Request, Response, NextFunction } from 'express';
import { AppError, sendSuccess } from '../../common/utils/response.util';
import { identityService } from './identity.service';
import {
  loginSchema,
  registerEduSchema,
  resendOtpSchema,
  schoolSsoSchema,
  updateAcademicProfileSchema,
  updateAnonymousHandleSchema,
  verifyOtpSchema,
} from './identity.validation';

export class IdentityController {
  async registerEdu(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const input = registerEduSchema.parse(req.body);
      const result = await identityService.registerWithEduEmail(input);
      sendSuccess(res, result, null, 201);
    } catch (err) {
      next(err);
    }
  }

  async verifyOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const input = verifyOtpSchema.parse(req.body);
      const result = await identityService.verifyEduOtp(input);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async resendOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = resendOtpSchema.parse(req.body);
      const result = await identityService.resendEduOtp(email);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = loginSchema.parse(req.body);
      const result = await identityService.login(input);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async schoolSsoCallback(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const input = schoolSsoSchema.parse(req.body);
      const result = await identityService.loginWithSchoolSso(input);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async refresh(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const refreshToken = req.body?.refreshToken;
      if (!refreshToken || typeof refreshToken !== 'string') {
        throw new AppError(
          'Thiếu refreshToken.',
          400,
          'MISSING_REFRESH_TOKEN'
        );
      }
      const result = await identityService.refreshTokens(refreshToken);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async getMyProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const profile = await identityService.getProfile(userId, userId);
      sendSuccess(res, profile);
    } catch (err) {
      next(err);
    }
  }

  async getProfileByUserId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const targetUserId = String(req.params.userId);
      const viewerUserId = req.user?.userId;
      const profile = await identityService.getProfile(
        targetUserId,
        viewerUserId
      );
      sendSuccess(res, profile);
    } catch (err) {
      next(err);
    }
  }

  async updateMyProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const input = updateAcademicProfileSchema.parse(req.body);
      const updated = await identityService.updateProfile(userId, input);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  }

  async updateAnonymousHandle(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { anonymousHandle, anonymousAvatar } =
        updateAnonymousHandleSchema.parse(req.body);
      const updated = await identityService.updateAnonymousHandle(
        userId,
        anonymousHandle,
        anonymousAvatar
      );
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  }

  async getCatalog(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const catalog = await identityService.getAcademicCatalog();
      sendSuccess(res, catalog);
    } catch (err) {
      next(err);
    }
  }
}

export const identityController = new IdentityController();
