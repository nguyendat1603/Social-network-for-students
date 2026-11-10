import { academicKarmaService } from '../modules/moderation/services/academic-karma.service';

/**
 * Background periodic job to audit and reconcile all users' karma_points
 * against their immutable records in `karma_ledger`.
 */
export async function runKarmaRecalculationJob(): Promise<number> {
  const result = await academicKarmaService.recalculateAllKarma();
  return result.processedUsers;
}
