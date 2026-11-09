import { Router } from 'express';
import { authMiddleware } from '../../common/middlewares/auth.middleware';
import { verifiedStudentMiddleware } from '../../common/middlewares/verified-student.middleware';
import { resourceHubController } from './resource-hub.controller';

const router = Router();

// Public / Authenticated Resource Browsing & Hierarchy Tree
router.get('/hierarchy', (req, res, next) =>
  resourceHubController.getHierarchy(req, res, next)
);
router.get('/', (req, res, next) =>
  resourceHubController.listResources(req, res, next)
);
router.get('/:docId', (req, res, next) =>
  resourceHubController.getDetail(req, res, next)
);

// Protected Verified Student Upload, Download & Reliability Voting
router.post(
  '/upload',
  authMiddleware,
  verifiedStudentMiddleware,
  (req, res, next) => resourceHubController.uploadResource(req, res, next)
);

router.post(
  '/:docId/download',
  authMiddleware,
  verifiedStudentMiddleware,
  (req, res, next) => resourceHubController.downloadResource(req, res, next)
);

router.post(
  '/:docId/vote',
  authMiddleware,
  verifiedStudentMiddleware,
  (req, res, next) => resourceHubController.voteResource(req, res, next)
);

export const resourceHubRoutes = router;
