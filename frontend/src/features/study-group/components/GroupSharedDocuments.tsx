import React, { useState } from 'react';
import { GroupDocumentItem } from '../../../types/study-group.types';

interface GroupSharedDocumentsProps {
  documents: GroupDocumentItem[];
  onUpload: (payload: {
    title: string;
    fileUrl: string;
    fileSizeBytes?: number;
  }) => Promise<void>;
}

export const GroupSharedDocuments: React.FC<GroupSharedDocumentsProps> = ({
  documents,
  onUpload,
}) => {
  const [title, setTitle] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fileUrl.trim()) return;
    setUploading(true);
    try {
      await onUpload({
        title: title.trim(),
        fileUrl: fileUrl.trim(),
      });
      setTitle('');
      setFileUrl('');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 12,
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <h4 style={{ margin: 0, fontSize: 15, color: 'var(--text-primary)' }}>
        📂 Kho Tài liệu Nội bộ Nhóm Đồ án ({documents.length})
      </h4>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr auto', gap: 8 }}
      >
        <input
          required
          placeholder="Tên tài liệu (VD: Slide Báo cáo Giữa kỳ)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            padding: '8px 10px',
            borderRadius: 8,
            background: '#ffffff',
            border: '1px solid var(--border-color)',
            color: '#fff',
            fontSize: 13,
          }}
        />
        <input
          required
          placeholder="URL tài liệu (Google Docs, GitHub, Figma, PDF...)"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          style={{
            padding: '8px 10px',
            borderRadius: 8,
            background: '#ffffff',
            border: '1px solid var(--border-color)',
            color: '#fff',
            fontSize: 13,
          }}
        />
        <button
          type="submit"
          disabled={uploading}
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            background: 'var(--brand-primary)',
            border: 'none',
            color: '#fff',
            fontWeight: 600,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          Lưu tài liệu
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {documents.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Chưa có tài liệu chung nào trong nhóm.
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                borderRadius: 8,
                background: 'rgba(15, 23, 42, 0.55)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#fff' }}>
                  📄 {doc.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  Đăng bởi {doc.uploader?.full_name || 'Thành viên'} •{' '}
                  {new Date(doc.created_at).toLocaleDateString('vi-VN')}
                </div>
              </div>
              <a
                href={doc.file_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  background: 'rgba(59, 130, 246, 0.16)',
                  color: '#60a5fa',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Mở tài liệu ↗
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
