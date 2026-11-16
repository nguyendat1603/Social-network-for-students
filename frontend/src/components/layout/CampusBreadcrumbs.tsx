import React from 'react';
import { Link } from 'react-router-dom';
import { APP_ROUTES } from '../../config/routes.config';
import styles from './CampusAppShell.module.css';

export const CampusBreadcrumbs: React.FC<{ current: string; isHome?: boolean; courseCode?: string }> = ({ current, isHome, courseCode }) => (
  isHome ? null : <nav className={styles.breadcrumbs} aria-label="Đường dẫn trang">
    <Link to={APP_ROUTES.CAMPUS_FEED}>Trang chủ</Link>
    <span aria-hidden="true">/</span>
    {courseCode && <><Link to={`${APP_ROUTES.COURSE_FEED}?code=${encodeURIComponent(courseCode)}`}>Học phần {courseCode}</Link><span aria-hidden="true">/</span></>}
    <span aria-current="page">{current}</span>
  </nav>
);
