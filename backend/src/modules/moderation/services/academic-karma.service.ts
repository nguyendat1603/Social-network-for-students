import { supabase } from '../../../database';
import { PRIVILEGE_TIERS } from '../../../common/constants/karma-rules.constant';

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
}

export const academicKarmaService = new AcademicKarmaService();
