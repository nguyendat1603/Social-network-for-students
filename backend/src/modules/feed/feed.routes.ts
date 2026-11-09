import { Router } from 'express';
import { authMiddleware } from '../../common/middlewares/auth.middleware';
import { verifiedStudentMiddleware } from '../../common/middlewares/verified-student.middleware';
import { feedController } from './feed.controller';

const router = Router();

// Public / Authenticated Contextual Feeds (CAMPUS, DEPARTMENT, COURSE)
router.get('/', (req, res, next) => feedController.listFeed(req, res, next));
router.get('/posts/:postId', (req, res, next) =>
  feedController.getPostDetail(req, res, next)
);

// Protected Verified Student Actions
router.post(
  '/posts',
  authMiddleware,
  verifiedStudentMiddleware,
  (req, res, next) => feedController.createPost(req, res, next)
);

router.post(
  '/posts/:postId/vote',
  authMiddleware,
  verifiedStudentMiddleware,
  (req, res, next) => feedController.votePost(req, res, next)
);

router.post(
  '/posts/:postId/comments',
  authMiddleware,
  verifiedStudentMiddleware,
  (req, res, next) => feedController.createComment(req, res, next)
);

router.post(
  '/comments/:commentId/vote',
  authMiddleware,
  verifiedStudentMiddleware,
  (req, res, next) => feedController.voteComment(req, res, next)
);

router.patch(
  '/posts/:postId/comments/:commentId/accept',
  authMiddleware,
  verifiedStudentMiddleware,
  (req, res, next) => feedController.acceptAnswer(req, res, next)
);

export const feedRoutes = router;
