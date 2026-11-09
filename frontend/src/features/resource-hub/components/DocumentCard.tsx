import React from 'react';
import { Link } from 'react-router-dom';
import { DocumentItem } from '../../../types/resource-hub.types';
import { ResourceReliabilityVote } from './ResourceReliabilityVote';

interface DocumentCardProps {
  doc: DocumentItem;
  onPreview: (doc: DocumentItem) => void;
  onDownload: (docId: string) => void;
  onVote: (docId: string, voteType: 'UPVOTE' | 'DOWNVOTE') => void;
}

const DOC_BADGE_MAP: Record<string, { label: string; color: string }> = {
  MIDTERM_EXAM: { label: 'Đề thi Giữa kỳ', color: '#f59e0b' },
  FINAL_EXAM: { label: 'Đề thi Cuối kỳ', color: '#ef4444' },
  ASSIGNMENT_PROJECT: { label: 'BTL / Code mẫu', color: '#3b82f6' },
  LECTURE_SLIDE: { label: 'Slide Bài giảng', color: '#10b981' },
  SUMMARY_NOTE: { label: 'Tóm tắt Lý thuyết', color: '#8b5cf6' },
};

export const DocumentCard: React.FC<DocumentCardProps> = ({
  doc,
  onPreview,
  onDownload,
  onVote,
}) => {
  const badge = DOC_BADGE_MAP[doc.doc_type] || {
    label: doc.doc_type,
    color: '#60a5fa',
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: 18,
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
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 6,
              backgroundColor: 'rgba(59, 130, 246, 0.16)',
              color: badge.color,
            }}
          >
            {badge.label}
          </span>
          {doc.course && (
            <span style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa' }}>
              #{doc.course.code}
            </span>
          )}
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            · Kỳ {doc.semester}
          </span>
        </div>

        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          ⬇ {doc.download_count} lượt tải
        </span>
      </div>

      <Link
        to={`/resources/${doc.id}`}
        style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}
      >
        {doc.title}
      </Link>

      {doc.description && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {doc.description}
        </p>
      )}

      <div
        style={{
          fontSize: 12,
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>
          Đóng góp bởi: <strong>{doc.uploader?.full_name || 'Sinh viên'}</strong>
        </span>
        <span>Tệp: {doc.file_name}</span>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid var(--border-color)',
          paddingTop: 10,
          marginTop: 4,
        }}
      >
        <ResourceReliabilityVote
          upvoteCount={doc.upvote_count}
          downvoteCount={doc.downvote_count}
          onVote={(vt) => onVote(doc.id, vt)}
        />

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => onPreview(doc)}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            👁️ Preview PDF
          </button>
          <button
            type="button"
            onClick={() => onDownload(doc.id)}
            style={{
              background: 'var(--brand-primary)',
              border: 'none',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            ⬇ Tải xuống
          </button>
        </div>
      </div>
    </div>
  );
};
