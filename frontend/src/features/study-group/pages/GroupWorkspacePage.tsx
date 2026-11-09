import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MainLayout } from '../../../components/layout/MainLayout';
import { APP_ROUTES } from '../../../config/routes.config';
import { studyGroupService } from '../../../services/study-group.service';
import { GroupWorkspaceData } from '../../../types/study-group.types';
import { MemberRoleList } from '../components/MemberRoleList';
import { MiniKanbanBoard } from '../components/MiniKanbanBoard';
import { GroupSharedDocuments } from '../components/GroupSharedDocuments';

export const GroupWorkspacePage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [workspace, setWorkspace] = useState<GroupWorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'KANBAN' | 'MEMBERS' | 'DOCUMENTS'>(
    'KANBAN'
  );

  const loadWorkspace = async () => {
    if (!groupId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await studyGroupService.getWorkspace(groupId);
      setWorkspace(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Bạn không có quyền truy cập không gian làm việc này'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, [groupId]);

  return (
    <MainLayout>
      {loading ? (
        <div style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)' }}>
          Đang tải Không gian Nhóm Đồ án...
        </div>
      ) : error || !workspace ? (
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 14,
            padding: 32,
            textAlign: 'center',
          }}
        >
          <h3 style={{ color: '#f87171', marginTop: 0 }}>🔒 Không thể truy cập Workspace</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{error}</p>
          <Link
            to={APP_ROUTES.STUDY_GROUPS}
            style={{
              display: 'inline-block',
              marginTop: 12,
              padding: '9px 16px',
              borderRadius: 8,
              background: 'var(--brand-primary)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            ← Quay lại danh sách Nhóm Đồ án
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Workspace Header */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 14,
              padding: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Link
                  to={APP_ROUTES.STUDY_GROUPS}
                  style={{ fontSize: 12, color: '#60a5fa' }}
                >
                  ← Danh sách nhóm
                </Link>
                {workspace.group.course && (
                  <span
                    style={{
                      fontSize: 12,
                      padding: '2px 8px',
                      borderRadius: 6,
                      background: 'rgba(59, 130, 246, 0.16)',
                      color: '#60a5fa',
                      fontWeight: 700,
                    }}
                  >
                    #{workspace.group.course.code}
                  </span>
                )}
                <span
                  style={{
                    fontSize: 12,
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: 'rgba(16, 185, 129, 0.16)',
                    color: '#34d399',
                    fontWeight: 700,
                  }}
                >
                  Mục tiêu: {workspace.group.target_grade}
                </span>
              </div>
              <h1 style={{ margin: 0, fontSize: 21, color: '#fff' }}>
                🛠️ {workspace.group.group_name}
              </h1>
              {workspace.group.project_topic && (
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                  Đề tài: {workspace.group.project_topic}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              {workspace.conversationId && (
                <Link
                  to={`${APP_ROUTES.MESSENGER}?convId=${workspace.conversationId}`}
                  style={{
                    padding: '9px 16px',
                    borderRadius: 8,
                    background: 'rgba(59, 130, 246, 0.18)',
                    border: '1px solid rgba(59, 130, 246, 0.45)',
                    color: '#60a5fa',
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  💬 Mở Phòng Chat Nhóm
                </Link>
              )}
            </div>
          </div>

          {/* Sub-navigation Tabs */}
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { key: 'KANBAN', label: `📋 Mini-Kanban (${workspace.tasks.length})` },
              {
                key: 'MEMBERS',
                label: `👥 Thành viên & Duyệt đơn (${workspace.members.length}/${workspace.group.max_members})`,
              },
              {
                key: 'DOCUMENTS',
                label: `📂 Tài liệu Nhóm (${workspace.documents.length})`,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() =>
                  setActiveTab(tab.key as 'KANBAN' | 'MEMBERS' | 'DOCUMENTS')
                }
                style={{
                  padding: '9px 16px',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background:
                    activeTab === tab.key
                      ? 'var(--brand-primary)'
                      : 'var(--bg-secondary)',
                  color: activeTab === tab.key ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'KANBAN' && (
            <MiniKanbanBoard
              tasks={workspace.tasks}
              members={workspace.members}
              onCreateTask={async (payload) => {
                await studyGroupService.createKanbanTask(workspace.group.id, payload);
                await loadWorkspace();
              }}
              onStatusChange={async (taskId, nextStatus) => {
                await studyGroupService.updateKanbanTask(
                  workspace.group.id,
                  taskId,
                  { status: nextStatus }
                );
                await loadWorkspace();
              }}
              onDeleteTask={async (taskId) => {
                await studyGroupService.deleteKanbanTask(workspace.group.id, taskId);
                await loadWorkspace();
              }}
            />
          )}

          {activeTab === 'MEMBERS' && (
            <MemberRoleList
              members={workspace.members}
              applications={workspace.applications}
              isLead={workspace.myMembership.member_role === 'LEAD'}
              onReviewApplication={async (applicationId, status) => {
                await studyGroupService.reviewApplication(
                  workspace.group.id,
                  applicationId,
                  status
                );
                await loadWorkspace();
              }}
            />
          )}

          {activeTab === 'DOCUMENTS' && (
            <GroupSharedDocuments
              documents={workspace.documents}
              onUpload={async (payload) => {
                await studyGroupService.uploadGroupDocument(
                  workspace.group.id,
                  payload
                );
                await loadWorkspace();
              }}
            />
          )}
        </div>
      )}
    </MainLayout>
  );
};
