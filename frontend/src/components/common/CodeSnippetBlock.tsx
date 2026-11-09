import React, { useState } from 'react';

interface CodeSnippetBlockProps {
  code: string;
  language?: string;
}

export const CodeSnippetBlock: React.FC<CodeSnippetBlockProps> = ({
  code,
  language = 'code',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      style={{
        margin: '10px 0',
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        backgroundColor: '#090d16',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 12px',
          backgroundColor: '#131c2e',
          fontSize: 11,
          color: 'var(--text-muted)',
        }}
      >
        <span style={{ textTransform: 'uppercase', fontWeight: 700 }}>
          {language || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-color)',
            color: '#93c5fd',
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 11,
          }}
        >
          {copied ? '✓ Đã sao chép' : 'Sao chép'}
        </button>
      </div>
      <pre
        style={{
          padding: 14,
          overflowX: 'auto',
          fontSize: 13,
          fontFamily: "'Fira Code', 'Consolas', monospace",
          color: '#e2e8f0',
          lineHeight: 1.55,
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
};
