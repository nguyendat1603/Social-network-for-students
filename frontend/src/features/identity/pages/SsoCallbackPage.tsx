import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../../config/routes.config';

export const SsoCallbackPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(APP_ROUTES.ACADEMIC_PROFILE, { replace: true });
  }, [navigate]);

  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      Đang đồng bộ chứng chỉ SSO OAuth2 của trường...
    </div>
  );
};
