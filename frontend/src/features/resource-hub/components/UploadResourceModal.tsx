import React, { useState } from 'react';
import { CourseItem, FacultyItem } from '../../../types/identity.types';
import { DocumentType } from '../../../types/resource-hub.types';

interface UploadResourceModalProps {
  faculties: FacultyItem[];
  courses: CourseItem[];
  onClose: () => void;
  onSubmit: (payload: {
    facultyId: string;
    courseId: string;
    semester: string;
    docType: DocumentType;
    title: string;
    description?: string | null;
    fileUrl: string;
    fileName: string;
    fileSize?: number;
  }) => Promise<void>;
}

export const UploadResourceModal: React.FC<UploadResourceModalProps> = ({
  faculties,
  courses,
  onClose,
  onSubmit,
}) => {
  const [facultyId, setFacultyId] = useState(faculties[0]?.id || '');
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [semester, setSemester] = useState('2025.1');
  const [docType, setDocType] = useState<DocumentType>('FINAL_EXAM');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState(
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  );
  const [fileName, setFileName] = useState('De_thi_cuoi_ky_IT3080_2025_1.pdf');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        facultyId,
        courseId,
        semester,
        docType,
        title,
        description: description.trim() || null,
        fileUrl,
        fileName,
        fileSize: 245760,
      });
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Không thể tải lên tài liệu.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 6, 23, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 95,
        padding: 20,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: 620,
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>
            📤 Đóng góp Tài liệu Học tập (Phân tầng 4 Cấp)
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#fff' }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              1. Khoa / Viện *
            </label>
            <select
              required
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value)}
            >
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  [{f.code}] {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              2. Mã môn học *
            </label>
            <select
              required
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  [{c.code}] {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              3. Kỳ học (YYYY.1/2/3) *
            </label>
            <input
              required
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              placeholder="2025.1"
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              4. Loại tài liệu *
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as DocumentType)}
            >
              <option value="MIDTERM_EXAM">Đề thi giữa kỳ</option>
              <option value="FINAL_EXAM">Đề thi cuối kỳ</option>
              <option value="ASSIGNMENT_PROJECT">Bài tập lớn / Code mẫu</option>
              <option value="LECTURE_SLIDE">Slide bài giảng</option>
              <option value="SUMMARY_NOTE">Tóm tắt lý thuyết</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Tiêu đề tài liệu *
          </label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: Đề thi Cuối kỳ Mạng máy tính IT3080 kỳ 2025.1 (kèm lời giải chi tiết)"
          />
        </div>

        <div>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Mô tả ngắn gọn
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ghi chú nội dung chính, cấu trúc đề thi hoặc hướng dẫn biên dịch code..."
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              URL Tệp PDF / Tài liệu *
            </label>
            <input
              required
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Tên tệp *
            </label>
            <input
              required
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              padding: '9px 16px',
              borderRadius: 8,
            }}
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{
              background: 'var(--brand-primary)',
              border: 'none',
              color: '#fff',
              padding: '9px 20px',
              borderRadius: 8,
              fontWeight: 700,
            }}
          >
            {submitting ? 'Đang kiểm tra SHA-256 & tải lên...' : 'Tải lên Kho Tài liệu'}
          </button>
        </div>
      </form>
    </div>
  );
};
