import { supabase } from '../../../database';
import { AppError } from '../../../common/errors/app.error';
import { PRIVILEGE_TIERS } from '../../../common/constants/karma-rules.constant';
import { academicKarmaService } from './academic-karma.service';

export class PrivilegeUnlockService {
  /**
   * Evaluates user's current privilege tier and permissions.
   */
  async getUserPrivileges(userId: string) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, karma_points, role, is_verified_student, status')
      .eq('id', userId)
      .maybeSingle();

    if (error || !user) {
      throw new AppError('Không tìm thấy thông tin sinh viên.', 404, 'USER_NOT_FOUND');
    }

    const karmaPoints = user.karma_points ?? 0;
    const tier = academicKarmaService.getTierForKarma(karmaPoints);

    // Calculate downloads used today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const { count: downloadsToday } = await supabase
      .from('document_downloads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('downloaded_at', startOfToday.toISOString());

    const dailyLimit = tier.dailyDownloadLimit;
    const remainingDownloads =
      dailyLimit === null
        ? null
        : Math.max(0, dailyLimit - (downloadsToday || 0));

    return {
      userId: user.id,
      karmaPoints,
      tierCode:
        karmaPoints < 0
          ? 'RESTRICTED'
          : karmaPoints >= PRIVILEGE_TIERS.TRUSTED_SCHOLAR.minKarma
          ? 'TRUSTED_SCHOLAR'
          : karmaPoints >= PRIVILEGE_TIERS.ACTIVE_CONTRIBUTOR.minKarma
          ? 'ACTIVE_CONTRIBUTOR'
          : 'VERIFIED_MEMBER',
      badgeLabel: tier.badgeLabel,
      isRestricted: karmaPoints < 0,
      dailyDownloadLimit: dailyLimit,
      downloadsUsedToday: downloadsToday || 0,
      remainingDownloadsToday: remainingDownloads,
      canCreateCustomGroup: tier.canCreateCustomGroup,
      canPost: karmaPoints >= 0 && user.status !== 'SUSPENDED' && user.status !== 'BANNED',
    };
  }

  /**
   * Asserts whether user can create a post / marketplace item.
   */
  async assertCanPost(userId: string) {
    const priv = await this.getUserPrivileges(userId);
    if (priv.isRestricted || !priv.canPost) {
      throw new AppError(
        'Tài khoản của bạn đang có điểm Karma âm (< 0) hoặc bị giới hạn, không thể đăng bài mới.',
        403,
        'POSTING_RESTRICTED'
      );
    }
  }

  /**
   * Asserts whether user can download a document today.
   */
  async assertCanDownloadDocument(userId: string) {
    const priv = await this.getUserPrivileges(userId);
    if (priv.isRestricted) {
      throw new AppError(
        'Tài khoản của bạn đang bị giới hạn, không thể tải tài liệu.',
        403,
        'DOWNLOAD_RESTRICTED'
      );
    }

    if (
      priv.dailyDownloadLimit !== null &&
      priv.remainingDownloadsToday !== null &&
      priv.remainingDownloadsToday <= 0
    ) {
      throw new AppError(
        `Bạn đã sử dụng hết hạn mức ${priv.dailyDownloadLimit} lượt tải tài liệu hôm nay. Đạt từ 50 Karma (Active Contributor) để mở khóa tải không giới hạn!`,
        429,
        'DAILY_DOWNLOAD_LIMIT_REACHED'
      );
    }
  }

  /**
   * Asserts whether user can create a custom study/discussion group.
   */
  async assertCanCreateCustomGroup(userId: string) {
    const priv = await this.getUserPrivileges(userId);
    if (!priv.canCreateCustomGroup) {
      throw new AppError(
        'Chỉ sinh viên đạt danh hiệu Trusted Scholar (>= 150 Karma) mới có đặc quyền khởi tạo nhóm thảo luận chuyên đề riêng.',
        403,
        'CUSTOM_GROUP_RESTRICTED'
      );
    }
  }
}

export const privilegeUnlockService = new PrivilegeUnlockService();
