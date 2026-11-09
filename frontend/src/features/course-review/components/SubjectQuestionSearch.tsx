import React from 'react';
import { CourseItem } from '../../../types/identity.types';

interface SubjectQuestionSearchProps {
  courses: CourseItem[];
  selectedCourseCode: string;
  keyword: string;
  onlyAccepted: boolean;
  onCourseChange: (code: string) => void;
  onKeywordChange: (kw: string) => void;
  onOnlyAcceptedChange: (val: boolean) => void;
}

export const SubjectQuestionSearch: React.FC<SubjectQuestionSearchProps> = ({
  courses,
  selectedCourseCode,
  keyword,
  onlyAccepted,
  onCourseChange,
  onKeywordChange,
  onOnlyAcceptedChange,
}) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: 18,
        display: 'grid',
        gridTemplateColumns: '1fr 2fr auto',
        gap: 12,
        alignItems: 'center',
      }}
    >
      <select
        value={selectedCourseCode}
        onChange={(e) => onCourseChange(e.target.value)}
      >
        <option value="">-- Tất cả Mã học phần --</option>
        {courses.map((c) => (
          <option key={c.id} value={c.code}>
            [{c.code}] {c.name}
          </option>
        ))}
      </select>

      <input
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        placeholder="🔎 Full-text search câu hỏi cũ, thông báo lỗi (Segmentation fault, TCP socket, tích phân...)"
      />

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 13,
          color: '#34d399',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        <input
          type="checkbox"
          checked={onlyAccepted}
          onChange={(e) => onOnlyAcceptedChange(e.target.checked)}
          style={{ width: 15, height: 15 }}
        />
        Chỉ câu đã có Accepted Answer
      </label>
    </div>
  );
};
