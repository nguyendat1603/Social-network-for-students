import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../../config/routes.config';
import { identityService } from '../../../services/identity.service';
import { FacultyItem } from '../../../types/identity.types';

export const RegisterEduPage: React.FC = () => {
  const navigate = useNavigate();
  const [faculties, setFaculties] = useState<FacultyItem[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [cohort, setCohort] = useState('');
  const [major, setMajor] = useState('');
  const [className, setClassName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    identityService
      .getCatalog()
      .then((res) => setFaculties(res.faculties))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await identityService.registerEdu({
        email,
        password,
        fullName,
        studentCode: studentCode.trim() || undefined,
        facultyId: facultyId || undefined,
        cohort: cohort.trim() || undefined,
        major: major.trim() || undefined,
        className: className.trim() || undefined,
      });

      navigate(APP_ROUTES.VERIFY_OTP, {
        state: {
          email: res.email,
          devOtpPreview: res.devOtpPreview,
          inferredStudentCode: res.inferredStudentCode,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 560,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: 32,
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>
          🎓 Đăng ký Tài khoản Sinh viên (.edu)
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
          Xác thực email trường (.edu / .edu.vn) để nhận huy hiệu{' '}
          <strong style={{ color: '#34d399' }}>Verified Student</strong> và mở khóa toàn bộ không gian học thuật.
        </p>

        {error && (
          <div
            style={{
              marginTop: 16,
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

        <form
          onSubmit={handleSubmit}
          style={{
            marginTop: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Email sinh viên trường (.edu / .edu.vn) *
            </label>
            <input
              type="email"
              required
              placeholder="VD: dat.nt215340@sis.hust.edu.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Họ và tên thật *
              </label>
              <input
                required
                placeholder="Nguyễn Thành Đạt"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Mật khẩu (tối thiểu 6 ký tự) *
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                MSSV (Tự động điền từ email nếu để trống)
              </label>
              <input
                placeholder="VD: 20215340"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Khoa / Viện đào tạo
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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Khóa (Cohort)
              </label>
              <input
                placeholder="K66"
                value={cohort}
                onChange={(e) => setCohort(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Chuyên ngành
              </label>
              <input
                placeholder="Khoa học Máy tính"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Lớp sinh hoạt
              </label>
              <input
                placeholder="IT1-02"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              background: 'var(--brand-primary)',
              color: '#fff',
              border: 'none',
              padding: '12px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {loading ? 'Đang tạo tài khoản & gửi OTP...' : 'Nhận mã OTP qua Email trường'}
          </button>
        </form>

        <div
          style={{
            marginTop: 18,
            fontSize: 13,
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}
        >
          Đã có tài khoản? <Link to={APP_ROUTES.LOGIN}>Đăng nhập ngay</Link>
        </div>
      </div>
    </div>
  );
};
