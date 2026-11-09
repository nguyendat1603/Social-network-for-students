import { studyGroupRepository } from './study-group.repository';
import { teammateMatchingService } from './services/teammate-matching.service';
import { groupWorkspaceService } from './services/group-workspace.service';
import { kanbanTaskService } from './services/kanban-task.service';
import { groupStorageService } from './services/group-storage.service';
import {
  ApplyToStudyGroupDTO,
  CreateGroupDocumentDTO,
  CreateKanbanTaskDTO,
  CreateStudyGroupDTO,
  ReviewGroupApplicationDTO,
  StudyGroupFilterQuery,
  UpdateKanbanTaskDTO,
} from './study-group.types';

export class StudyGroupService {
  async listStudyGroups(filters: StudyGroupFilterQuery, currentUserId?: string) {
    return studyGroupRepository.listStudyGroups(filters, currentUserId);
  }

  async createStudyGroup(leaderId: string, dto: CreateStudyGroupDTO) {
    return teammateMatchingService.createStudyGroup(leaderId, dto);
  }

  async applyToStudyGroup(groupId: string, applicantId: string, dto: ApplyToStudyGroupDTO) {
    return teammateMatchingService.applyToStudyGroup(groupId, applicantId, dto);
  }

  async reviewApplication(
    groupId: string,
    applicationId: string,
    leaderId: string,
    dto: ReviewGroupApplicationDTO
  ) {
    return teammateMatchingService.reviewApplication(groupId, applicationId, leaderId, dto);
  }

  async getWorkspace(groupId: string, userId: string) {
    return groupWorkspaceService.getWorkspaceData(groupId, userId);
  }

  async createKanbanTask(groupId: string, userId: string, dto: CreateKanbanTaskDTO) {
    return kanbanTaskService.createTask(groupId, userId, dto);
  }

  async updateKanbanTask(
    groupId: string,
    taskId: string,
    userId: string,
    dto: UpdateKanbanTaskDTO
  ) {
    return kanbanTaskService.updateTask(groupId, taskId, userId, dto);
  }

  async deleteKanbanTask(groupId: string, taskId: string, userId: string) {
    return kanbanTaskService.deleteTask(groupId, taskId, userId);
  }

  async uploadGroupDocument(groupId: string, userId: string, dto: CreateGroupDocumentDTO) {
    return groupStorageService.uploadGroupDocument(groupId, userId, dto);
  }
}

export const studyGroupService = new StudyGroupService();
