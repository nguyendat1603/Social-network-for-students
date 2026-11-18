import { useSearchParams } from 'react-router-dom';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  const [params, setParams] = useSearchParams();
  const code = params.get('code') || params.get('courseCode');
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
  const [catalogState, setCatalogState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [catalogError, setCatalogError] = useState('');
  const documentVersion = useRef(0);
  const catalogVersion = useRef(0);

  const loadHierarchyAndCatalog = useCallback(async () => {
    const version = ++catalogVersion.current;
    setCatalogState('loading');
    setCatalogError('');
    documentVersion.current++;
    try {
      const [hierarchyData, catalogData] = await Promise.all([
        resourceHubService.getHierarchyTree(),
        identityService.getCatalog(),
      ]);
      if (version !== catalogVersion.current) return;
      setTree(hierarchyData);
      setFaculties(catalogData.faculties);
      setCourses(catalogData.courses);
      setCatalogState('ready');
    } catch (err) {
      if (version !== catalogVersion.current) return;
      setCatalogError(err instanceof Error ? err.message : 'Không thể tải danh mục học phần.');
      setCatalogState('error');
    }
  }, []);

  useEffect(() => {
    setSelectedCourseId(code ? courses.find(course => course.code === code)?.id || '' : '');
  }, [code, courses]);

  const loadDocuments = useCallback(async () => {
    const version = ++documentVersion.current;
    setStatusError(null);
    if (catalogState !== 'ready') { setLoading(false); return; }
    setLoading(true);
    if (code && !courses.some(course => course.code === code)) {
      setDocuments([]);
      setStatusError('Không tìm thấy học phần. Hãy chọn học phần hợp lệ hoặc xem tất cả tài liệu.');
      setLoading(false);
      return;
    }
    try {
      const list = await resourceHubService.listResources({
        facultyId: selectedFacultyId || undefined,
        courseId: (code ? courses.find(course => course.code === code)?.id : selectedCourseId) || undefined,
        semester: selectedSemester || undefined,
        docType: selectedDocType || undefined,
        q: keyword || undefined,
      });
      if (version !== documentVersion.current) return;
      setDocuments(list);
      setStatusError(null);
    } catch (err) {
      if (version === documentVersion.current) setStatusError(err instanceof Error ? err.message : 'Không thể tải tài liệu.');
    } finally {
      if (version === documentVersion.current) setLoading(false);
    }
  }, [
    code,
    catalogState,
    courses,
    selectedFacultyId,
    selectedCourseId,
    selectedSemester,
    selectedDocType,
    keyword,
  ]);

  useEffect(() => {
    loadHierarchyAndCatalog();
    return () => { catalogVersion.current++; };
  }, [loadHierarchyAndCatalog]);

  useEffect(() => {
    loadDocuments();
    return () => { documentVersion.current++; };
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
    <MainLayout pageClassName="campus-page campus-resources">
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
              borderRadius: 20,
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            + Upload Tài liệu mới
          </button>
        </div>

        {(catalogError || statusError) && (
          <div role="alert"
            style={{
              padding: '10px 14px',
              borderRadius: 20,
              background: 'var(--color-fog-mist)',
              color: 'var(--color-charcoal-ink)',
              fontSize: 13,
            }}
          >
            {catalogError || statusError}
            <button type="button" onClick={() => catalogState === 'error' ? loadHierarchyAndCatalog() : loadDocuments()}>Thử lại</button>
            {code && <button type="button" data-demo-read-action onClick={() => { const next = new URLSearchParams(params); next.delete('code'); next.delete('courseCode'); setParams(next); }}>Xem tất cả tài liệu</button>}
          </div>
        )}

        <FacultyCourseSemesterTree
          tree={tree}
          selectedFacultyId={selectedFacultyId}
          selectedCourseId={selectedCourseId}
          selectedSemester={selectedSemester}
          selectedDocType={selectedDocType}
          onSelectFaculty={setSelectedFacultyId}
          onSelectCourse={id => {
            setSelectedCourseId(id);
            const next = new URLSearchParams(params);
            const course = courses.find(item => item.id === id);
            if (course) next.set('code', course.code); else next.delete('code');
            next.delete('courseCode');
            setParams(next);
          }}
          onSelectSemester={setSelectedSemester}
          onSelectDocType={setSelectedDocType}
        />

        <input aria-label="Từ khóa"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="🔍 Tìm nhanh đề thi, slide bài giảng, tóm tắt công thức hoặc code mẫu..."
        />

        {catalogState === 'error' || statusError ? null : catalogState === 'loading' || loading ? (
          <div>Đang tải kho tài liệu...</div>
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
