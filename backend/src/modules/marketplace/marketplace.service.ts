import { itemListingService } from './services/item-listing.service';
import { housingRoommateService } from './services/housing-roommate.service';
import {
  CreateHousingListingDTO,
  CreateMarketplaceItemDTO,
  HousingFilterQuery,
  HousingStatus,
  ItemStatus,
  MarketplaceItemFilterQuery,
} from './marketplace.types';

export class MarketplaceService {
  async listItems(filters: MarketplaceItemFilterQuery) {
    return itemListingService.listItems(filters);
  }

  async createItem(sellerId: string, dto: CreateMarketplaceItemDTO) {
    return itemListingService.createItem(sellerId, dto);
  }

  async updateItemStatus(itemId: string, userId: string, status: ItemStatus) {
    return itemListingService.updateItemStatus(itemId, userId, status);
  }

  async listHousing(filters: HousingFilterQuery) {
    return housingRoommateService.listHousing(filters);
  }

  async createHousingListing(posterId: string, dto: CreateHousingListingDTO) {
    return housingRoommateService.createHousingListing(posterId, dto);
  }

  async updateHousingStatus(listingId: string, userId: string, status: HousingStatus) {
    return housingRoommateService.updateHousingStatus(listingId, userId, status);
  }
}

export const marketplaceService = new MarketplaceService();
