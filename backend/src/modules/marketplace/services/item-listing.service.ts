import { supabase } from '../../../database';
import { AppError } from '../../../common/errors/app.error';
import { KARMA_RULES } from '../../../common/constants/karma-rules.constant';
import { academicKarmaService } from '../../moderation/services/academic-karma.service';
import {
  CreateMarketplaceItemDTO,
  ItemStatus,
  MarketplaceItemFilterQuery,
} from '../marketplace.types';

export class ItemListingService {
  async listItems(filters: MarketplaceItemFilterQuery) {
    let query = supabase
      .from('marketplace_items')
      .select(
        `
        *,
        seller:users!marketplace_items_seller_id_fkey(
          id,
          full_name,
          avatar_url,
          karma_points,
          is_verified_student,
          academic_profile:academic_profiles(student_id, cohort, major)
        ),
        course:courses(id, code, name),
        images:marketplace_item_images(id, image_url, display_order)
      `
      )
      .order('created_at', { ascending: false });

    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.condition) {
      query = query.eq('condition', filters.condition);
    }
    if (filters.courseId) {
      query = query.eq('course_id', filters.courseId);
    }
    if (filters.maxPriceVnd !== undefined) {
      query = query.lte('price_vnd', filters.maxPriceVnd);
    }
    if (filters.onlyFree) {
      query = query.eq('is_free', true);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;
    if (error) {
      throw new AppError(error.message, 500, 'DB_ERROR');
    }

    return data || [];
  }

  async createItem(sellerId: string, dto: CreateMarketplaceItemDTO) {
    const normalizedPrice = dto.isFree ? 0 : dto.priceVnd;

    const { data: item, error } = await supabase
      .from('marketplace_items')
      .insert({
        seller_id: sellerId,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        course_id: dto.courseId || null,
        price_vnd: normalizedPrice,
        is_free: dto.isFree,
        condition: dto.condition,
        status: 'AVAILABLE',
        pickup_location: dto.pickupLocation || null,
      })
      .select(
        `
        *,
        seller:users!marketplace_items_seller_id_fkey(id, full_name, avatar_url, karma_points, is_verified_student),
        course:courses(id, code, name)
      `
      )
      .single();

    if (error || !item) {
      throw new AppError(error?.message || 'Không thể đăng mặt hàng', 500, 'ITEM_CREATE_FAILED');
    }

    if (dto.imageUrls && dto.imageUrls.length > 0) {
      const imageRows = dto.imageUrls.map((url, idx) => ({
        item_id: item.id,
        image_url: url,
        display_order: idx,
      }));
      await supabase.from('marketplace_item_images').insert(imageRows);
    }

    return item;
  }

  async updateItemStatus(itemId: string, userId: string, status: ItemStatus) {
    const { data: existing } = await supabase
      .from('marketplace_items')
      .select('*')
      .eq('id', itemId)
      .maybeSingle();

    if (!existing) {
      throw new AppError('Không tìm thấy mặt hàng', 404, 'ITEM_NOT_FOUND');
    }

    if (existing.seller_id !== userId) {
      throw new AppError('Chỉ người đăng mới được cập nhật trạng thái mặt hàng', 403, 'FORBIDDEN');
    }

    const { data: updated, error } = await supabase
      .from('marketplace_items')
      .update({ status })
      .eq('id', itemId)
      .select('*')
      .single();

    if (error || !updated) {
      throw new AppError(error?.message || 'Không thể cập nhật trạng thái', 500, 'UPDATE_FAILED');
    }

    // If free giveaway item is marked SOLD, award +5 Karma to the student
    if (status === 'SOLD' && existing.is_free) {
      await academicKarmaService.recordKarmaTransaction({
        userId,
        actionType: 'MARKETPLACE_FREE_GIVEAWAY',
        pointsDelta: KARMA_RULES.MARKETPLACE_FREE_GIVEAWAY,
        referenceType: 'MARKETPLACE_ITEM',
        referenceId: existing.id,
      });
    }

    return updated;
  }
}

export const itemListingService = new ItemListingService();
