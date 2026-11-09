import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../common/utils/response.util';
import { studyGroupService } from './study-group.service';
import {
  validateApplyToStudyGroup,
  validateCreateGroupDocument,
  validateCreateKanbanTask,
  validateCreateStudyGroup,
  validateReviewApplication,
  validateUpdateKanbanTask,
} from './study-group.validation';
import { TargetGradeGoal } from './study-group.types';

export class StudyGroupController {
  async listStudyGroups(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        courseId: req.query.courseId ? Number(req.query.courseId) : undefined,
        targetGrade: (req.query.targetGrade as TargetGradeGoal) || undefined,
        roleName: typeof req.query.roleName === 'string' ? req.query.roleName : undefined,
        onlyRecruiting:
          req.query.onlyRecruiting !== undefined
            ? req.query.onlyRecruiting === 'true'
            : undefined,
        search: typeof req.query.search === 'string' ? req.query.search : undefined,
      };
      const result = await studyGroupService.listStudyGroups(filters, req.user?.userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async createStudyGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const dto = validateCreateStudyGroup(req.body);
      const group = await studyGroupService.createStudyGroup(userId, dto);
      sendSuccess(res, group, null, 201);
    } catch (error) {
      next(error);
    }
  }

  async applyToStudyGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const groupId = String(req.params.groupId);
      const dto = validateApplyToStudyGroup(req.body);
      const application = await studyGroupService.applyToStudyGroup(groupId, userId, dto);
      sendSuccess(res, application, null, 201);
    } catch (error) {
      next(error);
    }
  }

  async reviewApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const groupId = String(req.params.groupId);
      const applicationId = String(req.params.applicationId);
      const dto = validateReviewApplication(req.body);
      const result = await studyGroupService.reviewApplication(
        groupId,
        applicationId,
        userId,
        dto
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const groupId = String(req.params.groupId);
      const workspace = await studyGroupService.getWorkspace(groupId, userId);
      sendSuccess(res, workspace);
    } catch (error) {
      next(error);
    }
  }

  async createKanbanTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const groupId = String(req.params.groupId);
      const dto = validateCreateKanbanTask(req.body);
      const task = await studyGroupService.createKanbanTask(groupId, userId, dto);
      sendSuccess(res, task, null, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateKanbanTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const groupId = String(req.params.groupId);
      const taskId = String(req.params.taskId);
      const dto = validateUpdateKanbanTask(req.body);
      const task = await studyGroupService.updateKanbanTask(groupId, taskId, userId, dto);
      sendSuccess(res, task);
    } catch (error) {
      next(error);
    }
  }

  async deleteKanbanTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const groupId = String(req.params.groupId);
      const taskId = String(req.params.taskId);
      const result = await studyGroupService.deleteKanbanTask(groupId, taskId, userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async uploadGroupDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const groupId = String(req.params.groupId);
      const dto = validateCreateGroupDocument(req.body);
      const doc = await studyGroupService.uploadGroupDocument(groupId, userId, dto);
      sendSuccess(res, doc, null, 201);
    } catch (error) {
      next(error);
    }
  }
}

export const studyGroupController = new StudyGroupController();
