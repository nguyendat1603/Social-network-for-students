import { useSearchParams } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import { MainLayout } from '../../../components/layout/MainLayout';
import { studyGroupService } from '../../../services/study-group.service';
import { resourceHubService } from '../../../services/resource-hub.service';
import { StudyGroupItem, TargetGradeGoal } from '../../../types/study-group.types';
import { TeamRecruitmentCard } from '../components/TeamRecruitmentCard';
import { CreateRecruitmentModal } from '../components/CreateRecruitmentModal';
import { TeamApplicationDrawer } from '../components/TeamApplicationDrawer';

export const TeammateMatchingPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const code = params.get('code') || params.get('courseCode');
  const [groups, setGroups] = useState<StudyGroupItem[]>([]);
  const [courses, setCourses] = useState<Array<{ id: string | number; code: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  const courseId = courses.find(course => course.code === code)?.id;
  const [error, setError] = useState('');
  const requestVersion = useRef(0);
  const [targetGrade, setTargetGrade] = useState<TargetGradeGoal | ''>('');
  const [roleName, setRoleName] = useState('');
  const [onlyRecruiting, setOnlyRecruiting] = useState(true);
  const [search, setSearch] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedGroupForApply, setSelectedGroupForApply] =
    useState<StudyGroupItem | null>(null);

  const loadData = async () => {
    const version = ++requestVersion.current;
    setLoading(true);
    setError('');
    try {
      const hierarchy = await resourceHubService.getHierarchyTree();
      if (version !== requestVersion.current) return;
      setCourses(
        (hierarchy || []).flatMap((f) =>
          (f.courses || []).map((c) => ({
            id: c.id,
            code: c.code,
            name: c.name,
          }))
        )
      );
      const scopedCourse = hierarchy.flatMap(faculty => faculty.courses || []).find(course => course.code === code);
      if (code && !scopedCourse) throw new Error('Không tìm thấy học phần. Vui lòng chọn học phần hợp lệ trong danh sách.');
      const groupList = await studyGroupService.listStudyGroups({
        courseId: code ? scopedCourse!.id : undefined,
        targetGrade: targetGrade || undefined,
        roleName: roleName || undefined,
        onlyRecruiting,
        search: search || undefined,
      });
      if (version === requestVersion.current) setGroups(groupList);

    } catch (err) {
      if (version === requestVersion.current) setError(err instanceof Error ? err.message : 'Không thể tải nhóm học. Vui lòng thử lại.');
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    return () => { requestVersion.current++; };
  }, [code, targetGrade, onlyRecruiting]);

  return (
    <MainLayout pageClassName="campus-page campus-groups">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 20,
            padding: 20,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 22, color: 'var(--text-primary)' }}>
              Nhóm học & đồ án
            </h1>
            <p
              style={{
                margin: '6px 0 0',
                fontSize: 13,
                color: 'var(--text-secondary)',
              }}
            >
              Tìm đồng đội cùng mục tiêu điểm số (A+/A), đúng kỹ năng chuyên môn (Backend, Frontend, Embedded) và quản lý tiến độ trên Mini-Kanban.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            style={{
              padding: '10px 18px',
              borderRadius: 20,
              background: 'var(--brand-primary)',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            + Đăng tin Tuyển đồng đội
          </button>
        </div>

        {/* Filters */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 20,
            padding: 14,
            display: 'grid',
            gridTemplateColumns: '1.3fr 1fr 1fr 1fr auto',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <input
            placeholder="Tìm theo tên nhóm hoặc đề tài..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadData()}
            style={{
              padding: '9px 12px',
              borderRadius: 20,
              background: '#ffffff',
              border: '1px solid var(--border-color)',
              color: 'var(--color-charcoal-ink)',
              fontSize: 13,
            }}
          />

          <select aria-label="Học phần"
            value={courseId || ''}
            onChange={(e) => {
              const next = new URLSearchParams(params);
              const course = courses.find(item => String(item.id) === e.target.value);
              if (course) next.set('code', course.code); else next.delete('code');
              next.delete('courseCode');
              setParams(next);
            }}
            style={{
              padding: '9px 10px',
              borderRadius: 20,
              background: '#ffffff',
              border: '1px solid var(--border-color)',
              color: 'var(--color-charcoal-ink)',
              fontSize: 13,
            }}
          >
            <option value="">Tất cả học phần</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>

          <select aria-label="Mục tiêu điểm"
            value={targetGrade}
            onChange={(e) => setTargetGrade(e.target.value as TargetGradeGoal | '')}
            style={{
              padding: '9px 10px',
              borderRadius: 20,
              background: '#ffffff',
              border: '1px solid var(--border-color)',
              color: 'var(--color-charcoal-ink)',
              fontSize: 13,
            }}
          >
            <option value="">Mọi mục tiêu điểm</option>
            <option value="A+">Mục tiêu A+</option>
            <option value="A">Mục tiêu A</option>
            <option value="B+">Mục tiêu B+</option>
            <option value="PASS">Qua môn (PASS)</option>
          </select>

          <input
            placeholder="Lọc vị trí (Backend, AI...)"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadData()}
            style={{
              padding: '9px 12px',
              borderRadius: 20,
              background: '#ffffff',
              border: '1px solid var(--border-color)',
              color: 'var(--color-charcoal-ink)',
              fontSize: 13,
            }}
          />

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={onlyRecruiting}
              onChange={(e) => setOnlyRecruiting(e.target.checked)}
            />
            Đang tuyển
          </label>
        </div>

        {/* List */}
        {error && <div role="alert" className="campus-error">{error} <button type="button" onClick={loadData}>Thử lại</button></div>}
        {error ? null : loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
            Đang tải danh sách nhóm đồ án...
          </div>
        ) : groups.length === 0 ? (
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 20,
              padding: 36,
              textAlign: 'center',
              color: 'var(--text-secondary)',
            }}
          >
            Chưa có nhóm đồ án nào khớp bộ lọc. Hãy là người đầu tiên khởi tạo nhóm!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {groups.map((group) => (
              <TeamRecruitmentCard
                key={group.id}
                group={group}
                onApplyClick={(g) => setSelectedGroupForApply(g)}
              />
            ))}
          </div>
        )}
      </div>

      <CreateRecruitmentModal
        key={`${isCreateOpen}-${courseId || 'all'}`}
        isOpen={isCreateOpen}
        courses={courses}
        defaultCourseId={courseId}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={async (payload) => {
          await studyGroupService.createStudyGroup(payload);
          await loadData();
        }}
      />

      <TeamApplicationDrawer
        group={selectedGroupForApply}
        onClose={() => setSelectedGroupForApply(null)}
        onSubmit={async (groupId, payload) => {
          await studyGroupService.applyToStudyGroup(groupId, payload);
          await loadData();
        }}
      />
    </MainLayout>
  );
};
