import { supabase } from '../../../database';
import { PRIVILEGE_TIERS } from '../../../common/constants/karma-rules.constant';
import { AppError } from '../../../common/errors/app.error';
import {
  KarmaLeaderboardItem,
  KarmaLeaderboardQuery,
  KarmaSummaryResponse,
} from '../moderation.types';

export class AcademicKarmaService {
  /**
   * Records a Karma transaction in `karma_ledger` and updates `users.karma_points`.
   * Ignores self-rewards or duplicate one-time rewards gracefully.
   */
  async recordKarmaTransaction(params: {
    userId: string;
    actorUserId?: string;
    actionType: string;
    pointsDelta: number;
    referenceType: string;
    referenceId: string;
  }): Promise<void> {
    if (params.actorUserId && params.actorUserId === params.userId) {
      return;
    }

    const { error: ledgerError } = await supabase.from('karma_ledger').insert({
      user_id: params.userId,
      action_type: params.actionType,
      points_delta: params.pointsDelta,
      reference_type: params.referenceType,
      reference_id: params.referenceId,
    });

    if (ledgerError) {
      // Unique constraint violation means this exact reward was already granted
      return;
    }

    const { data: user } = await supabase
      .from('users')
      .select('karma_points')
      .eq('id', params.userId)
      .maybeSingle();

    if (user) {
      await supabase
        .from('users')
        .update({ karma_points: (user.karma_points || 0) + params.pointsDelta })
        .eq('id', params.userId);
    }
  }

  getTierForKarma(karmaPoints: number) {
    if (karmaPoints < 0) return PRIVILEGE_TIERS.RESTRICTED;
    if (karmaPoints >= PRIVILEGE_TIERS.TRUSTED_SCHOLAR.minKarma) {
      return PRIVILEGE_TIERS.TRUSTED_SCHOLAR;
    }
    if (karmaPoints >= PRIVILEGE_TIERS.ACTIVE_CONTRIBUTOR.minKarma) {
      return PRIVILEGE_TIERS.ACTIVE_CONTRIBUTOR;
    }
    return PRIVILEGE_TIERS.VERIFIED_MEMBER;
  }

  /**
   * Gets Karma summary and recent transaction ledger for a student.
   */
  async getMyKarmaSummary(userId: string): Promise<KarmaSummaryResponse> {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, karma_points')
      .eq('id', userId)
      .maybeSingle();

    if (userError || !user) {
      throw new AppError('Không tìm thấy người dùng.', 404, 'USER_NOT_FOUND');
    }

    const currentKarma = user.karma_points ?? 0;
    const tier = this.getTierForKarma(currentKarma);

    let nextTierPoints: number | null = null;
    let tierCode = 'VERIFIED_MEMBER';

    if (currentKarma < 0) {
      tierCode = 'RESTRICTED';
      nextTierPoints = 0 - currentKarma;
    } else if (currentKarma < PRIVILEGE_TIERS.ACTIVE_CONTRIBUTOR.minKarma) {
      tierCode = 'VERIFIED_MEMBER';
      nextTierPoints = PRIVILEGE_TIERS.ACTIVE_CONTRIBUTOR.minKarma - currentKarma;
    } else if (currentKarma < PRIVILEGE_TIERS.TRUSTED_SCHOLAR.minKarma) {
      tierCode = 'ACTIVE_CONTRIBUTOR';
      nextTierPoints = PRIVILEGE_TIERS.TRUSTED_SCHOLAR.minKarma - currentKarma;
    } else {
      tierCode = 'TRUSTED_SCHOLAR';
      nextTierPoints = null; // Reached highest tier
    }

    const { data: transactions, error: txError } = await supabase
      .from('karma_ledger')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (txError) {
      throw new AppError(txError.message, 500, 'DB_ERROR');
    }

    const list = transactions || [];
    let totalEarned = 0;
    let totalDeducted = 0;

    for (const tx of list) {
      if (tx.points_delta > 0) {
        totalEarned += tx.points_delta;
      } else {
        totalDeducted += Math.abs(tx.points_delta);
      }
    }

    return {
      currentKarma,
      tier: {
        tierCode,
        badgeLabel: tier.badgeLabel,
        dailyDownloadLimit: tier.dailyDownloadLimit,
        canCreateCustomGroup: tier.canCreateCustomGroup,
        nextTierPoints,
      },
      stats: {
        totalEarned,
        totalDeducted,
        transactionsCount: list.length,
      },
      recentTransactions: list,
    };
  }

  /**
   * Leaderboard of top academic contributors.
   */
  async getKarmaLeaderboard(
    query: KarmaLeaderboardQuery
  ): Promise<KarmaLeaderboardItem[]> {
    const limit = query.limit || 20;

    let dbQuery = supabase
      .from('users')
      .select(
        `
        id,
        full_name,
        avatar_url,
        karma_points,
        role,
        is_verified_student,
        academic_profile:academic_profiles(student_code, major, faculty_id)
      `
      )
      .eq('is_verified_student', true)
      .order('karma_points', { ascending: false })
      .limit(limit);

    const { data, error } = await dbQuery;
    if (error) {
      throw new AppError(error.message, 500, 'DB_ERROR');
    }

    let items = (data || []).map((u, index) => {
      const profile = Array.isArray(u.academic_profile)
        ? u.academic_profile[0]
        : u.academic_profile;
      const tier = this.getTierForKarma(u.karma_points ?? 0);

      return {
        rank: index + 1,
        userId: u.id,
        fullName: u.full_name,
        avatarUrl: u.avatar_url,
        studentCode: profile?.student_code || null,
        major: profile?.major || null,
        facultyId: profile?.faculty_id || null,
        karmaPoints: u.karma_points ?? 0,
        badgeLabel: tier.badgeLabel,
      };
    });

    if (query.facultyId) {
      items = items.filter((item) => item.facultyId === query.facultyId);
      // Recompute rank after faculty filter
      items = items.map((item, idx) => ({ ...item, rank: idx + 1 }));
    }

    return items;
  }

  /**
   * Recalculates karma points for a single user from ledger.
   */
  async recalculateKarmaForUser(userId: string): Promise<number> {
    const { data: ledger, error } = await supabase
      .from('karma_ledger')
      .select('points_delta')
      .eq('user_id', userId);

    if (error) {
      throw new AppError(error.message, 500, 'DB_ERROR');
    }

    const totalKarma = (ledger || []).reduce(
      (sum, row) => sum + (row.points_delta || 0),
      0
    );

    await supabase
      .from('users')
      .update({ karma_points: totalKarma })
      .eq('id', userId);

    return totalKarma;
  }

  /**
   * Recalculates karma points for all users (e.g. daily cron job).
   */
  async recalculateAllKarma(): Promise<{ processedUsers: number }> {
    const { data: users, error } = await supabase.from('users').select('id');
    if (error || !users) return { processedUsers: 0 };

    for (const user of users) {
      await this.recalculateKarmaForUser(user.id);
    }

    return { processedUsers: users.length };
  }
}

export const academicKarmaService = new AcademicKarmaService();
