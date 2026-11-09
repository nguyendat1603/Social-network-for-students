import { Router } from 'express';
import { authMiddleware } from '../../common/middlewares/auth.middleware';
import { studyGroupController } from './study-group.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', (req, res, next) => studyGroupController.listStudyGroups(req, res, next));
router.post('/', (req, res, next) => studyGroupController.createStudyGroup(req, res, next));
router.post('/:groupId/apply', (req, res, next) =>
  studyGroupController.applyToStudyGroup(req, res, next)
);
router.patch('/:groupId/applications/:applicationId', (req, res, next) =>
  studyGroupController.reviewApplication(req, res, next)
);
router.get('/:groupId/workspace', (req, res, next) =>
  studyGroupController.getWorkspace(req, res, next)
);
router.post('/:groupId/tasks', (req, res, next) =>
  studyGroupController.createKanbanTask(req, res, next)
);
router.patch('/:groupId/tasks/:taskId', (req, res, next) =>
  studyGroupController.updateKanbanTask(req, res, next)
);
router.delete('/:groupId/tasks/:taskId', (req, res, next) =>
  studyGroupController.deleteKanbanTask(req, res, next)
);
router.post('/:groupId/documents', (req, res, next) =>
  studyGroupController.uploadGroupDocument(req, res, next)
);

export const studyGroupRoutes = router;
