import { AppError } from '../../common/errors/app.error';
import {
  CreateHousingListingDTO,
  CreateMarketplaceItemDTO,
  GenderPreference,
  HousingListingType,
  HousingStatus,
  ItemCategory,
  ItemCondition,
  ItemStatus,
  SleepScheduleHabit,
} from './marketplace.types';

const VALID_CATEGORIES: ItemCategory[] = [
  'TEXTBOOK',
  'CALCULATOR',
  'HARDWARE_KIT',
  'DORM_ITEM',
  'OTHER',
];
const VALID_CONDITIONS: ItemCondition[] = [
  'NEW',
  'LIKE_NEW_90',
  'USED_GOOD',
  'SLIGHTLY_DAMAGED',
];
const VALID_ITEM_STATUSES: ItemStatus[] = ['AVAILABLE', 'RESERVED', 'SOLD'];

const VALID_HOUSING_TYPES: HousingListingType[] = ['ROOMMATE_WANTED', 'ROOM_FOR_RENT'];
const VALID_SLEEP_SCHEDULES: SleepScheduleHabit[] = ['EARLY_BIRD', 'NIGHT_OWL', 'FLEXIBLE'];
const VALID_GENDERS: GenderPreference[] = ['MALE', 'FEMALE', 'ANY'];

export const validateCreateMarketplaceItem = (
  body: Record<string, unknown>
): CreateMarketplaceItemDTO => {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const category = (body.category as ItemCategory) || 'TEXTBOOK';
  const condition = (body.condition as ItemCondition) || 'LIKE_NEW_90';
  const isFree = Boolean(body.isFree);
  const rawPrice = Number(body.priceVnd || 0);
  const priceVnd = isFree ? 0 : Math.max(0, rawPrice);
  const courseId =
    body.courseId !== undefined && body.courseId !== null && body.courseId !== ''
      ? Number(body.courseId)
      : null;
  const pickupLocation =
    typeof body.pickupLocation === 'string' ? body.pickupLocation.trim() : undefined;
  const imageUrls = Array.isArray(body.imageUrls)
    ? body.imageUrls.map((u) => String(u).trim()).filter(Boolean)
    : [];

  if (!title || title.length < 3) {
    throw new AppError('Tên mặt hàng phải từ 3 ký tự trở lên', 400, 'VALIDATION_ERROR');
  }
  if (!description || description.length < 10) {
    throw new AppError('Mô tả mặt hàng phải từ 10 ký tự trở lên', 400, 'VALIDATION_ERROR');
  }
  if (!VALID_CATEGORIES.includes(category)) {
    throw new AppError('Danh mục mặt hàng không hợp lệ', 400, 'VALIDATION_ERROR');
  }
  if (!VALID_CONDITIONS.includes(condition)) {
    throw new AppError('Tình trạng mặt hàng không hợp lệ', 400, 'VALIDATION_ERROR');
  }

  return {
    title,
    description,
    category,
    courseId,
    priceVnd,
    isFree,
    condition,
    pickupLocation,
    imageUrls,
  };
};

export const validateUpdateItemStatus = (body: Record<string, unknown>): ItemStatus => {
  const status = body.status as ItemStatus;
  if (!VALID_ITEM_STATUSES.includes(status)) {
    throw new AppError('Trạng thái mặt hàng không hợp lệ', 400, 'VALIDATION_ERROR');
  }
  return status;
};

export const validateCreateHousingListing = (
  body: Record<string, unknown>
): CreateHousingListingDTO => {
  const listingType = (body.listingType as HousingListingType) || 'ROOMMATE_WANTED';
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const addressDistrict =
    typeof body.addressDistrict === 'string' ? body.addressDistrict.trim() : '';
  const distanceToCampusKm =
    body.distanceToCampusKm !== undefined &&
    body.distanceToCampusKm !== null &&
    body.distanceToCampusKm !== ''
      ? Number(body.distanceToCampusKm)
      : null;
  const monthlyRentVnd = Math.max(0, Number(body.monthlyRentVnd || 0));
  const maxBudgetVnd =
    body.maxBudgetVnd !== undefined && body.maxBudgetVnd !== null && body.maxBudgetVnd !== ''
      ? Number(body.maxBudgetVnd)
      : monthlyRentVnd;
  const sleepSchedule = (body.sleepSchedule as SleepScheduleHabit) || 'FLEXIBLE';
  const smokingAllowed = Boolean(body.smokingAllowed);
  const cookingAllowed = body.cookingAllowed !== undefined ? Boolean(body.cookingAllowed) : true;
  const genderPreference = (body.genderPreference as GenderPreference) || 'ANY';

  if (!VALID_HOUSING_TYPES.includes(listingType)) {
    throw new AppError('Loại tin đăng nhà trọ không hợp lệ', 400, 'VALIDATION_ERROR');
  }
  if (!title || title.length < 5) {
    throw new AppError('Tiêu đề tin đăng phải từ 5 ký tự trở lên', 400, 'VALIDATION_ERROR');
  }
  if (!description || description.length < 10) {
    throw new AppError('Mô tả chi tiết phải từ 10 ký tự trở lên', 400, 'VALIDATION_ERROR');
  }
  if (!addressDistrict) {
    throw new AppError('Vui lòng nhập khu vực / địa chỉ gần trường', 400, 'VALIDATION_ERROR');
  }
  if (monthlyRentVnd <= 0) {
    throw new AppError('Giá thuê / ngân sách hàng tháng phải lớn hơn 0', 400, 'VALIDATION_ERROR');
  }
  if (!VALID_SLEEP_SCHEDULES.includes(sleepSchedule)) {
    throw new AppError('Thói quen giờ giấc không hợp lệ', 400, 'VALIDATION_ERROR');
  }
  if (!VALID_GENDERS.includes(genderPreference)) {
    throw new AppError('Ưu tiên giới tính không hợp lệ', 400, 'VALIDATION_ERROR');
  }

  return {
    listingType,
    title,
    description,
    addressDistrict,
    distanceToCampusKm,
    monthlyRentVnd,
    maxBudgetVnd,
    sleepSchedule,
    smokingAllowed,
    cookingAllowed,
    genderPreference,
  };
};

export const validateUpdateHousingStatus = (body: Record<string, unknown>): HousingStatus => {
  const status = body.status as HousingStatus;
  if (status !== 'OPEN' && status !== 'CLOSED') {
    throw new AppError('Trạng thái tin nhà trọ phải là OPEN hoặc CLOSED', 400, 'VALIDATION_ERROR');
  }
  return status;
};
