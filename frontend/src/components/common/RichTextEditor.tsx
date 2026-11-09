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
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-color)',
            color: '#93c5fd',
            padding: '4px 10px',
            borderRadius: 6,
            fontSize: 12,
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
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-color)',
            color: '#c4b5fd',
            padding: '4px 10px',
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          + Công thức LaTeX ($$)
        </button>
        <button
          type="button"
          onClick={() => insertSnippet('#IT3080 ')}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-color)',
            color: '#34d399',
            padding: '4px 10px',
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          + Tag #IT3080
        </button>
        <button
          type="button"
          onClick={() => insertSnippet('#MI1131 ')}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-color)',
            color: '#34d399',
            padding: '4px 10px',
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          + Tag #MI1131
        </button>
      </div>

      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          placeholder ||
          'Nhập nội dung thảo luận, chèn công thức LaTeX ($...$), đoạn code (```) hoặc gắn thẻ mã học phần (#IT3080)...'
        }
      />
    </div>
  );
};
