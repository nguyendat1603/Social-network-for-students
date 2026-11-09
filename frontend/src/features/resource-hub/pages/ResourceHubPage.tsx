import React, { useCallback, useEffect, useState } from 'react';
import { MainLayout } from '../../../components/layout/MainLayout';
import { PdfViewerModal } from '../../../components/common/PdfViewerModal';
import { identityService } from '../../../services/identity.service';
import { resourceHubService } from '../../../services/resource-hub.service';
import { CourseItem, FacultyItem } from '../../../types/identity.types';
import {
  DocumentItem,
  DocumentType,
  HierarchyFacultyNode,
} from '../../../types/resource-hub.types';
import { DocumentCard } from '../components/DocumentCard';
import { FacultyCourseSemesterTree } from '../components/FacultyCourseSemesterTree';
import { UploadResourceModal } from '../components/UploadResourceModal';

export const ResourceHubPage: React.FC = () => {
  const [tree, setTree] = useState<HierarchyFacultyNode[]>([]);
  const [faculties, setFaculties] = useState<FacultyItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | ''>('');
  const [keyword, setKeyword] = useState('');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadHierarchyAndCatalog = useCallback(async () => {
    const [hierarchyData, catalogData] = await Promise.all([
      resourceHubService.getHierarchyTree(),
      identityService.getCatalog(),
    ]);
    setTree(hierarchyData);
    setFaculties(catalogData.faculties);
    setCourses(catalogData.courses);
  }, []);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const list = await resourceHubService.listResources({
        facultyId: selectedFacultyId || undefined,
        courseId: selectedCourseId || undefined,
        semester: selectedSemester || undefined,
        docType: selectedDocType || undefined,
        q: keyword || undefined,
      });
      setDocuments(list);
    } finally {
      setLoading(false);
    }
  }, [
    selectedFacultyId,
    selectedCourseId,
    selectedSemester,
    selectedDocType,
    keyword,
  ]);

  useEffect(() => {
    loadHierarchyAndCatalog().catch(() => {});
  }, [loadHierarchyAndCatalog]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleDownload = async (docId: string) => {
    setStatusError(null);
    try {
      const res = await resourceHubService.downloadResource(docId);
      window.open(res.downloadUrl, '_blank', 'noopener,noreferrer');
      await loadDocuments();
    } catch (err) {
      setStatusError(
        err instanceof Error ? err.message : 'Không thể tải tài liệu.'
      );
    }
  };

  const handleVote = async (docId: string, voteType: 'UPVOTE' | 'DOWNVOTE') => {
    await resourceHubService.voteResource(docId, voteType);
    await loadDocuments();
  };

  return (
    <MainLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>
              📂 Kho Tài liệu Mở (Document & Resource Hub)
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Phân tầng 4 cấp: Khoa/Viện → Mã môn học → Kỳ học/Năm → Loại tài liệu (Đề thi, Slide, BTL).
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            style={{
              background: 'var(--brand-primary)',
              color: '#fff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            + Upload Tài liệu mới
          </button>
        </div>

        {statusError && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              fontSize: 13,
            }}
          >
            {statusError}
          </div>
        )}

        <FacultyCourseSemesterTree
          tree={tree}
          selectedFacultyId={selectedFacultyId}
          selectedCourseId={selectedCourseId}
          selectedSemester={selectedSemester}
          selectedDocType={selectedDocType}
          onSelectFaculty={setSelectedFacultyId}
          onSelectCourse={setSelectedCourseId}
          onSelectSemester={setSelectedSemester}
          onSelectDocType={setSelectedDocType}
        />

        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="🔍 Tìm nhanh đề thi, slide bài giảng, tóm tắt công thức hoặc code mẫu..."
        />

        {loading ? (
          <div>Đang tải kho tài liệu từ Supabase Online...</div>
        ) : documents.length === 0 ? (
          <div
            style={{
              padding: 36,
              textAlign: 'center',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
            }}
          >
            Chưa có tài liệu nào khớp bộ lọc. Hãy đóng góp tài liệu đầu tiên để nhận +5 Karma cho mỗi lượt Upvote!
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: 16,
            }}
          >
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onPreview={(d) => setPreviewDoc(d)}
                onDownload={handleDownload}
                onVote={handleVote}
              />
            ))}
          </div>
        )}

        {previewDoc && (
          <PdfViewerModal
            title={previewDoc.title}
            fileUrl={previewDoc.preview_url || previewDoc.file_url}
            onClose={() => setPreviewDoc(null)}
          />
        )}

        {showUploadModal && (
          <UploadResourceModal
            faculties={faculties}
            courses={courses}
            onClose={() => setShowUploadModal(false)}
            onSubmit={async (payload) => {
              await resourceHubService.uploadResource(payload);
              await loadHierarchyAndCatalog();
              await loadDocuments();
            }}
          />
        )}
      </div>
    </MainLayout>
  );
};
