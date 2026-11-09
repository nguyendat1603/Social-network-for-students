export type ItemCategory =
  | 'TEXTBOOK'
  | 'CALCULATOR'
  | 'HARDWARE_KIT'
  | 'DORM_ITEM'
  | 'OTHER';

export type ItemCondition =
  | 'NEW'
  | 'LIKE_NEW_90'
  | 'USED_GOOD'
  | 'SLIGHTLY_DAMAGED';

export type ItemStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD';

export type HousingListingType = 'ROOMMATE_WANTED' | 'ROOM_FOR_RENT';
export type SleepScheduleHabit = 'EARLY_BIRD' | 'NIGHT_OWL' | 'FLEXIBLE';
export type GenderPreference = 'MALE' | 'FEMALE' | 'ANY';
export type HousingStatus = 'OPEN' | 'CLOSED';

export interface MarketplaceItem {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category: ItemCategory;
  course_id?: number | null;
  price_vnd: number;
  is_free: boolean;
  condition: ItemCondition;
  status: ItemStatus;
  pickup_location?: string | null;
  created_at: string;
  seller?: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
    karma_points?: number;
    is_verified_student?: boolean;
    academic_profile?: {
      student_id?: string;
      cohort?: string;
      major?: string;
    };
  };
  course?: {
    id: number;
    code: string;
    name: string;
  } | null;
  images?: Array<{
    id: string;
    image_url: string;
    display_order: number;
  }>;
}

export interface HousingListing {
  id: string;
  poster_id: string;
  listing_type: HousingListingType;
  title: string;
  description: string;
  address_district: string;
  distance_to_campus_km?: number | null;
  monthly_rent_vnd: number;
  max_budget_vnd?: number | null;
  sleep_schedule: SleepScheduleHabit;
  smoking_allowed: boolean;
  cooking_allowed: boolean;
  gender_preference: GenderPreference;
  status: HousingStatus;
  created_at: string;
  poster?: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
    karma_points?: number;
    is_verified_student?: boolean;
    academic_profile?: {
      student_id?: string;
      cohort?: string;
      major?: string;
    };
  };
}
