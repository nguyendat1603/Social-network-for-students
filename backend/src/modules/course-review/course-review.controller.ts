import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../common/utils/response.util';
import { courseReviewService } from './course-review.service';
import { createCourseReviewSchema } from './course-review.validation';

export class CourseReviewController {
  async listDirectory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const facultyId = req.query.facultyId as string | undefined;
      const result = await courseReviewService.listDirectory(facultyId);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async getCourseDetail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const courseCode = String(req.params.courseCode);
      const detail = await courseReviewService.getCourseReviewDetail(
        courseCode,
        req.user?.role
      );
      sendSuccess(res, detail);
    } catch (err) {
      next(err);
    }
  }

  async createReview(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const input = createCourseReviewSchema.parse(req.body);
      const result = await courseReviewService.createReview(
        req.user!.userId,
        input,
        req.user!.role
      );
      sendSuccess(res, result, null, 201);
    } catch (err) {
      next(err);
    }
  }

  async searchForum(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await courseReviewService.searchSubjectForum(
        {
          courseCode: req.query.courseCode as string | undefined,
          courseId: req.query.courseId as string | undefined,
          q: req.query.q as string | undefined,
          onlyAccepted: req.query.onlyAccepted === 'true',
          page: req.query.page ? Number(req.query.page) : 1,
          limit: req.query.limit ? Number(req.query.limit) : 20,
        },
        req.user?.role
      );
      sendSuccess(res, result.items, result.meta);
    } catch (err) {
      next(err);
    }
  }
}

export const courseReviewController = new CourseReviewController();
