import React from 'react';

interface InlinePdfPreviewProps {
  fileUrl: string;
  title: string;
}

export const InlinePdfPreview: React.FC<InlinePdfPreviewProps> = ({
  fileUrl,
  title,
}) => {
  return (
    <div
      style={{
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        backgroundColor: '#0f172a',
      }}
    >
      <div
        style={{
          padding: '10px 16px',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          fontSize: 13,
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>📄 Xem trước trực tiếp: {title}</span>
        <a href={fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>
          Mở toàn màn hình ↗
        </a>
      </div>
      <iframe
        src={fileUrl}
        title={title}
        style={{
          width: '100%',
          height: 560,
          border: 'none',
          backgroundColor: '#fff',
        }}
      />
    </div>
  );
};
