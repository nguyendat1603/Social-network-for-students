import { itemListingService } from './services/item-listing.service';
import { housingRoommateService } from './services/housing-roommate.service';
import {
  HousingFilterQuery,
  MarketplaceItemFilterQuery,
} from './marketplace.types';

export class MarketplaceRepository {
  async listItems(filters: MarketplaceItemFilterQuery) {
    return itemListingService.listItems(filters);
  }

  async listHousing(filters: HousingFilterQuery) {
    return housingRoommateService.listHousing(filters);
  }
}

export const marketplaceRepository = new MarketplaceRepository();
