import { apiRequest } from './api.client';
import {
  GenderPreference,
  HousingListing,
  HousingListingType,
  HousingStatus,
  ItemCategory,
  ItemCondition,
  ItemStatus,
  MarketplaceItem,
  SleepScheduleHabit,
} from '../types/marketplace.types';

export const marketplaceService = {
  listItems(params?: {
    category?: ItemCategory;
    condition?: ItemCondition;
    courseId?: number;
    maxPriceVnd?: number;
    onlyFree?: boolean;
    status?: ItemStatus;
    search?: string;
  }) {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', params.category);
    if (params?.condition) qs.set('condition', params.condition);
    if (params?.courseId) qs.set('courseId', String(params.courseId));
    if (params?.maxPriceVnd !== undefined) {
      qs.set('maxPriceVnd', String(params.maxPriceVnd));
    }
    if (params?.onlyFree) qs.set('onlyFree', 'true');
    if (params?.status) qs.set('status', params.status);
    if (params?.search) qs.set('search', params.search);

    const queryStr = qs.toString() ? `?${qs.toString()}` : '';
    return apiRequest<MarketplaceItem[]>(`/marketplace/items${queryStr}`);
  },

  createItem(payload: {
    title: string;
    description: string;
    category: ItemCategory;
    courseId?: number | null;
    priceVnd: number;
    isFree: boolean;
    condition: ItemCondition;
    pickupLocation?: string;
    imageUrls?: string[];
  }) {
    return apiRequest<MarketplaceItem>('/marketplace/items', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateItemStatus(itemId: string, status: ItemStatus) {
    return apiRequest<MarketplaceItem>(`/marketplace/items/${itemId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  listHousing(params?: {
    listingType?: HousingListingType;
    maxBudgetVnd?: number;
    maxDistanceKm?: number;
    sleepSchedule?: SleepScheduleHabit;
    smokingAllowed?: boolean;
    cookingAllowed?: boolean;
    genderPreference?: GenderPreference;
    status?: HousingStatus;
    search?: string;
  }) {
    const qs = new URLSearchParams();
    if (params?.listingType) qs.set('listingType', params.listingType);
    if (params?.maxBudgetVnd !== undefined) {
      qs.set('maxBudgetVnd', String(params.maxBudgetVnd));
    }
    if (params?.maxDistanceKm !== undefined) {
      qs.set('maxDistanceKm', String(params.maxDistanceKm));
    }
    if (params?.sleepSchedule) qs.set('sleepSchedule', params.sleepSchedule);
    if (params?.smokingAllowed !== undefined) {
      qs.set('smokingAllowed', String(params.smokingAllowed));
    }
    if (params?.cookingAllowed !== undefined) {
      qs.set('cookingAllowed', String(params.cookingAllowed));
    }
    if (params?.genderPreference) {
      qs.set('genderPreference', params.genderPreference);
    }
    if (params?.status) qs.set('status', params.status);
    if (params?.search) qs.set('search', params.search);

    const queryStr = qs.toString() ? `?${qs.toString()}` : '';
    return apiRequest<HousingListing[]>(`/marketplace/housing${queryStr}`);
  },

  createHousingListing(payload: {
    listingType: HousingListingType;
    title: string;
    description: string;
    addressDistrict: string;
    distanceToCampusKm?: number | null;
    monthlyRentVnd: number;
    maxBudgetVnd?: number | null;
    sleepSchedule: SleepScheduleHabit;
    smokingAllowed: boolean;
    cookingAllowed: boolean;
    genderPreference: GenderPreference;
  }) {
    return apiRequest<HousingListing>('/marketplace/housing', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateHousingStatus(listingId: string, status: HousingStatus) {
    return apiRequest<HousingListing>(
      `/marketplace/housing/${listingId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
  },
};
