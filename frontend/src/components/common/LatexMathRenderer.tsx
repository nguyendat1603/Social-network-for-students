import React from 'react';
import { CodeSnippetBlock } from './CodeSnippetBlock';

interface LatexMathRendererProps {
  content: string;
}

export const LatexMathRenderer: React.FC<LatexMathRendererProps> = ({
  content,
}) => {
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const segments: Array<{
    type: 'text' | 'code';
    value: string;
    lang?: string;
  }> = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        value: content.slice(lastIndex, match.index),
      });
    }
    segments.push({
      type: 'code',
      lang: match[1] || 'code',
      value: match[2].trimEnd(),
    });
    lastIndex = codeBlockRegex.lastIndex;
  }

  if (lastIndex < content.length) {
    segments.push({
      type: 'text',
      value: content.slice(lastIndex),
    });
  }

  const renderMathInText = (text: string) => {
    const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+\$)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const expr = part.slice(2, -2).trim();
        return (
          <div
            key={idx}
            style={{
              margin: '12px 0',
              padding: '12px 16px',
              borderRadius: 8,
              backgroundColor: '#f8f8f8',
              borderLeft: '3px solid var(--color-signal-orange)',
              fontFamily: 'var(--font-jetbrains-mono)',
              fontSize: 14,
              lineHeight: 1.43,
              letterSpacing: '-0.014em',
              color: 'var(--color-charcoal)',
              overflowX: 'auto',
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontFamily: 'var(--font-system-ui)',
                fontWeight: 500,
                color: 'var(--color-stone)',
                display: 'block',
                marginBottom: 4,
              }}
            >
              Công thức Toán / LaTeX
            </span>
            <code>{expr}</code>
          </div>
        );
      }
      if (part.startsWith('$') && part.endsWith('$')) {
        const expr = part.slice(1, -1).trim();
        return (
          <code
            key={idx}
            style={{
              padding: '2px 6px',
              borderRadius: 4,
              backgroundColor: 'var(--color-cloud)',
              color: 'var(--color-charcoal)',
              fontFamily: 'var(--font-jetbrains-mono)',
              fontSize: 14,
              letterSpacing: '-0.014em',
            }}
          >
            {expr}
          </code>
        );
      }
      return (
        <span key={idx} style={{ whiteSpace: 'pre-wrap' }}>
          {part}
        </span>
      );
    });
  };

  return (
    <div
      style={{
        fontFamily: 'var(--font-spectral)',
        fontSize: 18.5,
        color: 'var(--color-ink)',
        lineHeight: 1.48,
      }}
    >
      {segments.map((seg, i) =>
        seg.type === 'code' ? (
          <CodeSnippetBlock key={i} code={seg.value} language={seg.lang} />
        ) : (
          <div key={i}>{renderMathInText(seg.value)}</div>
        )
      )}
    </div>
  );
};
