import { supabase } from '../database';
import { realtimeNotificationService } from '../modules/communication/services/realtime-notification.service';

/**
 * Checks Kanban tasks due within the next 24 hours and dispatches `TASK_DEADLINE` notifications.
 */
export async function runTaskDeadlineReminderJob(): Promise<number> {
  const now = new Date();
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { data: dueTasks, error } = await supabase
    .from('kanban_tasks')
    .select(
      `
      id,
      title,
      due_date,
      assignee_id,
      group_id,
      group:study_groups!kanban_tasks_group_id_fkey(group_name)
    `
    )
    .neq('status', 'DONE')
    .not('assignee_id', 'is', null)
    .gte('due_date', now.toISOString())
    .lte('due_date', in24Hours.toISOString());

  if (error || !dueTasks) {
    return 0;
  }

  let notifiedCount = 0;
  for (const task of dueTasks) {
    if (!task.assignee_id) continue;
    await realtimeNotificationService.dispatchNotification({
      recipientId: task.assignee_id,
      type: 'TASK_DEADLINE',
      title: 'Sắp đến hạn nộp Task đồ án',
      body: `Task "${task.title}" sẽ hết hạn vào ${new Date(task.due_date).toLocaleString('vi-VN')}.`,
      referenceUrl: `/study-groups/${task.group_id}/workspace`,
    });
    notifiedCount += 1;
  }

  return notifiedCount;
}
