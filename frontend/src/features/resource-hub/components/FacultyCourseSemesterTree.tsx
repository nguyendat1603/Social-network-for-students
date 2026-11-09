import React from 'react';
import {
  DocumentType,
  HierarchyFacultyNode,
} from '../../../types/resource-hub.types';

interface FacultyCourseSemesterTreeProps {
  tree: HierarchyFacultyNode[];
  selectedFacultyId: string;
  selectedCourseId: string;
  selectedSemester: string;
  selectedDocType: DocumentType | '';
  onSelectFaculty: (id: string) => void;
  onSelectCourse: (id: string) => void;
  onSelectSemester: (sem: string) => void;
  onSelectDocType: (type: DocumentType | '') => void;
}

const DOC_TYPE_LABELS: Array<{ value: DocumentType | ''; label: string }> = [
  { value: '', label: 'Tất cả loại tài liệu' },
  { value: 'MIDTERM_EXAM', label: '📝 Đề thi giữa kỳ' },
  { value: 'FINAL_EXAM', label: '🎓 Đề thi cuối kỳ' },
  { value: 'ASSIGNMENT_PROJECT', label: '💻 Bài tập lớn / Code mẫu' },
  { value: 'LECTURE_SLIDE', label: '📊 Slide bài giảng' },
  { value: 'SUMMARY_NOTE', label: '📑 Tóm tắt lý thuyết' },
];

export const FacultyCourseSemesterTree: React.FC<
  FacultyCourseSemesterTreeProps
> = ({
  tree,
  selectedFacultyId,
  selectedCourseId,
  selectedSemester,
  selectedDocType,
  onSelectFaculty,
  onSelectCourse,
  onSelectSemester,
  onSelectDocType,
}) => {
  const activeFaculty = tree.find((f) => f.id === selectedFacultyId);
  const availableCourses = activeFaculty
    ? activeFaculty.courses
    : tree.flatMap((f) => f.courses);

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: 18,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
      }}
    >
      <div>
        <label style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
          1. Khoa / Viện (Faculty)
        </label>
        <select
          value={selectedFacultyId}
          onChange={(e) => {
            onSelectFaculty(e.target.value);
            onSelectCourse('');
          }}
        >
          <option value="">-- Tất cả Khoa / Viện --</option>
          {tree.map((f) => (
            <option key={f.id} value={f.id}>
              [{f.code}] {f.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
          2. Mã môn học (Course)
        </label>
        <select
          value={selectedCourseId}
          onChange={(e) => onSelectCourse(e.target.value)}
        >
          <option value="">-- Tất cả Học phần --</option>
          {availableCourses.map((c) => (
            <option key={c.id} value={c.id}>
              [{c.code}] {c.name} ({c.documentCount})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
          3. Kỳ học / Năm (Semester)
        </label>
        <select
          value={selectedSemester}
          onChange={(e) => onSelectSemester(e.target.value)}
        >
          <option value="">-- Tất cả Kỳ học --</option>
          <option value="2025.2">2025.2</option>
          <option value="2025.1">2025.1</option>
          <option value="2024.2">2024.2</option>
          <option value="2024.1">2024.1</option>
          <option value="2023.2">2023.2</option>
        </select>
      </div>

      <div>
        <label style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
          4. Loại tài liệu (Resource Type)
        </label>
        <select
          value={selectedDocType}
          onChange={(e) =>
            onSelectDocType(e.target.value as DocumentType | '')
          }
        >
          {DOC_TYPE_LABELS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
