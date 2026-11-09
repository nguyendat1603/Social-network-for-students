import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MainLayout } from '../../../components/layout/MainLayout';
import { APP_ROUTES } from '../../../config/routes.config';
import { resourceHubService } from '../../../services/resource-hub.service';
import { DocumentItem } from '../../../types/resource-hub.types';
import { InlinePdfPreview } from '../components/InlinePdfPreview';
import { ResourceReliabilityVote } from '../components/ResourceReliabilityVote';

export const DocumentDetailPage: React.FC = () => {
  const { docId } = useParams<{ docId: string }>();
  const [doc, setDoc] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    if (!docId) return;
    setLoading(true);
    try {
      const data = await resourceHubService.getDetail(docId);
      setDoc(data);
    } finally {
      setLoading(false);
    }
  }, [docId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleDownload = async () => {
    if (!doc) return;
    setError(null);
    try {
      const res = await resourceHubService.downloadResource(doc.id);
      window.open(res.downloadUrl, '_blank', 'noopener,noreferrer');
      await loadDetail();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải xuống.');
    }
  };

  if (loading || !doc) {
    return (
      <MainLayout>
        <div>Đang tải thông tin tài liệu...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Link to={APP_ROUTES.RESOURCE_HUB} style={{ fontSize: 13 }}>
          ← Quay lại Kho Tài liệu Mở
        </Link>

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

        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: '#60a5fa', fontWeight: 700 }}>
              [{doc.faculty?.code}] → #{doc.course?.code} ({doc.course?.name}) → Kỳ {doc.semester} → {doc.doc_type}
            </div>
            <h1 style={{ fontSize: 21, fontWeight: 800, marginTop: 4 }}>
              {doc.title}
            </h1>
            {doc.description && (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                {doc.description}
              </p>
            )}
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
              SHA-256: <code>{doc.file_sha256.slice(0, 16)}...</code> · ⬇{' '}
              {doc.download_count} lượt tải
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ResourceReliabilityVote
              upvoteCount={doc.upvote_count}
              downvoteCount={doc.downvote_count}
              onVote={async (vt) => {
                await resourceHubService.voteResource(doc.id, vt);
                await loadDetail();
              }}
            />
            <button
              type="button"
              onClick={handleDownload}
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
              ⬇ Tải về máy
            </button>
          </div>
        </div>

        <InlinePdfPreview
          fileUrl={doc.preview_url || doc.file_url}
          title={doc.title}
        />
      </div>
    </MainLayout>
  );
};
