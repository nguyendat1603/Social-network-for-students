import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { identityService } from '../../../services/identity.service';
import { APP_ROUTES } from '../../../config/routes.config';
import { useDemoStore } from '../../../demo/demo.store';

export const LandingAuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { setSession, isAuthenticated } = useAuth();
  const enterMock = useDemoStore(state => state.enter);
  const exitMock = useDemoStore(state => state.exit);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (email.trim() === 'gakusei') {
      if (!enterMock(email, password)) {
        setError('Mật khẩu tài khoản mock không đúng. Dùng gakusei / 4444 để xem thử.');
        return;
      }
      navigate(APP_ROUTES.CAMPUS_FEED);
      return;
    }
    if (!/@(sis\.)?hust\.edu\.vn$/i.test(email.trim())) {
      setError('Vui lòng dùng email @sis.hust.edu.vn hoặc @hust.edu.vn.');
      return;
    }
    setLoading(true);
    try {
      exitMock();
      const session = await identityService.login(email.trim(), password);
      setSession(session.user, session.accessToken, session.refreshToken);
      navigate(APP_ROUTES.CAMPUS_FEED);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể đăng nhập. Vui lòng thử lại.');
    } finally { setLoading(false); }
  };
  return <main className="campus-auth campus-login">
    <section className="campus-auth-intro">
      <Link className="campus-auth-brand" to="/login" aria-label="Campus Social">campus<span>.</span></Link>
      <p className="campus-eyebrow">HỌC CÙNG NHAU</p>
      <h1>Một câu hỏi hôm nay.<br />Một bước tiến ngày mai.</h1>
      <p>Không gian học tập của sinh viên Bách Khoa. Trao đổi theo học phần, chia sẻ tài liệu và tìm những người bạn cùng tiến.</p>
      <ul><li>Hỏi rõ điều mình cần</li><li>Chia sẻ tài liệu có nguồn</li><li>Tương tác tử tế</li></ul>
    </section>
    <section className="campus-auth-card" aria-labelledby="login-title">
      <p className="campus-eyebrow">CHÀO MỪNG TRỞ LẠI</p>
      <h2 id="login-title">Đăng nhập vào campus</h2>
      <p>Dùng email trường hoặc tài khoản mock để tiếp tục.</p>
      <p id="mock-login-note">Tài khoản mock để xem thử: <strong>gakusei</strong> · Mật khẩu: <strong>4444</strong>. Chỉ xem dữ liệu mẫu, không thay đổi dữ liệu thật.</p>
      {error && <p role="alert" className="campus-error">{error}</p>}
      <form onSubmit={submit} aria-busy={loading}>
        <label htmlFor="login-email">Email trường hoặc tên tài khoản</label>
        <input id="login-email" type="text" autoComplete="username" aria-describedby="mock-login-note" placeholder="gakusei hoặc email trường" required value={email} onChange={e => setEmail(e.target.value)} />
        <label htmlFor="login-password">Mật khẩu</label>
        <input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit" disabled={loading}>{loading ? 'Đang đăng nhập…' : 'Đăng nhập'}</button>
      </form>
      {isAuthenticated && <Link to={APP_ROUTES.CAMPUS_FEED}>Tiếp tục với tài khoản hiện tại →</Link>}
      <p>Chưa có tài khoản? <Link to={APP_ROUTES.REGISTER_EDU}>Đăng ký bằng email trường</Link></p>
      <details><summary>Đăng nhập SSO của trường</summary><p>Đăng nhập SSO chưa được kết nối với nhà cung cấp danh tính của trường. Hãy dùng email và mật khẩu.</p></details>
    </section>
  </main>;
};
