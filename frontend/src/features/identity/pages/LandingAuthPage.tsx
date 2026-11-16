import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { identityService } from '../../../services/identity.service';
import { APP_ROUTES } from '../../../config/routes.config';
import { DemoAccess } from '../../../demo/DemoAccess';

export const LandingAuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { setSession, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!/@(sis\.)?hust\.edu\.vn$/i.test(email.trim())) {
      setError('Vui lòng dùng email @sis.hust.edu.vn hoặc @hust.edu.vn.');
      return;
    }
    setLoading(true);
    try {
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
      <p>Dùng email trường để tiếp tục cùng cộng đồng.</p>
      {error && <p role="alert" className="campus-error">{error}</p>}
      <form onSubmit={submit} aria-busy={loading}>
        <label htmlFor="login-email">Email trường</label>
        <input id="login-email" type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} />
        <label htmlFor="login-password">Mật khẩu</label>
        <input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit" disabled={loading}>{loading ? 'Đang đăng nhập…' : 'Đăng nhập bằng Mail Trường'}</button>
      </form>
      {isAuthenticated && <Link to={APP_ROUTES.CAMPUS_FEED}>Tiếp tục với tài khoản hiện tại →</Link>}
      <p>Chưa có tài khoản? <Link to={APP_ROUTES.REGISTER_EDU}>Đăng ký bằng email trường</Link></p>
      <details><summary>Đăng nhập SSO của trường</summary><p>Đăng nhập SSO chưa được kết nối với nhà cung cấp danh tính của trường. Hãy dùng email và mật khẩu.</p></details>
      {import.meta.env.DEV && <DemoAccess />}
    </section>
  </main>;
};
