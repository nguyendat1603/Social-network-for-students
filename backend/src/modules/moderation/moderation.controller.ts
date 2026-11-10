import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../common/utils/response.util';
import { AppError } from '../../common/errors/app.error';
import { moderationService } from './moderation.service';
import {
  validateExecuteModerationAction,
  validateKarmaLeaderboardQuery,
  validateModerationQueueQuery,
  validateResolveReport,
  validateSubmitReport,
} from './moderation.validation';

export class ModerationController {
  async getMyKarma(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data = await moderationService.getMyKarma(userId);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async getMyPrivileges(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data = await moderationService.getMyPrivileges(userId);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async getLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const query = validateKarmaLeaderboardQuery(req.query);
      const data = await moderationService.getLeaderboard(query);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async submitReport(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const dto = validateSubmitReport(req.body);
      const data = await moderationService.submitReport(userId, dto);
      sendSuccess(res, data, null, 201);
    } catch (error) {
      next(error);
    }
  }

  async getModerationQueue(req: Request, res: Response, next: NextFunction) {
    try {
      const userRole = req.user!.role;
      if (userRole !== 'ADMIN' && userRole !== 'MODERATOR') {
        throw new AppError('Chỉ Quản trị viên / Kiểm duyệt viên mới có quyền xem hàng đợi.', 403, 'FORBIDDEN');
      }

      const query = validateModerationQueueQuery(req.query);
      const { items, total, page, limit } = await moderationService.getModerationQueue(query);
      sendSuccess(res, items, { total, page, limit });
    } catch (error) {
      next(error);
    }
  }

  async resolveReports(req: Request, res: Response, next: NextFunction) {
    try {
      const moderatorId = req.user!.userId;
      const userRole = req.user!.role;
      if (userRole !== 'ADMIN' && userRole !== 'MODERATOR') {
        throw new AppError('Chỉ Quản trị viên / Kiểm duyệt viên mới có quyền xử lý báo cáo.', 403, 'FORBIDDEN');
      }

      const targetType = String(req.params.targetType);
      const targetId = String(req.params.targetId);
      const dto = validateResolveReport(req.body);
      const data = await moderationService.resolveReports(
        moderatorId,
        targetType,
        targetId,
        dto
      );
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async executeDirectAction(req: Request, res: Response, next: NextFunction) {
    try {
      const moderatorId = req.user!.userId;
      const userRole = req.user!.role;
      if (userRole !== 'ADMIN' && userRole !== 'MODERATOR') {
        throw new AppError('Chỉ Quản trị viên mới có quyền thi hành chế tài.', 403, 'FORBIDDEN');
      }

      const dto = validateExecuteModerationAction(req.body);
      const data = await moderationService.executeDirectAction(moderatorId, dto);
      sendSuccess(res, data, null, 201);
    } catch (error) {
      next(error);
    }
  }

  async listModerationActions(req: Request, res: Response, next: NextFunction) {
    try {
      const userRole = req.user!.role;
      if (userRole !== 'ADMIN' && userRole !== 'MODERATOR') {
        throw new AppError('Chỉ Quản trị viên mới có quyền xem nhật ký kỷ luật.', 403, 'FORBIDDEN');
      }

      const data = await moderationService.listModerationActions();
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async getAutoModSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await moderationService.getAutoModSettings();
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async updateAutoModSetting(req: Request, res: Response, next: NextFunction) {
    try {
      const userRole = req.user!.role;
      if (userRole !== 'ADMIN' && userRole !== 'MODERATOR') {
        throw new AppError('Chỉ Quản trị viên mới có quyền cập nhật ngưỡng tự động.', 403, 'FORBIDDEN');
      }

      const reasonCode = String(req.params.reasonCode);
      const thresholdCount = Number(req.body.thresholdCount || 5);
      const isEnabled = req.body.isEnabled !== undefined ? Boolean(req.body.isEnabled) : true;

      const data = await moderationService.updateAutoModSetting(
        reasonCode,
        thresholdCount,
        isEnabled
      );
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }
}

export const moderationController = new ModerationController();
