import { Router } from 'express';
import { authMiddleware } from '../../common/middlewares/auth.middleware';
import { moderationController } from './moderation.controller';

const router = Router();

router.use(authMiddleware);

// Karma & Privileges (Student-facing)
router.get('/karma/me', (req, res, next) =>
  moderationController.getMyKarma(req, res, next)
);
router.get('/karma/privileges', (req, res, next) =>
  moderationController.getMyPrivileges(req, res, next)
);
router.get('/karma/leaderboard', (req, res, next) =>
  moderationController.getLeaderboard(req, res, next)
);

// Reporting (Student-facing)
router.post('/reports', (req, res, next) =>
  moderationController.submitReport(req, res, next)
);

// Admin & Moderator Queue & Actions
router.get('/admin/queue', (req, res, next) =>
  moderationController.getModerationQueue(req, res, next)
);
router.patch('/admin/queue/:targetType/:targetId/resolve', (req, res, next) =>
  moderationController.resolveReports(req, res, next)
);
router.post('/admin/actions', (req, res, next) =>
  moderationController.executeDirectAction(req, res, next)
);
router.get('/admin/actions', (req, res, next) =>
  moderationController.listModerationActions(req, res, next)
);
router.get('/admin/settings', (req, res, next) =>
  moderationController.getAutoModSettings(req, res, next)
);
router.patch('/admin/settings/:reasonCode', (req, res, next) =>
  moderationController.updateAutoModSetting(req, res, next)
);

export const moderationRoutes = router;
