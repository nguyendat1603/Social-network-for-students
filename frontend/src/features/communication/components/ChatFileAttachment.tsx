import React, { useState } from 'react';

interface ChatFileAttachmentProps {
  onAttachFile: (payload: { fileName: string; fileUrl: string }) => Promise<void>;
}

export const ChatFileAttachment: React.FC<ChatFileAttachmentProps> = ({
  onAttachFile,
}) => {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          padding: '8px 12px',
          borderRadius: 20,
          background: 'var(--color-fog-mist)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-secondary)',
          fontSize: 12,
          cursor: 'pointer',
        }}
      >
        📎 Đính kèm tài liệu
      </button>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        padding: '8px 10px',
        borderRadius: 20,
        background: '#ffffff',
        border: '1px solid var(--border-color)',
      }}
    >
      <input
        placeholder="Tên file (VD: BTL_Report.pdf)"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
        style={{
          padding: '6px 8px',
          borderRadius: 20,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          color: 'var(--color-charcoal-ink)',
          fontSize: 12,
        }}
      />
      <input
        placeholder="URL tài liệu..."
        value={fileUrl}
        onChange={(e) => setFileUrl(e.target.value)}
        style={{
          padding: '6px 8px',
          borderRadius: 20,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          color: 'var(--color-charcoal-ink)',
          fontSize: 12,
          minWidth: 200,
        }}
      />
      <button
        type="button"
        onClick={async () => {
          if (!fileUrl.trim()) return;
          await onAttachFile({
            fileName: fileName.trim() || 'Tai_lieu_nhom.pdf',
            fileUrl: fileUrl.trim(),
          });
          setFileName('');
          setFileUrl('');
          setOpen(false);
        }}
        style={{
          padding: '6px 10px',
          borderRadius: 20,
          background: 'var(--brand-primary)',
          border: 'none',
          color: 'var(--color-charcoal-ink)',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Gửi File
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
        }}
      >
        ✕
      </button>
    </div>
  );
};
