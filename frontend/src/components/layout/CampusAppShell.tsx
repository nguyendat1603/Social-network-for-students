import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { CAMPUS_PRIMARY_NAV, CAMPUS_SECONDARY_NAV } from '../../config/navigation.config';
import { APP_ROUTES } from '../../config/routes.config';
import { useAuth } from '../../hooks/useAuth';
import { useDemoStore } from '../../demo/demo.store';
import { AnonymousSwitch } from '../common/AnonymousSwitch';
import { CampusIcon } from '../common/CampusIcon';
import { RealtimeNotificationBell } from '../../features/communication/components/RealtimeNotificationBell';
import { CampusBreadcrumbs } from './CampusBreadcrumbs';
import styles from './CampusAppShell.module.css';

export const CampusAppShell: React.FC<{ children: React.ReactNode; onAsk?: () => void; courseCode?: string }> = ({ children, onAsk, courseCode }) => {
  const { user: realUser, logout } = useAuth();
  const demo = useDemoStore(state => state.active);
  const user = import.meta.env.DEV && demo ? null : realUser;
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const destination = [...CAMPUS_PRIMARY_NAV, ...CAMPUS_SECONDARY_NAV].find(item => item.to === location.pathname);
  const isHome = location.pathname === APP_ROUTES.CAMPUS_FEED;
  const reviewCode = location.pathname.match(/^\/course-reviews\/([^/]+)$/)?.[1];
  const code = courseCode || params.get('code') || params.get('courseCode') || (reviewCode !== 'forum' ? reviewCode : null) || (location.pathname === APP_ROUTES.COURSE_FEED ? 'IT3080' : null);
  const current = destination?.label || (location.pathname.startsWith('/admin') ? 'Kiểm duyệt nội dung' : location.pathname.startsWith('/resources/') ? 'Chi tiết tài liệu' : location.pathname.startsWith('/study-groups/') ? 'Không gian nhóm học' : location.pathname.startsWith('/feed/posts/') ? 'Chi tiết bài viết' : reviewCode ? `Đánh giá ${reviewCode}` : 'Campus Social');
  const [query, setQuery] = useState('');

  const [exploreOpen, setExploreOpen] = useState(false);
  const exploreButton = useRef<HTMLButtonElement>(null);
  const explorePanel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (exploreOpen) explorePanel.current?.focus();
  }, [exploreOpen]);

  const closeExplore = () => {
    setExploreOpen(false);
    exploreButton.current?.focus();
  };

  useEffect(() => {
    setExploreOpen(false);
    document.getElementById('campus-main')?.focus({ preventScroll: true });
  }, [location.pathname]);

  const secondaryLinks = () => <>
    {CAMPUS_SECONDARY_NAV.map(item => <NavLink end key={item.to} to={item.to} onClick={() => setExploreOpen(false)}>{item.label}</NavLink>)}
    {(user?.role === 'ADMIN' || user?.role === 'MODERATOR') && <Link to={APP_ROUTES.MODERATION_DASHBOARD}>Kiểm duyệt nội dung</Link>}
  </>;

  return <div className={styles.shell}>
    <a className={styles.skipLink} href="#campus-main">Bỏ qua điều hướng, đến nội dung</a>
    <aside className={styles.sidebar} aria-label="Điều hướng chính">
      <Link className={styles.brand} to={APP_ROUTES.CAMPUS_FEED} aria-label="Campus Social — trang chủ">
        <span className={styles.brandSymbol}>c<span>.</span></span>
        <span className={styles.wordmark}><strong>campus</strong><small>HỌC CÙNG NHAU</small></span>
      </Link>
      <p className={styles.sectionLabel}>ĐI ĐẾN</p>
      <nav className={styles.primaryNav}>
        {CAMPUS_PRIMARY_NAV.map(item => <NavLink key={item.to} end to={item.to} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <CampusIcon name={item.icon} /><span>{item.label}</span>
        </NavLink>)}
      </nav>
      <section className={styles.exploreSection} aria-labelledby="campus-explore-heading">
        <h2 id="campus-explore-heading" className={styles.sectionLabel}>Khám phá thêm</h2>
        <nav className={styles.secondaryNav} aria-label="Khám phá thêm">{secondaryLinks()}</nav>
      </section>
      <div className={styles.sidebarBottom}>
        <div className={styles.communityNote}><span aria-hidden="true">“</span><p>Một câu hỏi hôm nay có thể giúp cả khóa ngày mai.</p><small>Campus Social</small></div>
        <Link className={styles.userPill} to={APP_ROUTES.ACADEMIC_PROFILE}>
          <span className={styles.avatar}>{user?.fullName?.[0]?.toUpperCase() || '?'}</span>
          <span><strong>{user?.fullName || (demo ? 'Khách xem demo' : 'Sinh viên')}</strong><small>{user?.isVerifiedStudent ? 'Sinh viên đã xác minh' : 'Chưa xác minh sinh viên'}</small></span>
        </Link>
      </div>
    </aside>

    <div className={styles.workspace}>
      <header className={styles.header}>
        <span className={styles.location}><span />{current}</span>
        <Link className={styles.mobileBrand} to={APP_ROUTES.CAMPUS_FEED}>campus.</Link>
        <div className={styles.headerActions}>
          <form className={styles.search} role="search" onSubmit={event => { event.preventDefault(); navigate(`${APP_ROUTES.CAMPUS_FEED}?q=${encodeURIComponent(query)}`); }}>
            <input aria-label="Tìm kiếm bài viết" placeholder="Tìm kiếm trong campus…" value={query} onChange={event => setQuery(event.target.value)} />
            <button type="submit" aria-label="Tìm kiếm"><CampusIcon name="search" /></button>
          </form>
          <div className={styles.notifications}><RealtimeNotificationBell /></div>
          {onAsk && <button data-campus-ask className={styles.askButton} type="button" onClick={onAsk} aria-label="Đặt câu hỏi"><CampusIcon name="plus" /><span>Đặt câu hỏi</span></button>}
          <details className={styles.account} onKeyDown={event => {
            if (event.key === 'Escape') {
              event.currentTarget.open = false;
              event.currentTarget.querySelector('summary')?.focus();
            }
          }}>
            <summary aria-label="Tài khoản và chế độ ẩn danh"><span className={styles.avatar}>{user?.fullName?.[0]?.toUpperCase() || '?'}</span></summary>
            <div className={styles.accountPanel}>
              <strong>{user?.fullName || (demo ? 'Khách xem demo' : 'Sinh viên')}</strong>
              <Link to={APP_ROUTES.ACADEMIC_PROFILE}>Hồ sơ học thuật</Link>
              <AnonymousSwitch />
              <button type="button" onClick={() => { logout(); navigate(APP_ROUTES.LOGIN); }}>Đăng xuất</button>
            </div>
          </details>
        </div>
      </header>
      <div className={styles.contentLayout}>
        <main id="campus-main" className={styles.main} tabIndex={-1}>
          <CampusBreadcrumbs current={current} isHome={isHome} courseCode={code || undefined} />
          {code && !isHome && <nav data-campus-course-tabs className={styles.courseTabs} aria-label={`Nội dung học phần ${code}`}>
            <Link aria-current={(location.pathname === APP_ROUTES.COURSE_FEED || location.pathname === APP_ROUTES.SUBJECT_QA_FORUM) ? 'page' : undefined} to={`${APP_ROUTES.COURSE_FEED}?code=${encodeURIComponent(code)}`}>Hỏi đáp · {code}</Link>
            <Link aria-current={location.pathname === APP_ROUTES.RESOURCE_HUB ? 'page' : undefined} to={`${APP_ROUTES.RESOURCE_HUB}?code=${encodeURIComponent(code)}`}>Tài liệu</Link>
            <Link aria-current={location.pathname === APP_ROUTES.STUDY_GROUPS ? 'page' : undefined} to={`${APP_ROUTES.STUDY_GROUPS}?code=${encodeURIComponent(code)}`}>Nhóm học</Link>
          </nav>}
          {children}
        </main>
        <aside className={styles.contextRail} aria-label="Thông tin liên quan">
          <div className={styles.railNote}>
            <div><CampusIcon name="spark" /> MỘT GỢI Ý NHỎ</div>
            <h2>Không cần biết hết mới được đặt câu hỏi.</h2>
            <p>Nói rõ phần bạn đã thử và chỗ đang bí. Người khác sẽ dễ giúp bạn hơn.</p>
          </div>
          <section className={styles.railSection}>
            <h2 className={styles.sectionLabel}>CỘNG ĐỒNG TỐT HƠN KHI</h2>
            <p><strong>Hỏi rõ điều mình cần</strong><small>Đưa đủ bối cảnh để người khác giúp</small></p>
            <p><strong>Chia sẻ tài liệu có nguồn</strong><small>Tôn trọng tác giả và quyền sử dụng</small></p>
            <p><strong>Tương tác tử tế</strong><small>Phản hồi hữu ích, không công kích</small></p>
          </section>
        </aside>
      </div>
    </div>

    {exploreOpen && <div ref={explorePanel} id="campus-mobile-explore" className={styles.mobileExplore} tabIndex={-1} onKeyDown={event => { if (event.key === 'Escape') closeExplore(); }}>
      <div className={styles.exploreHeading}><h2>Khám phá thêm</h2><button type="button" onClick={closeExplore} aria-label="Đóng Khám phá thêm"><CampusIcon name="x" /></button></div>
      <nav className={styles.secondaryNav} aria-label="Khám phá thêm trên điện thoại">{secondaryLinks()}</nav>
    </div>}
    <nav className={styles.mobileTabbar} aria-label="Điều hướng điện thoại">
      {CAMPUS_PRIMARY_NAV.map(item => <NavLink key={item.to} end to={item.to} onClick={() => setExploreOpen(false)} className={({ isActive }) => `${styles.mobileTab} ${isActive ? styles.active : ''}`}><CampusIcon name={item.icon} /><span>{item.mobileLabel}</span></NavLink>)}
      <button ref={exploreButton} type="button" className={`${styles.mobileTab} ${exploreOpen ? styles.active : ''}`} aria-expanded={exploreOpen} aria-controls="campus-mobile-explore" onClick={() => setExploreOpen(open => !open)}><CampusIcon name="menu" /><span>Khám phá thêm</span></button>
    </nav>
  </div>;
};
