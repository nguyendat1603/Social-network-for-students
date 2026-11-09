import { Router } from 'express';
import { authMiddleware } from '../../common/middlewares/auth.middleware';
import { communicationController } from './communication.controller';

const router = Router();

router.use(authMiddleware);

router.get('/conversations', (req, res, next) =>
  communicationController.listConversations(req, res, next)
);
router.post('/conversations/direct', (req, res, next) =>
  communicationController.startDirectConversation(req, res, next)
);
router.get('/conversations/:conversationId/messages', (req, res, next) =>
  communicationController.listMessages(req, res, next)
);
router.post('/conversations/:conversationId/messages', (req, res, next) =>
  communicationController.sendMessage(req, res, next)
);

router.get('/notifications', (req, res, next) =>
  communicationController.listNotifications(req, res, next)
);
router.patch('/notifications/read', (req, res, next) =>
  communicationController.markNotificationsRead(req, res, next)
);

export const communicationRoutes = router;
