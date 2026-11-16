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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
          className="school-pill-btn"
          style={{ padding: '5px 14px', fontSize: 12 }}
        >
          + (<span className="hl-cyan">c</span>)ode snippet
        </button>
        <button
          type="button"
          onClick={() =>
            insertSnippet('$$\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$')
          }
          className="school-pill-btn"
          style={{ padding: '5px 14px', fontSize: 12 }}
        >
          + (<span className="hl-yellow">l</span>)atex formula
        </button>
        <button
          type="button"
          onClick={() => insertSnippet('#IT3080 ')}
          className="school-pill-btn"
          style={{ padding: '5px 14px', fontSize: 12 }}
        >
          + #IT3080
        </button>
        <button
          type="button"
          onClick={() => insertSnippet('#MI1131 ')}
          className="school-pill-btn"
          style={{ padding: '5px 14px', fontSize: 12 }}
        >
          + #MI1131
        </button>
      </div>

      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Input your own question or note.'}
        style={{
          fontFamily: 'var(--font-ibm-plex-mono)',
          lineHeight: 1.5,
          resize: 'vertical',
        }}
      />
    </div>
  );
};
