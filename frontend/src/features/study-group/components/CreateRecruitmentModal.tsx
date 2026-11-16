import { useDialog } from '../../../hooks/useDialog';
import React, { useState } from 'react';
import { TargetGradeGoal } from '../../../types/study-group.types';

interface CreateRecruitmentModalProps {
  isOpen: boolean;
  courses: Array<{ id: number; code: string; name: string }>;
  onClose: () => void;
  onSubmit: (payload: {
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
  }) => Promise<void>;
}

export const CreateRecruitmentModal: React.FC<CreateRecruitmentModalProps> = ({
  isOpen,
  courses,
  onClose,
  onSubmit,
}) => {
  const dialogRef = useDialog(onClose, isOpen);
  const [courseId, setCourseId] = useState<number>(courses[0]?.id || 1);
  const [semester, setSemester] = useState('2026.1');
  const [groupName, setGroupName] = useState('');
  const [projectTopic, setProjectTopic] = useState('');
  const [targetGrade, setTargetGrade] = useState<TargetGradeGoal>('A+');
  const [maxMembers, setMaxMembers] = useState(4);
  const [slots, setSlots] = useState([
    { roleName: 'Backend Developer', skillsText: 'Node.js, PostgreSQL', quantityNeeded: 1 },
    { roleName: 'Frontend Developer', skillsText: 'React, TypeScript', quantityNeeded: 1 },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddSlot = () => {
    setSlots((prev) => [
      ...prev,
      { roleName: '', skillsText: '', quantityNeeded: 1 },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        courseId: Number(courseId || courses[0]?.id || 1),
        semester,
        groupName,
        projectTopic: projectTopic || undefined,
        targetGrade,
        maxMembers,
        slots: slots
          .filter((s) => s.roleName.trim().length > 0)
          .map((s) => ({
            roleName: s.roleName.trim(),
            requiredSkills: s.skillsText
              .split(',')
              .map((k) => k.trim())
              .filter(Boolean),
            quantityNeeded: Number(s.quantityNeeded || 1),
          })),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo nhóm đồ án');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Tạo nhóm học" tabIndex={-1}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(2, 6, 23, 0.78)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 16,
      }}
    >
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 640,
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)' }}>
            🚀 Đăng tin Tuyển đồng đội & Khởi tạo Workspace
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: 18,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: 10,
              marginBottom: 12,
              borderRadius: 20,
              background: 'var(--color-fog-mist)',
              color: 'var(--color-charcoal-ink)',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Học phần</label>
              <select aria-label="Học phần"
                value={courseId}
                onChange={(e) => setCourseId(Number(e.target.value))}
                style={{
                  width: '100%',
                  marginTop: 4,
                  padding: '9px 12px',
                  borderRadius: 20,
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  color: 'var(--color-charcoal-ink)',
                }}
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Học kỳ</label>
              <input
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: 4,
                  padding: '9px 12px',
                  borderRadius: 20,
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  color: 'var(--color-charcoal-ink)',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Tên nhóm đồ án</label>
            <input
              required
              placeholder="Ví dụ: Nhóm BTL Mạng xã hội Sinh viên - K68"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              style={{
                width: '100%',
                marginTop: 4,
                padding: '9px 12px',
                borderRadius: 20,
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                color: 'var(--color-charcoal-ink)',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Đề tài dự kiến (Tùy chọn)
            </label>
            <input
              placeholder="Ví dụ: Xây dựng nền tảng học thuật sinh viên trên Supabase + React"
              value={projectTopic}
              onChange={(e) => setProjectTopic(e.target.value)}
              style={{
                width: '100%',
                marginTop: 4,
                padding: '9px 12px',
                borderRadius: 20,
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                color: 'var(--color-charcoal-ink)',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Mục tiêu điểm số
              </label>
              <select aria-label="Mục tiêu điểm"
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value as TargetGradeGoal)}
                style={{
                  width: '100%',
                  marginTop: 4,
                  padding: '9px 12px',
                  borderRadius: 20,
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  color: 'var(--color-charcoal-ink)',
                }}
              >
                <option value="A+">A+ (Xuất sắc)</option>
                <option value="A">A (Giỏi)</option>
                <option value="B+">B+ (Khá giỏi)</option>
                <option value="PASS">PASS (Qua môn)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Số thành viên tối đa
              </label>
              <input
                type="number"
                min={2}
                max={15}
                value={maxMembers}
                onChange={(e) => setMaxMembers(Number(e.target.value))}
                style={{
                  width: '100%',
                  marginTop: 4,
                  padding: '9px 12px',
                  borderRadius: 20,
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  color: 'var(--color-charcoal-ink)',
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-charcoal-ink)' }}>
                Các vị trí cần tuyển (Recruitment Slots)
              </span>
              <button
                type="button"
                onClick={handleAddSlot}
                style={{
                  background: 'var(--color-fog-mist)',
                  border: '1px solid var(--color-fog-mist)',
                  color: 'var(--color-charcoal-ink)',
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                + Thêm vị trí
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {slots.map((slot, index) => (
                <div
                  key={index}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1.6fr 80px',
                    gap: 8,
                  }}
                >
                  <input
                    placeholder="Vị trí (VD: Backend, Embedded)"
                    value={slot.roleName}
                    onChange={(e) => {
                      const next = [...slots];
                      next[index].roleName = e.target.value;
                      setSlots(next);
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 20,
                      background: '#ffffff',
                      border: '1px solid var(--border-color)',
                      color: 'var(--color-charcoal-ink)',
                      fontSize: 13,
                    }}
                  />
                  <input
                    placeholder="Kỹ năng cách nhau dấu phẩy (React, C++)"
                    value={slot.skillsText}
                    onChange={(e) => {
                      const next = [...slots];
                      next[index].skillsText = e.target.value;
                      setSlots(next);
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 20,
                      background: '#ffffff',
                      border: '1px solid var(--border-color)',
                      color: 'var(--color-charcoal-ink)',
                      fontSize: 13,
                    }}
                  />
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={slot.quantityNeeded}
                    onChange={(e) => {
                      const next = [...slots];
                      next[index].quantityNeeded = Number(e.target.value);
                      setSlots(next);
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 20,
                      background: '#ffffff',
                      border: '1px solid var(--border-color)',
                      color: 'var(--color-charcoal-ink)',
                      fontSize: 13,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 16px',
                borderRadius: 20,
                background: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '9px 18px',
                borderRadius: 20,
                background: 'var(--brand-primary)',
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {submitting ? 'Đang khởi tạo...' : 'Tạo nhóm & Mở tuyển'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
