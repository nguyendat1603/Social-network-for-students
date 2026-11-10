import { academicKarmaService } from './services/academic-karma.service';
import { privilegeUnlockService } from './services/privilege-unlock.service';
import { reportEngineService } from './services/report-engine.service';
import { moderationRepository } from './moderation.repository';
import {
  ExecuteModerationActionDTO,
  KarmaLeaderboardQuery,
  ModerationQueueQuery,
  ResolveReportDTO,
  SubmitReportDTO,
} from './moderation.types';

export class ModerationService {
  async getMyKarma(userId: string) {
    return academicKarmaService.getMyKarmaSummary(userId);
  }

  async getMyPrivileges(userId: string) {
    return privilegeUnlockService.getUserPrivileges(userId);
  }

  async getLeaderboard(query: KarmaLeaderboardQuery) {
    return academicKarmaService.getKarmaLeaderboard(query);
  }

  async submitReport(reporterId: string, dto: SubmitReportDTO) {
    return reportEngineService.submitReport(reporterId, dto);
  }

  async getModerationQueue(query: ModerationQueueQuery) {
    return reportEngineService.getModerationQueue(query);
  }

  async resolveReports(
    moderatorId: string,
    targetType: string,
    targetId: string,
    dto: ResolveReportDTO
  ) {
    return reportEngineService.resolveReportsForTarget(
      moderatorId,
      targetType,
      targetId,
      dto
    );
  }

  async executeDirectAction(moderatorId: string, dto: ExecuteModerationActionDTO) {
    return reportEngineService.executeDirectAction(moderatorId, dto);
  }

  async listModerationActions(limit?: number) {
    return reportEngineService.listModerationActions(limit);
  }

  async getAutoModSettings() {
    return moderationRepository.getAutoModSettings();
  }

  async updateAutoModSetting(
    reasonCode: string,
    thresholdCount: number,
    isEnabled: boolean
  ) {
    return moderationRepository.updateAutoModSetting(
      reasonCode,
      thresholdCount,
      isEnabled
    );
  }
}

export const moderationService = new ModerationService();
