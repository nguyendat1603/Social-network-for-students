import { Router } from 'express';
import { authMiddleware } from '../../common/middlewares/auth.middleware';
import { verifiedStudentMiddleware } from '../../common/middlewares/verified-student.middleware';
import { courseReviewController } from './course-review.controller';

const router = Router();

// Public / Authenticated Directory & Course Review Detail
router.get('/directory', (req, res, next) =>
  courseReviewController.listDirectory(req, res, next)
);
router.get('/courses/:courseCode', (req, res, next) =>
  courseReviewController.getCourseDetail(req, res, next)
);
router.get('/forum/search', (req, res, next) =>
  courseReviewController.searchForum(req, res, next)
);

// Protected Verified Student Review Creation
router.post(
  '/',
  authMiddleware,
  verifiedStudentMiddleware,
  (req, res, next) => courseReviewController.createReview(req, res, next)
);

export const courseReviewRoutes = router;
