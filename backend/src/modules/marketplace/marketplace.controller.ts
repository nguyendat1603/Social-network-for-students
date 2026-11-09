import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../common/utils/response.util';
import { marketplaceService } from './marketplace.service';
import {
  validateCreateHousingListing,
  validateCreateMarketplaceItem,
  validateUpdateHousingStatus,
  validateUpdateItemStatus,
} from './marketplace.validation';
import {
  GenderPreference,
  HousingListingType,
  HousingStatus,
  ItemCategory,
  ItemCondition,
  ItemStatus,
  SleepScheduleHabit,
} from './marketplace.types';

export class MarketplaceController {
  async listItems(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        category: (req.query.category as ItemCategory) || undefined,
        condition: (req.query.condition as ItemCondition) || undefined,
        courseId: req.query.courseId ? Number(req.query.courseId) : undefined,
        maxPriceVnd: req.query.maxPriceVnd ? Number(req.query.maxPriceVnd) : undefined,
        onlyFree: req.query.onlyFree === 'true' ? true : undefined,
        status: (req.query.status as ItemStatus) || undefined,
        search: typeof req.query.search === 'string' ? req.query.search : undefined,
      };
      const items = await marketplaceService.listItems(filters);
      sendSuccess(res, items);
    } catch (error) {
      next(error);
    }
  }

  async createItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const dto = validateCreateMarketplaceItem(req.body);
      const item = await marketplaceService.createItem(userId, dto);
      sendSuccess(res, item, null, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateItemStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const itemId = String(req.params.itemId);
      const status = validateUpdateItemStatus(req.body);
      const item = await marketplaceService.updateItemStatus(itemId, userId, status);
      sendSuccess(res, item);
    } catch (error) {
      next(error);
    }
  }

  async listHousing(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        listingType: (req.query.listingType as HousingListingType) || undefined,
        maxBudgetVnd: req.query.maxBudgetVnd ? Number(req.query.maxBudgetVnd) : undefined,
        maxDistanceKm: req.query.maxDistanceKm ? Number(req.query.maxDistanceKm) : undefined,
        sleepSchedule: (req.query.sleepSchedule as SleepScheduleHabit) || undefined,
        smokingAllowed:
          req.query.smokingAllowed !== undefined
            ? req.query.smokingAllowed === 'true'
            : undefined,
        cookingAllowed:
          req.query.cookingAllowed !== undefined
            ? req.query.cookingAllowed === 'true'
            : undefined,
        genderPreference: (req.query.genderPreference as GenderPreference) || undefined,
        status: (req.query.status as HousingStatus) || undefined,
        search: typeof req.query.search === 'string' ? req.query.search : undefined,
      };
      const listings = await marketplaceService.listHousing(filters);
      sendSuccess(res, listings);
    } catch (error) {
      next(error);
    }
  }

  async createHousingListing(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const dto = validateCreateHousingListing(req.body);
      const listing = await marketplaceService.createHousingListing(userId, dto);
      sendSuccess(res, listing, null, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateHousingStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const listingId = String(req.params.listingId);
      const status = validateUpdateHousingStatus(req.body);
      const listing = await marketplaceService.updateHousingStatus(listingId, userId, status);
      sendSuccess(res, listing);
    } catch (error) {
      next(error);
    }
  }
}

export const marketplaceController = new MarketplaceController();
