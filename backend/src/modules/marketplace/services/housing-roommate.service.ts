import { supabase } from '../../../database';
import { AppError } from '../../../common/errors/app.error';
import {
  CreateHousingListingDTO,
  HousingFilterQuery,
  HousingStatus,
} from '../marketplace.types';

export class HousingRoommateService {
  async listHousing(filters: HousingFilterQuery) {
    let query = supabase
      .from('housing_listings')
      .select(
        `
        *,
        poster:users!housing_listings_poster_id_fkey(
          id,
          full_name,
          avatar_url,
          karma_points,
          is_verified_student,
          academic_profile:academic_profiles(student_id, cohort, major)
        )
      `
      )
      .order('created_at', { ascending: false });

    if (filters.listingType) {
      query = query.eq('listing_type', filters.listingType);
    }
    if (filters.maxBudgetVnd !== undefined) {
      query = query.lte('monthly_rent_vnd', filters.maxBudgetVnd);
    }
    if (filters.maxDistanceKm !== undefined) {
      query = query.lte('distance_to_campus_km', filters.maxDistanceKm);
    }
    if (filters.sleepSchedule) {
      query = query.eq('sleep_schedule', filters.sleepSchedule);
    }
    if (filters.smokingAllowed !== undefined) {
      query = query.eq('smoking_allowed', filters.smokingAllowed);
    }
    if (filters.cookingAllowed !== undefined) {
      query = query.eq('cooking_allowed', filters.cookingAllowed);
    }
    if (filters.genderPreference && filters.genderPreference !== 'ANY') {
      query = query.in('gender_preference', [filters.genderPreference, 'ANY']);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,address_district.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;
    if (error) {
      throw new AppError(error.message, 500, 'DB_ERROR');
    }

    return data || [];
  }

  async createHousingListing(posterId: string, dto: CreateHousingListingDTO) {
    const { data, error } = await supabase
      .from('housing_listings')
      .insert({
        poster_id: posterId,
        listing_type: dto.listingType,
        title: dto.title,
        description: dto.description,
        address_district: dto.addressDistrict,
        distance_to_campus_km: dto.distanceToCampusKm ?? null,
        monthly_rent_vnd: dto.monthlyRentVnd,
        max_budget_vnd: dto.maxBudgetVnd ?? dto.monthlyRentVnd,
        sleep_schedule: dto.sleepSchedule,
        smoking_allowed: dto.smokingAllowed,
        cooking_allowed: dto.cookingAllowed,
        gender_preference: dto.genderPreference,
        status: 'OPEN',
      })
      .select(
        `
        *,
        poster:users!housing_listings_poster_id_fkey(id, full_name, avatar_url, karma_points, is_verified_student)
      `
      )
      .single();

    if (error || !data) {
      throw new AppError(
        error?.message || 'Không thể đăng tin tìm phòng / bạn ở ghép',
        500,
        'HOUSING_CREATE_FAILED'
      );
    }

    return data;
  }

  async updateHousingStatus(listingId: string, userId: string, status: HousingStatus) {
    const { data: existing } = await supabase
      .from('housing_listings')
      .select('id, poster_id')
      .eq('id', listingId)
      .maybeSingle();

    if (!existing) {
      throw new AppError('Không tìm thấy tin đăng nhà trọ', 404, 'HOUSING_NOT_FOUND');
    }

    if (existing.poster_id !== userId) {
      throw new AppError('Chỉ người đăng mới có quyền đóng/mở tin này', 403, 'FORBIDDEN');
    }

    const { data: updated, error } = await supabase
      .from('housing_listings')
      .update({ status })
      .eq('id', listingId)
      .select('*')
      .single();

    if (error || !updated) {
      throw new AppError(error?.message || 'Không thể cập nhật trạng thái', 500, 'UPDATE_FAILED');
    }

    return updated;
  }
}

export const housingRoommateService = new HousingRoommateService();
