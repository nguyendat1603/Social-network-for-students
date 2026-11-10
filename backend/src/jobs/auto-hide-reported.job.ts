import { supabase } from '../database';
import { autoModerationService } from '../modules/moderation/services/auto-moderation.service';

/**
 * Background batch job to sweep through pending content reports
 * and auto-hide any contents exceeding thresholds that were missed.
 */
export async function runAutoHideReportedJob(): Promise<number> {
  const { data: reports, error } = await supabase
    .from('content_reports')
    .select('target_type, target_id, reason_code')
    .eq('status', 'PENDING');

  if (error || !reports || reports.length === 0) {
    return 0;
  }

  // Deduplicate target groups
  const targetsMap = new Map<string, { targetType: any; targetId: string; reasonCode: any }>();
  for (const r of reports) {
    const key = `${r.target_type}:${r.target_id}`;
    if (!targetsMap.has(key)) {
      targetsMap.set(key, {
        targetType: r.target_type,
        targetId: r.target_id,
        reasonCode: r.reason_code,
      });
    }
  }

  let hiddenCount = 0;
  for (const item of targetsMap.values()) {
    const res = await autoModerationService.checkAndTriggerAutoModeration(
      item.targetType,
      item.targetId,
      item.reasonCode
    );
    if (res.autoHidden) {
      hiddenCount++;
    }
  }

  return hiddenCount;
}
