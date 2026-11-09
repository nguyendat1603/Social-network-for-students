import React, { useState } from 'react';
import {
  SkillCategory,
  SkillProficiency,
  UserSkillItem,
} from '../../../types/identity.types';

interface SkillsLanguageSelectorProps {
  skills: UserSkillItem[];
  onChange: (skills: UserSkillItem[]) => void;
}

export const SkillsLanguageSelector: React.FC<SkillsLanguageSelectorProps> = ({
  skills,
  onChange,
}) => {
  const [skillName, setSkillName] = useState('');
  const [category, setCategory] = useState<SkillCategory>('TECHNICAL');
  const [proficiencyLevel, setProficiencyLevel] =
    useState<SkillProficiency>('INTERMEDIATE');

  const handleAddSkill = () => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    const exists = skills.some(
      (s) =>
        s.skillName.toLowerCase() === trimmed.toLowerCase() &&
        s.category === category
    );
    if (exists) return;

    onChange([
      ...skills,
      { skillName: trimmed, category, proficiencyLevel },
    ]);
    setSkillName('');
  };

  const handleRemoveSkill = (idx: number) => {
    onChange(skills.filter((_, i) => i !== idx));
  };

  return (
    <div
      style={{
        borderTop: '1px solid var(--border-color)',
        paddingTop: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600 }}>
        🛠️ Kỹ năng Kỹ thuật & Ngoại ngữ (Technical & Language Skills)
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr auto',
          gap: 10,
        }}
      >
        <input
          value={skillName}
          onChange={(e) => setSkillName(e.target.value)}
          placeholder="VD: TypeScript, React, STM32, IELTS 7.5, JLPT N2..."
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as SkillCategory)}
        >
          <option value="TECHNICAL">Kỹ thuật (Tech)</option>
          <option value="LANGUAGE">Ngoại ngữ</option>
          <option value="SOFT_SKILL">Kỹ năng mềm</option>
        </select>
        <select
          value={proficiencyLevel}
          onChange={(e) =>
            setProficiencyLevel(e.target.value as SkillProficiency)
          }
        >
          <option value="BEGINNER">Cơ bản</option>
          <option value="INTERMEDIATE">Khá</option>
          <option value="ADVANCED">Thành thạo</option>
          <option value="EXPERT">Chuyên sâu</option>
        </select>
        <button
          type="button"
          onClick={handleAddSkill}
          style={{
            background: 'var(--bg-elevated)',
            color: '#fff',
            border: '1px solid var(--border-color)',
            padding: '0 16px',
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          + Thêm
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {skills.length === 0 && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Chưa có kỹ năng nào được thêm.
          </span>
        )}
        {skills.map((s, idx) => (
          <span
            key={`${s.category}-${s.skillName}-${idx}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 12px',
              borderRadius: 999,
              fontSize: 12,
              background:
                s.category === 'TECHNICAL'
                  ? 'rgba(59, 130, 246, 0.16)'
                  : s.category === 'LANGUAGE'
                  ? 'rgba(16, 185, 129, 0.16)'
                  : 'rgba(139, 92, 246, 0.16)',
              border: '1px solid var(--border-color)',
            }}
          >
            <strong>{s.skillName}</strong>
            <span style={{ opacity: 0.75 }}>({s.proficiencyLevel})</span>
            <button
              type="button"
              onClick={() => handleRemoveSkill(idx)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f87171',
                fontWeight: 700,
              }}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};
