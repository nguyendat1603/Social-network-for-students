import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../../config/routes.config';
import { useAuth } from '../../../hooks/useAuth';

export const SsoCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  useEffect(() => {
    if (isAuthenticated) navigate(APP_ROUTES.ACADEMIC_PROFILE, { replace: true });
  }, [isAuthenticated, navigate]);
  return <main className="campus-auth" style={{ display: 'grid', placeItems: 'center', padding: 24 }}>
    <section className="campus-auth-card">
      <p className="campus-eyebrow">CAMPUS SOCIAL</p>
      <h1>Đăng nhập trường</h1>
      <p role="status">{isAuthenticated ? 'Đang mở hồ sơ của bạn…' : 'Chưa có phiên đăng nhập được xác thực. Kết nối SSO của trường chưa được cấu hình trên giao diện này.'}</p>
      <Link to={APP_ROUTES.LOGIN}>Về đăng nhập bằng email trường →</Link>
    </section>
  </main>;
};
