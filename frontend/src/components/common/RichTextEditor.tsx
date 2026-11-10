import React from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (nextValue: string) => void;
  placeholder?: string;
  rows?: number;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder,
  rows = 6,
}) => {
  const insertSnippet = (snippet: string) => {
    onChange(`${value}${value.endsWith('\n') || !value ? '' : '\n'}${snippet}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          onClick={() =>
            insertSnippet('```cpp\n// Nhập code tại đây\nint main() {\n  return 0;\n}\n```')
          }
          style={{
            background: 'rgba(24, 119, 242, 0.08)',
            border: '1px solid rgba(24, 119, 242, 0.25)',
            color: 'var(--brand-primary)',
            padding: '4px 10px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          + Code Snippet (```)
        </button>
        <button
          type="button"
          onClick={() =>
            insertSnippet('$$\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$')
          }
          style={{
            background: 'rgba(139, 92, 246, 0.08)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            color: '#7c3aed',
            padding: '4px 10px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          + Công thức LaTeX ($$)
        </button>
        <button
          type="button"
          onClick={() => insertSnippet('#IT3080 ')}
          style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#059669',
            padding: '4px 10px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          + Tag #IT3080
        </button>
        <button
          type="button"
          onClick={() => insertSnippet('#MI1131 ')}
          style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#059669',
            padding: '4px 10px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          + Tag #MI1131
        </button>
      </div>

      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Nhập nội dung bài viết / câu hỏi của bạn...'}
        style={{
          fontFamily: 'inherit',
          lineHeight: 1.6,
          resize: 'vertical',
        }}
      />
    </div>
  );
};
