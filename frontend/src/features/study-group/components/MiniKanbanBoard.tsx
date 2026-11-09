import React, { useState } from 'react';
import {
  GroupMemberItem,
  KanbanTaskItem,
  KanbanTaskStatus,
} from '../../../types/study-group.types';
import { KanbanTaskCard } from './KanbanTaskCard';

interface MiniKanbanBoardProps {
  tasks: KanbanTaskItem[];
  members: GroupMemberItem[];
  onCreateTask: (payload: {
    title: string;
    description?: string;
    assigneeId?: string | null;
    dueDate?: string | null;
    status?: KanbanTaskStatus;
  }) => Promise<void>;
  onStatusChange: (taskId: string, nextStatus: KanbanTaskStatus) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

const COLUMNS: Array<{ key: KanbanTaskStatus; label: string; badgeColor: string }> = [
  { key: 'TODO', label: '📋 Cần làm (TODO)', badgeColor: '#94a3b8' },
  { key: 'IN_PROGRESS', label: '⚡ Đang thực hiện', badgeColor: '#60a5fa' },
  { key: 'REVIEW', label: '🔍 Đang Review', badgeColor: '#fbbf24' },
  { key: 'DONE', label: '✅ Hoàn thành (+5 Karma)', badgeColor: '#34d399' },
];

export const MiniKanbanBoard: React.FC<MiniKanbanBoardProps> = ({
  tasks,
  members,
  onCreateTask,
  onStatusChange,
  onDeleteTask,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [creating, setCreating] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      await onCreateTask({
        title: title.trim(),
        description: description.trim() || undefined,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        status: 'TODO',
      });
      setTitle('');
      setDescription('');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Quick Add Task Bar */}
      <form
        onSubmit={handleAdd}
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 12,
          padding: 14,
          display: 'grid',
          gridTemplateColumns: '1.4fr 1.4fr 1fr 1fr auto',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <input
          required
          placeholder="Tên công việc mới (VD: Thiết kế ERD, Code API...)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            background: '#0f172a',
            border: '1px solid var(--border-color)',
            color: '#fff',
            fontSize: 13,
          }}
        />
        <input
          placeholder="Mô tả chi tiết (tùy chọn)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            background: '#0f172a',
            border: '1px solid var(--border-color)',
            color: '#fff',
            fontSize: 13,
          }}
        />
        <select
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          style={{
            padding: '8px 10px',
            borderRadius: 8,
            background: '#0f172a',
            border: '1px solid var(--border-color)',
            color: '#fff',
            fontSize: 13,
          }}
        >
          <option value="">-- Giao cho thành viên --</option>
          {members.map((m) => (
            <option key={m.user_id} value={m.user_id}>
              {m.user?.full_name || m.assigned_role}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          style={{
            padding: '8px 10px',
            borderRadius: 8,
            background: '#0f172a',
            border: '1px solid var(--border-color)',
            color: '#fff',
            fontSize: 13,
          }}
        />
        <button
          type="submit"
          disabled={creating}
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            background: 'var(--brand-primary)',
            border: 'none',
            color: '#fff',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          + Thêm Task
        </button>
      </form>

      {/* 4-Column Board */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 14,
          alignItems: 'start',
        }}
      >
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div
              key={col.key}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                padding: 12,
                minHeight: 320,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: 8,
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: col.badgeColor }}>
                  {col.label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    padding: '2px 7px',
                    borderRadius: 999,
                    background: 'rgba(148, 163, 184, 0.14)',
                    color: '#fff',
                  }}
                >
                  {colTasks.length}
                </span>
              </div>

              {colTasks.map((task) => (
                <KanbanTaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={onStatusChange}
                  onDelete={onDeleteTask}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
