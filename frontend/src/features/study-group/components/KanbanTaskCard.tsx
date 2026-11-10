import React from 'react';
import {
  KanbanTaskItem,
  KanbanTaskStatus,
} from '../../../types/study-group.types';

interface KanbanTaskCardProps {
  task: KanbanTaskItem;
  onStatusChange: (taskId: string, nextStatus: KanbanTaskStatus) => void;
  onDelete: (taskId: string) => void;
}

const STATUS_FLOW: KanbanTaskStatus[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

export const KanbanTaskCard: React.FC<KanbanTaskCardProps> = ({
  task,
  onStatusChange,
  onDelete,
}) => {
  const currentIndex = STATUS_FLOW.indexOf(task.status);
  const prevStatus = currentIndex > 0 ? STATUS_FLOW[currentIndex - 1] : null;
  const nextStatus =
    currentIndex < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIndex + 1] : null;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 10,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: '#fff' }}>
          {task.title}
        </div>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          title="Xóa task"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>

      {task.description && (
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {task.description}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 11,
          color: 'var(--text-muted)',
        }}
      >
        <span>
          👤 {task.assignee?.full_name || 'Chưa gán'}
        </span>
        {task.due_date && (
          <span>
            ⏰ {new Date(task.due_date).toLocaleDateString('vi-VN')}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, marginTop: 4 }}>
        {prevStatus ? (
          <button
            type="button"
            onClick={() => onStatusChange(task.id, prevStatus)}
            style={{
              padding: '4px 8px',
              borderRadius: 6,
              background: 'rgba(148, 163, 184, 0.12)',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            ← {prevStatus}
          </button>
        ) : (
          <span />
        )}

        {nextStatus && (
          <button
            type="button"
            onClick={() => onStatusChange(task.id, nextStatus)}
            style={{
              padding: '4px 8px',
              borderRadius: 6,
              background:
                nextStatus === 'DONE'
                  ? 'rgba(16, 185, 129, 0.2)'
                  : 'rgba(59, 130, 246, 0.18)',
              border: 'none',
              color: nextStatus === 'DONE' ? '#34d399' : '#60a5fa',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {nextStatus === 'DONE' ? '✓ Hoàn thành (+5 Karma)' : `${nextStatus} →`}
          </button>
        )}
      </div>
    </div>
  );
};
