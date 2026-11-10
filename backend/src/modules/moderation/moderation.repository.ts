import { supabase } from '../../database';
import { AppError } from '../../common/errors/app.error';

export class ModerationRepository {
  async getAutoModSettings() {
    const { data, error } = await supabase
      .from('auto_mod_settings')
      .select('*')
      .order('reason_code', { ascending: true });

    if (error) {
      throw new AppError(error.message, 500, 'DB_ERROR');
    }

    return data || [];
  }

  async updateAutoModSetting(
    reasonCode: string,
    thresholdCount: number,
    isEnabled: boolean
  ) {
    const { data, error } = await supabase
      .from('auto_mod_settings')
      .update({
        threshold_count: thresholdCount,
        is_enabled: isEnabled,
        updated_at: new Date().toISOString(),
      })
      .eq('reason_code', reasonCode)
      .select('*')
      .single();

    if (error || !data) {
      throw new AppError(
        error?.message || 'Không thể cập nhật cấu hình kiểm duyệt.',
        500,
        'UPDATE_ERROR'
      );
    }

    return data;
  }
}

export const moderationRepository = new ModerationRepository();
