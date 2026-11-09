import { AppError } from '../../common/errors/app.error';
import {
  ApplyToStudyGroupDTO,
  CreateGroupDocumentDTO,
  CreateKanbanTaskDTO,
  CreateStudyGroupDTO,
  KanbanTaskStatus,
  RecruitmentSlotInput,
  ReviewGroupApplicationDTO,
  TargetGradeGoal,
  UpdateKanbanTaskDTO,
} from './study-group.types';

const VALID_GRADES: TargetGradeGoal[] = ['A+', 'A', 'B+', 'PASS'];
const VALID_KANBAN_STATUSES: KanbanTaskStatus[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

export const validateCreateStudyGroup = (body: Record<string, unknown>): CreateStudyGroupDTO => {
  const courseId = Number(body.courseId);
  const semester = typeof body.semester === 'string' ? body.semester.trim() : '2026.1';
  const groupName = typeof body.groupName === 'string' ? body.groupName.trim() : '';
  const projectTopic =
    typeof body.projectTopic === 'string' ? body.projectTopic.trim() : undefined;
  const targetGrade = (body.targetGrade as TargetGradeGoal) || 'A';
  const maxMembers = Number(body.maxMembers || 4);

  if (!courseId || Number.isNaN(courseId)) {
    throw new AppError('Vui lòng chọn học phần cho nhóm đồ án', 400, 'VALIDATION_ERROR');
  }
  if (!groupName || groupName.length < 3) {
    throw new AppError('Tên nhóm đồ án phải từ 3 ký tự trở lên', 400, 'VALIDATION_ERROR');
  }
  if (!VALID_GRADES.includes(targetGrade)) {
    throw new AppError('Mục tiêu điểm số không hợp lệ', 400, 'VALIDATION_ERROR');
  }
  if (maxMembers < 2 || maxMembers > 15) {
    throw new AppError('Số lượng thành viên tối đa phải từ 2 đến 15', 400, 'VALIDATION_ERROR');
  }

  const rawSlots = Array.isArray(body.slots) ? body.slots : [];
  const slots: RecruitmentSlotInput[] = rawSlots
    .map((item: Record<string, unknown>) => ({
      roleName: typeof item.roleName === 'string' ? item.roleName.trim() : '',
      requiredSkills: Array.isArray(item.requiredSkills)
        ? item.requiredSkills.map((s) => String(s).trim()).filter(Boolean)
        : [],
      quantityNeeded: Math.max(1, Number(item.quantityNeeded || 1)),
    }))
    .filter((s) => s.roleName.length > 0);

  if (slots.length === 0) {
    throw new AppError(
      'Vui lòng thêm ít nhất 1 vị trí cần tuyển (ví dụ: Backend, Frontend, Embedded)',
      400,
      'VALIDATION_ERROR'
    );
  }

  return {
    courseId,
    semester,
    groupName,
    projectTopic,
    targetGrade,
    maxMembers,
    slots,
  };
};

export const validateApplyToStudyGroup = (body: Record<string, unknown>): ApplyToStudyGroupDTO => {
  const slotId = typeof body.slotId === 'string' ? body.slotId.trim() : '';
  const coverLetter = typeof body.coverLetter === 'string' ? body.coverLetter.trim() : '';
  const portfolioUrl =
    typeof body.portfolioUrl === 'string' ? body.portfolioUrl.trim() : undefined;

  if (!slotId) {
    throw new AppError('Vui lòng chọn vị trí ứng tuyển trong nhóm', 400, 'VALIDATION_ERROR');
  }
  if (!coverLetter || coverLetter.length < 10) {
    throw new AppError(
      'Lời giới thiệu / kỹ năng ứng tuyển phải từ 10 ký tự trở lên',
      400,
      'VALIDATION_ERROR'
    );
  }

  return {
    slotId,
    coverLetter,
    portfolioUrl: portfolioUrl || undefined,
  };
};

export const validateReviewApplication = (
  body: Record<string, unknown>
): ReviewGroupApplicationDTO => {
  const status = body.status as 'APPROVED' | 'REJECTED';
  if (status !== 'APPROVED' && status !== 'REJECTED') {
    throw new AppError('Trạng thái duyệt đơn phải là APPROVED hoặc REJECTED', 400, 'VALIDATION_ERROR');
  }
  return { status };
};

export const validateCreateKanbanTask = (body: Record<string, unknown>): CreateKanbanTaskDTO => {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const description =
    typeof body.description === 'string' ? body.description.trim() : undefined;
  const assigneeId =
    typeof body.assigneeId === 'string' && body.assigneeId.trim()
      ? body.assigneeId.trim()
      : null;
  const dueDate =
    typeof body.dueDate === 'string' && body.dueDate.trim() ? body.dueDate.trim() : null;
  const status = (body.status as KanbanTaskStatus) || 'TODO';

  if (!title || title.length < 2) {
    throw new AppError('Tiêu đề công việc không được để trống', 400, 'VALIDATION_ERROR');
  }
  if (!VALID_KANBAN_STATUSES.includes(status)) {
    throw new AppError('Cột trạng thái Kanban không hợp lệ', 400, 'VALIDATION_ERROR');
  }

  return {
    title,
    description,
    assigneeId,
    dueDate,
    status,
  };
};

export const validateUpdateKanbanTask = (body: Record<string, unknown>): UpdateKanbanTaskDTO => {
  const dto: UpdateKanbanTaskDTO = {};
  if (typeof body.title === 'string') dto.title = body.title.trim();
  if (typeof body.description === 'string') dto.description = body.description.trim();
  if (typeof body.status === 'string') {
    if (!VALID_KANBAN_STATUSES.includes(body.status as KanbanTaskStatus)) {
      throw new AppError('Cột trạng thái Kanban không hợp lệ', 400, 'VALIDATION_ERROR');
    }
    dto.status = body.status as KanbanTaskStatus;
  }
  if (body.assigneeId !== undefined) {
    dto.assigneeId =
      typeof body.assigneeId === 'string' && body.assigneeId.trim()
        ? body.assigneeId.trim()
        : null;
  }
  if (body.dueDate !== undefined) {
    dto.dueDate =
      typeof body.dueDate === 'string' && body.dueDate.trim() ? body.dueDate.trim() : null;
  }
  if (typeof body.positionOrder === 'number') {
    dto.positionOrder = body.positionOrder;
  }
  return dto;
};

export const validateCreateGroupDocument = (
  body: Record<string, unknown>
): CreateGroupDocumentDTO => {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const fileUrl = typeof body.fileUrl === 'string' ? body.fileUrl.trim() : '';
  const fileSizeBytes =
    typeof body.fileSizeBytes === 'number'
      ? body.fileSizeBytes
      : body.fileSizeBytes
      ? Number(body.fileSizeBytes)
      : undefined;

  if (!title || !fileUrl) {
    throw new AppError('Vui lòng nhập tên tài liệu và đường dẫn file', 400, 'VALIDATION_ERROR');
  }

  return {
    title,
    fileUrl,
    fileSizeBytes,
  };
};
