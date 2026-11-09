import { supabase } from '../../../database';
import { AppError } from '../../../common/errors/app.error';
import { KARMA_RULES } from '../../../common/constants/karma-rules.constant';
import { academicKarmaService } from '../../moderation/services/academic-karma.service';
import { CreateKanbanTaskDTO, UpdateKanbanTaskDTO } from '../study-group.types';
import { groupWorkspaceService } from './group-workspace.service';

export class KanbanTaskService {
  async createTask(groupId: string, userId: string, dto: CreateKanbanTaskDTO) {
    await groupWorkspaceService.assertGroupMember(groupId, userId);

    if (dto.assigneeId) {
      await groupWorkspaceService.assertGroupMember(groupId, dto.assigneeId);
    }

    const { count } = await supabase
      .from('kanban_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId)
      .eq('status', dto.status || 'TODO');

    const { data, error } = await supabase
      .from('kanban_tasks')
      .insert({
        group_id: groupId,
        title: dto.title,
        description: dto.description || null,
        status: dto.status || 'TODO',
        assignee_id: dto.assigneeId || null,
        due_date: dto.dueDate || null,
        position_order: (count || 0) + 1,
      })
      .select(
        `
        *,
        assignee:users!kanban_tasks_assignee_id_fkey(id, full_name, avatar_url)
      `
      )
      .single();

    if (error || !data) {
      throw new AppError(error?.message || 'Không thể tạo công việc Kanban', 500, 'TASK_CREATE_FAILED');
    }

    return data;
  }

  async updateTask(groupId: string, taskId: string, userId: string, dto: UpdateKanbanTaskDTO) {
    await groupWorkspaceService.assertGroupMember(groupId, userId);

    const { data: existingTask } = await supabase
      .from('kanban_tasks')
      .select('*')
      .eq('id', taskId)
      .eq('group_id', groupId)
      .maybeSingle();

    if (!existingTask) {
      throw new AppError('Không tìm thấy công việc trong bảng Kanban', 404, 'TASK_NOT_FOUND');
    }

    if (dto.assigneeId) {
      await groupWorkspaceService.assertGroupMember(groupId, dto.assigneeId);
    }

    const updatePayload: Record<string, unknown> = {};
    if (dto.title !== undefined) updatePayload.title = dto.title;
    if (dto.description !== undefined) updatePayload.description = dto.description;
    if (dto.status !== undefined) updatePayload.status = dto.status;
    if (dto.assigneeId !== undefined) updatePayload.assignee_id = dto.assigneeId;
    if (dto.dueDate !== undefined) updatePayload.due_date = dto.dueDate;
    if (dto.positionOrder !== undefined) updatePayload.position_order = dto.positionOrder;

    const { data: updatedTask, error } = await supabase
      .from('kanban_tasks')
      .update(updatePayload)
      .eq('id', taskId)
      .select(
        `
        *,
        assignee:users!kanban_tasks_assignee_id_fkey(id, full_name, avatar_url)
      `
      )
      .single();

    if (error || !updatedTask) {
      throw new AppError(error?.message || 'Không thể cập nhật công việc', 500, 'TASK_UPDATE_FAILED');
    }

    // Award +5 Karma when task transitions to DONE on time
    if (
      dto.status === 'DONE' &&
      existingTask.status !== 'DONE' &&
      updatedTask.assignee_id
    ) {
      const isOnTime =
        !updatedTask.due_date || new Date(updatedTask.due_date).getTime() >= Date.now();
      if (isOnTime) {
        await academicKarmaService.recordKarmaTransaction({
          userId: updatedTask.assignee_id,
          actionType: 'KANBAN_TASK_COMPLETED_ON_TIME',
          pointsDelta: KARMA_RULES.KANBAN_TASK_COMPLETED_ON_TIME,
          referenceType: 'KANBAN_TASK',
          referenceId: updatedTask.id,
        });
      }
    }

    return updatedTask;
  }

  async deleteTask(groupId: string, taskId: string, userId: string) {
    await groupWorkspaceService.assertGroupMember(groupId, userId);

    const { error } = await supabase
      .from('kanban_tasks')
      .delete()
      .eq('id', taskId)
      .eq('group_id', groupId);

    if (error) {
      throw new AppError(error.message, 500, 'TASK_DELETE_FAILED');
    }

    return { deleted: true };
  }
}

export const kanbanTaskService = new KanbanTaskService();
