import React from 'react';
import { CodeSnippetBlock } from './CodeSnippetBlock';

interface LatexMathRendererProps {
  content: string;
}

/**
 * Renders rich academic content containing fenced code blocks (```lang ... ```)
 * and LaTeX math expressions ($$...$$ and $...$).
 */
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
              margin: '10px 0',
              padding: '10px 14px',
              borderRadius: 8,
              backgroundColor: 'rgba(139, 92, 246, 0.12)',
              border: '1px solid rgba(139, 92, 246, 0.35)',
              fontFamily: "'Cambria Math', 'Times New Roman', serif",
              fontSize: 15,
              color: '#ddd6fe',
              overflowX: 'auto',
            }}
          >
            ∑ LaTeX: <code>{expr}</code>
          </div>
        );
      }
      if (part.startsWith('$') && part.endsWith('$')) {
        const expr = part.slice(1, -1).trim();
        return (
          <code
            key={idx}
            style={{
              padding: '1px 6px',
              borderRadius: 4,
              backgroundColor: 'rgba(139, 92, 246, 0.16)',
              color: '#c4b5fd',
              fontFamily: "'Cambria Math', 'Times New Roman', serif",
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
    <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.65 }}>
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
