import React from 'react';

interface PdfViewerModalProps {
  title: string;
  fileUrl: string;
  onClose: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  title,
  fileUrl,
  onClose,
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 6, 23, 0.82)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          height: '85vh',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '12px 18px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <strong style={{ fontSize: 14 }}>📄 Xem trước PDF: {title}</strong>
          <div style={{ display: 'flex', gap: 10 }}>
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: '5px 12px',
                borderRadius: 6,
                background: 'var(--brand-primary)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Mở tab mới
            </a>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                padding: '5px 12px',
                borderRadius: 6,
                fontSize: 12,
              }}
            >
              Đóng
            </button>
          </div>
        </div>
        <iframe
          src={fileUrl}
          title={title}
          style={{ width: '100%', flex: 1, border: 'none', background: '#fff' }}
        />
      </div>
    </div>
  );
};
