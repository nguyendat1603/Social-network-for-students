import React, { useState } from 'react';
import {
  AcademicProfile,
  FacultyItem,
  UserSkillItem,
} from '../../../types/identity.types';
import { SkillsLanguageSelector } from './SkillsLanguageSelector';

interface AcademicInfoFormProps {
  profile: AcademicProfile;
  faculties: FacultyItem[];
  onSave: (payload: {
    studentCode?: string;
    fullName?: string;
    facultyId?: string | null;
    major?: string | null;
    cohort?: string | null;
    className?: string | null;
    careerGoal?: string | null;
    bio?: string | null;
    skills?: UserSkillItem[];
  }) => Promise<void>;
}

export const AcademicInfoForm: React.FC<AcademicInfoFormProps> = ({
  profile,
  faculties,
  onSave,
}) => {
  const [fullName, setFullName] = useState(profile.fullName || '');
  const [studentCode, setStudentCode] = useState(profile.studentCode || '');
  const [facultyId, setFacultyId] = useState(profile.facultyId || '');
  const [major, setMajor] = useState(profile.major || '');
  const [cohort, setCohort] = useState(profile.cohort || '');
  const [className, setClassName] = useState(profile.className || '');
  const [careerGoal, setCareerGoal] = useState(profile.careerGoal || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [skills, setSkills] = useState<UserSkillItem[]>(profile.skills || []);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await onSave({
        fullName,
        studentCode: studentCode.trim() || undefined,
        facultyId: facultyId || null,
        major: major.trim() || null,
        cohort: cohort.trim() || null,
        className: className.trim() || null,
        careerGoal: careerGoal.trim() || null,
        bio: bio.trim() || null,
        skills,
      });
      setMessage('Đã lưu Hồ sơ học thuật lên Supabase Online thành công!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi lưu hồ sơ.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      <div>
        <h3 style={{ fontSize: 17, fontWeight: 700 }}>
          📚 Hồ sơ Học thuật (Academic Profile)
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Thông tin dùng để ghép nhóm đồ án (Module 3) và cá nhân hóa bảng tin theo Khoa/Viện & Học phần.
        </p>
      </div>

      {message && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            fontSize: 13,
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}
      >
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Họ và tên sinh viên *
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Mã số sinh viên (MSSV)
          </label>
          <input
            value={studentCode}
            onChange={(e) => setStudentCode(e.target.value)}
            placeholder="VD: 20215340"
          />
        </div>

        <div>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Khoa / Viện / Trường đào tạo
          </label>
          <select
            value={facultyId}
            onChange={(e) => setFacultyId(e.target.value)}
          >
            <option value="">-- Chọn Khoa / Viện --</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>
                [{f.code}] {f.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Chuyên ngành (Major)
          </label>
          <input
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            placeholder="VD: Khoa học Máy tính / Kỹ thuật Phần mềm"
          />
        </div>

        <div>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Khóa (Cohort)
          </label>
          <input
            value={cohort}
            onChange={(e) => setCohort(e.target.value)}
            placeholder="VD: K66, K67, K68"
          />
        </div>

        <div>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Lớp sinh hoạt (Class)
          </label>
          <input
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="VD: IT1-02 K66"
          />
        </div>
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Mục tiêu nghề nghiệp (Career Goal)
        </label>
        <input
          value={careerGoal}
          onChange={(e) => setCareerGoal(e.target.value)}
          placeholder="VD: Backend Engineer (Distributed Systems), AI Researcher..."
        />
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Giới thiệu bản thân & Định hướng học tập (Bio)
        </label>
        <textarea
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Chia sẻ kinh nghiệm làm đồ án, môn học thế mạnh hoặc link GitHub/Portfolio..."
        />
      </div>

      <SkillsLanguageSelector skills={skills} onChange={setSkills} />

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            background: 'var(--brand-primary)',
            color: '#fff',
            border: 'none',
            padding: '10px 22px',
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          {saving ? 'Đang lưu...' : 'Lưu Hồ sơ Học thuật'}
        </button>
      </div>
    </form>
  );
};
