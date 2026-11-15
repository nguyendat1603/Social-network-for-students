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
        borderRadius: 'var(--radius-cards)',
        overflow: 'hidden',
        backgroundColor: 'var(--color-fog-mist)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 16px',
          backgroundColor: 'var(--color-ash-border)',
          fontSize: 11,
          color: 'var(--color-graphite)',
        }}
      >
        <span>
          [(<span className="hl-cyan">c</span>)ode · {language || 'snippet'}]
        </span>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            backgroundColor: 'var(--color-paper-white)',
            color: 'var(--color-charcoal-ink)',
            padding: '2px 12px',
            borderRadius: 'var(--radius-buttons)',
            fontSize: 11,
            boxShadow: 'var(--shadow-sm-2)',
          }}
        >
          {copied ? 'copied ✓' : 'copy'}
        </button>
      </div>
      <pre
        style={{
          padding: '14px 18px',
          overflowX: 'auto',
          fontSize: 13,
          fontFamily: 'var(--font-ibm-plex-mono)',
          color: 'var(--color-charcoal-ink)',
          lineHeight: 1.45,
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
};
