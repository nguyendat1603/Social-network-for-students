import React from 'react';
import { Link } from 'react-router-dom';
import { APP_ROUTES } from '../../config/routes.config';
import styles from './CampusAppShell.module.css';

export const CampusBreadcrumbs: React.FC<{ current: string; isHome?: boolean }> = ({ current, isHome }) => (
  isHome ? null : <nav className={styles.breadcrumbs} aria-label="Đường dẫn trang">
    <Link to={APP_ROUTES.CAMPUS_FEED}>Trang chủ</Link>
    <span aria-hidden="true">/</span>
    <span aria-current="page">{current}</span>
  </nav>
);
