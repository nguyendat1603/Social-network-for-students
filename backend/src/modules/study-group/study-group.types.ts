export type TargetGradeGoal = 'A+' | 'A' | 'B+' | 'PASS';
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type GroupMemberRole = 'LEAD' | 'MEMBER';
export type KanbanTaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export interface RecruitmentSlotInput {
  roleName: string;
  requiredSkills: string[];
  quantityNeeded: number;
}

export interface CreateStudyGroupDTO {
  courseId: number;
  semester: string;
  groupName: string;
  projectTopic?: string;
  targetGrade: TargetGradeGoal;
  maxMembers: number;
  slots: RecruitmentSlotInput[];
}

export interface StudyGroupFilterQuery {
  courseId?: number;
  targetGrade?: TargetGradeGoal;
  roleName?: string;
  onlyRecruiting?: boolean;
  search?: string;
}

export interface ApplyToStudyGroupDTO {
  slotId: string;
  coverLetter: string;
  portfolioUrl?: string;
}

export interface ReviewGroupApplicationDTO {
  status: 'APPROVED' | 'REJECTED';
}

export interface CreateKanbanTaskDTO {
  title: string;
  description?: string;
  assigneeId?: string | null;
  dueDate?: string | null;
  status?: KanbanTaskStatus;
}

export interface UpdateKanbanTaskDTO {
  title?: string;
  description?: string;
  status?: KanbanTaskStatus;
  assigneeId?: string | null;
  dueDate?: string | null;
  positionOrder?: number;
}

export interface CreateGroupDocumentDTO {
  title: string;
  fileUrl: string;
  fileSizeBytes?: number;
}
