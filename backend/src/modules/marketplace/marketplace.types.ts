export type ItemCategory =
  | 'TEXTBOOK'
  | 'CALCULATOR'
  | 'HARDWARE_KIT'
  | 'DORM_ITEM'
  | 'OTHER';

export type ItemCondition =
  | 'NEW'
  | 'NEW_100'
  | 'LIKE_NEW_90'
  | 'USED_GOOD'
  | 'GOOD_80'
  | 'SLIGHTLY_DAMAGED';

export type ItemStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD';

export type HousingListingType = 'ROOMMATE_WANTED' | 'ROOM_FOR_RENT';
export type SleepScheduleHabit = 'EARLY_BIRD' | 'NIGHT_OWL' | 'FLEXIBLE';
export type GenderPreference = 'MALE' | 'FEMALE' | 'ANY';
export type HousingStatus = 'OPEN' | 'CLOSED';

export interface CreateMarketplaceItemDTO {
  title: string;
  description: string;
  category: ItemCategory;
  courseId?: string | null;
  priceVnd: number;
  isFree: boolean;
  condition: ItemCondition;
  pickupLocation?: string;
  imageUrls?: string[];
}

export interface MarketplaceItemFilterQuery {
  category?: ItemCategory;
  condition?: ItemCondition;
  courseId?: string;
  maxPriceVnd?: number;
  onlyFree?: boolean;
  status?: ItemStatus;
  search?: string;
}

export interface CreateHousingListingDTO {
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
}

export interface HousingFilterQuery {
  listingType?: HousingListingType;
  maxBudgetVnd?: number;
  maxDistanceKm?: number;
  sleepSchedule?: SleepScheduleHabit;
  smokingAllowed?: boolean;
  cookingAllowed?: boolean;
  genderPreference?: GenderPreference;
  status?: HousingStatus;
  search?: string;
}
