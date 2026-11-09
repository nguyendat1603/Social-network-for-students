import { Router } from 'express';
import { authMiddleware } from '../../common/middlewares/auth.middleware';
import { marketplaceController } from './marketplace.controller';

const router = Router();

router.use(authMiddleware);

router.get('/items', (req, res, next) => marketplaceController.listItems(req, res, next));
router.post('/items', (req, res, next) => marketplaceController.createItem(req, res, next));
router.patch('/items/:itemId/status', (req, res, next) =>
  marketplaceController.updateItemStatus(req, res, next)
);

router.get('/housing', (req, res, next) => marketplaceController.listHousing(req, res, next));
router.post('/housing', (req, res, next) =>
  marketplaceController.createHousingListing(req, res, next)
);
router.patch('/housing/:listingId/status', (req, res, next) =>
  marketplaceController.updateHousingStatus(req, res, next)
);

export const marketplaceRoutes = router;
