import { apiRequest } from './api.client';
import {
  GroupApplicationItem,
  GroupDocumentItem,
  GroupWorkspaceData,
  KanbanTaskItem,
  KanbanTaskStatus,
  StudyGroupItem,
  TargetGradeGoal,
} from '../types/study-group.types';

export const studyGroupService = {
  listStudyGroups(params?: {
    courseId?: number;
    targetGrade?: TargetGradeGoal;
    roleName?: string;
    onlyRecruiting?: boolean;
    search?: string;
  }) {
    const qs = new URLSearchParams();
    if (params?.courseId) qs.set('courseId', String(params.courseId));
    if (params?.targetGrade) qs.set('targetGrade', params.targetGrade);
    if (params?.roleName) qs.set('roleName', params.roleName);
    if (params?.onlyRecruiting !== undefined) {
      qs.set('onlyRecruiting', String(params.onlyRecruiting));
    }
    if (params?.search) qs.set('search', params.search);

    const queryStr = qs.toString() ? `?${qs.toString()}` : '';
    return apiRequest<StudyGroupItem[]>(`/study-groups${queryStr}`);
  },

  createStudyGroup(payload: {
    courseId: number;
    semester: string;
    groupName: string;
    projectTopic?: string;
    targetGrade: TargetGradeGoal;
    maxMembers: number;
    slots: Array<{
      roleName: string;
      requiredSkills: string[];
      quantityNeeded: number;
    }>;
  }) {
    return apiRequest<StudyGroupItem>('/study-groups', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  applyToStudyGroup(
    groupId: string,
    payload: {
      slotId: string;
      coverLetter: string;
      portfolioUrl?: string;
    }
  ) {
    return apiRequest<GroupApplicationItem>(`/study-groups/${groupId}/apply`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  reviewApplication(
    groupId: string,
    applicationId: string,
    status: 'APPROVED' | 'REJECTED'
  ) {
    return apiRequest<GroupApplicationItem>(
      `/study-groups/${groupId}/applications/${applicationId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
  },

  getWorkspace(groupId: string) {
    return apiRequest<GroupWorkspaceData>(`/study-groups/${groupId}/workspace`);
  },

  createKanbanTask(
    groupId: string,
    payload: {
      title: string;
      description?: string;
      assigneeId?: string | null;
      dueDate?: string | null;
      status?: KanbanTaskStatus;
    }
  ) {
    return apiRequest<KanbanTaskItem>(`/study-groups/${groupId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateKanbanTask(
    groupId: string,
    taskId: string,
    payload: {
      title?: string;
      description?: string;
      status?: KanbanTaskStatus;
      assigneeId?: string | null;
      dueDate?: string | null;
      positionOrder?: number;
    }
  ) {
    return apiRequest<KanbanTaskItem>(
      `/study-groups/${groupId}/tasks/${taskId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    );
  },

  deleteKanbanTask(groupId: string, taskId: string) {
    return apiRequest<{ deleted: boolean }>(
      `/study-groups/${groupId}/tasks/${taskId}`,
      {
        method: 'DELETE',
      }
    );
  },

  uploadGroupDocument(
    groupId: string,
    payload: {
      title: string;
      fileUrl: string;
      fileSizeBytes?: number;
    }
  ) {
    return apiRequest<GroupDocumentItem>(`/study-groups/${groupId}/documents`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
