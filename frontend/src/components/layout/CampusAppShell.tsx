import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { CAMPUS_PRIMARY_NAV, CAMPUS_ALL_NAV, CAMPUS_HOME, CAMPUS_NAV_GROUPS, CampusNavItem, isCampusNavActive } from '../../config/navigation.config';
import { courseNavigation } from '../../config/course-navigation';
import { APP_ROUTES } from '../../config/routes.config';
import { useAuth } from '../../hooks/useAuth';
import { useDemoStore } from '../../demo/demo.store';
import { AnonymousSwitch } from '../common/AnonymousSwitch';
import { CampusIcon } from '../common/CampusIcon';
import { RealtimeNotificationBell } from '../../features/communication/components/RealtimeNotificationBell';
import { CampusBreadcrumbs } from './CampusBreadcrumbs';
import styles from './CampusAppShell.module.css';

const NAV_PREFERENCES_KEY = 'campus_navigation_preferences';
function readNavigationPreferences(): { collapsed: boolean; closedGroups: string[] } {
  try {
    const saved = JSON.parse(localStorage.getItem(NAV_PREFERENCES_KEY) || '{}');
    return { collapsed: saved.collapsed === true, closedGroups: Array.isArray(saved.closedGroups) ? saved.closedGroups.filter((id: unknown) => typeof id === 'string') : [] };
  } catch { return { collapsed: false, closedGroups: [] }; }
}

export const CampusAppShell: React.FC<{ children: React.ReactNode; onAsk?: () => void; courseCode?: string }> = ({ children, onAsk, courseCode }) => {
  const { user: realUser, logout } = useAuth();
  const demo = useDemoStore(state => state.active);
  const user = demo ? null : realUser;
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const destination = CAMPUS_ALL_NAV.find(item => isCampusNavActive(item.to, location.pathname));
  const isHome = location.pathname === APP_ROUTES.CAMPUS_FEED;
  const reviewCode = location.pathname.match(/^\/course-reviews\/([^/]+)$/)?.[1];
  const code = courseCode || params.get('code') || params.get('courseCode') || (reviewCode !== 'forum' && reviewCode ? decodeURIComponent(reviewCode) : null);
  const current = location.pathname.startsWith('/admin') ? 'Kiểm duyệt nội dung' : location.pathname.startsWith('/resources/') ? 'Chi tiết tài liệu' : location.pathname.startsWith('/study-groups/') ? 'Không gian nhóm học' : location.pathname.startsWith('/feed/posts/') ? 'Chi tiết bài viết' : reviewCode && reviewCode !== 'forum' ? `Đánh giá ${code}` : location.pathname === APP_ROUTES.SUBJECT_QA_FORUM ? 'Hỏi đáp học phần' : location.pathname === APP_ROUTES.COURSE_FEED ? 'Thảo luận học phần' : location.pathname === APP_ROUTES.COURSE_REVIEWS ? 'Đánh giá học phần' : location.pathname === APP_ROUTES.ACADEMIC_PROFILE ? 'Hồ sơ học thuật' : destination?.label || 'Campus Social';
  const [query, setQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => readNavigationPreferences().collapsed);
  const [closedGroups, setClosedGroups] = useState<string[]>(() => readNavigationPreferences().closedGroups);

  const [exploreOpen, setExploreOpen] = useState(false);
  const exploreButton = useRef<HTMLButtonElement>(null);
  const explorePanel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { localStorage.setItem(NAV_PREFERENCES_KEY, JSON.stringify({ collapsed: sidebarCollapsed, closedGroups })); }
    catch { /* Navigation remains usable when browser storage is unavailable. */ }
  }, [sidebarCollapsed, closedGroups]);

  useEffect(() => {
    if (exploreOpen) explorePanel.current?.focus();
  }, [exploreOpen]);

  const closeExplore = () => {
    setExploreOpen(false);
    exploreButton.current?.focus();
  };

  useEffect(() => {
    setExploreOpen(false);
    const group = CAMPUS_NAV_GROUPS.find(group => group.items.some(item => isCampusNavActive(item.to, location.pathname)));
    if (group) setClosedGroups(previous => previous.filter(id => id !== group.id));
    document.getElementById('campus-main')?.focus({ preventScroll: true });
  }, [location.pathname]);

  useEffect(() => {
    setQuery(params.get('q') || '');
  }, [params]);

  const navLink = (item: CampusNavItem) => {
    const active = isCampusNavActive(item.to, location.pathname);
    return <Link key={item.to} to={item.to} aria-current={active ? 'page' : undefined}
      aria-label={item.label} title={sidebarCollapsed ? item.label : undefined}
      onClick={() => setExploreOpen(false)} className={`${styles.navItem} ${active ? styles.active : ''}`}>
      <CampusIcon name={item.icon} /><span>{item.label}</span>
    </Link>;
  };
  const groupedNavigation = (mobile = false) => CAMPUS_NAV_GROUPS.map(group => {
    const open = mobile || sidebarCollapsed || !closedGroups.includes(group.id);
    const panelId = `campus-${mobile ? 'mobile' : 'desktop'}-${group.id}`;
    return <section key={group.id} className={styles.navGroup} aria-label={group.label}>
      <h2 className={styles.sectionLabel}>
        {mobile ? group.label : <button type="button" data-demo-read-action className={styles.exploreToggle}
          aria-expanded={open} aria-controls={panelId}
          onClick={() => setClosedGroups(previous => previous.includes(group.id) ? previous.filter(id => id !== group.id) : [...previous, group.id])}>
          <span>{group.label}</span><CampusIcon name={open ? 'chevron-up' : 'chevron-down'} />
        </button>}
      </h2>
      <nav id={panelId} hidden={!open} aria-label={group.label}>{group.items.map(navLink)}</nav>
    </section>;
  });

  return <div className={`${styles.shell} ${sidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
    <a className={styles.skipLink} href="#campus-main">Bỏ qua điều hướng, đến nội dung</a>
    <aside className={styles.sidebar} aria-label="Điều hướng chính">
      <div className={styles.sidebarHeading}>
      <Link className={styles.brand} to={APP_ROUTES.CAMPUS_FEED} aria-label="Campus Social — trang chủ">
        <span className={styles.brandSymbol}>c<span>.</span></span>
        <span className={styles.wordmark}><strong>campus</strong><small>HỌC CÙNG NHAU</small></span>
      </Link>
      <button type="button" className={styles.sidebarToggle} onClick={() => setSidebarCollapsed(collapsed => !collapsed)} aria-label={sidebarCollapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'} title={sidebarCollapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'} aria-expanded={!sidebarCollapsed} aria-controls="campus-sidebar-navigation">
        <CampusIcon name={sidebarCollapsed ? 'chevron-right' : 'chevron-left'} />
      </button>
      </div>
      <div id="campus-sidebar-navigation">
        <nav aria-label="Trang chủ">{navLink(CAMPUS_HOME)}</nav>
        {groupedNavigation()}
        {(user?.role === 'ADMIN' || user?.role === 'MODERATOR') && <nav aria-label="Quản trị">{navLink({ label: 'Kiểm duyệt nội dung', to: APP_ROUTES.MODERATION_DASHBOARD, icon: 'files' })}</nav>}
      </div>
      <div className={styles.sidebarBottom}>
        <Link className={styles.userPill} to={APP_ROUTES.ACADEMIC_PROFILE} title={demo ? 'Hồ sơ cá nhân cần đăng nhập thật' : 'Xem hồ sơ học thuật'}>
          <span className={styles.avatar}>{user?.fullName?.[0]?.toUpperCase() || '?'}</span>
          <span><strong>{user?.fullName || (demo ? 'gakusei' : 'Sinh viên')}</strong><small>{demo ? 'Chỉ xem · Hồ sơ cần đăng nhập thật' : 'Xem hồ sơ học thuật'}</small></span>
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
              <strong>{user?.fullName || (demo ? 'gakusei' : 'Sinh viên')}</strong>
              <AnonymousSwitch />
              <button type="button" onClick={() => { useDemoStore.getState().exit(); logout(); navigate(APP_ROUTES.LOGIN); }}>Đăng xuất</button>
            </div>
          </details>
        </div>
      </header>
      <div className={styles.contentLayout}>
        <main id="campus-main" className={styles.main} tabIndex={-1}>
          {!isHome && <CampusBreadcrumbs current={current} isHome={isHome} courseCode={code || undefined} />}
          {code && !isHome && <section className={styles.courseContext} aria-label={`Học phần ${code}`}>
            <div className={styles.courseContextHeading}><strong>Học phần · {code}</strong><Link to={APP_ROUTES.COURSES}>Đổi học phần</Link></div>
            <nav data-campus-course-tabs className={styles.courseTabs} aria-label={`Nội dung học phần ${code}`}>
              {courseNavigation(code).map(tab => <Link key={tab.to} aria-current={location.pathname === tab.path || (tab.path === APP_ROUTES.RESOURCE_HUB && location.pathname.startsWith('/resources/')) || (tab.path === APP_ROUTES.STUDY_GROUPS && location.pathname.startsWith('/study-groups/')) ? 'page' : undefined} to={tab.to}>{tab.label}</Link>)}
            </nav>
          </section>}
          {children}
        </main>
      </div>
    </div>

    {exploreOpen && <div ref={explorePanel} id="campus-mobile-explore" className={styles.mobileExplore} tabIndex={-1} onKeyDown={event => { if (event.key === 'Escape') closeExplore(); }}>
      <div className={styles.exploreHeading}><h2>Menu</h2><button type="button" onClick={closeExplore} aria-label="Đóng Menu"><CampusIcon name="x" /></button></div>
      {groupedNavigation(true)}
      <Link className={styles.navItem} to={APP_ROUTES.ACADEMIC_PROFILE}>Hồ sơ học thuật{demo ? ' · Cần đăng nhập thật' : ''}</Link>
      {(user?.role === 'ADMIN' || user?.role === 'MODERATOR') && navLink({ label: 'Kiểm duyệt nội dung', to: APP_ROUTES.MODERATION_DASHBOARD, icon: 'files' })}
    </div>}
    <nav className={styles.mobileTabbar} aria-label="Điều hướng điện thoại">
      {CAMPUS_PRIMARY_NAV.map(item => <Link key={item.to} to={item.to} aria-current={isCampusNavActive(item.to, location.pathname) ? 'page' : undefined} onClick={() => setExploreOpen(false)} className={`${styles.mobileTab} ${isCampusNavActive(item.to, location.pathname) ? styles.active : ''}`}><CampusIcon name={item.icon} /><span>{item.mobileLabel}</span></Link>)}
      <button ref={exploreButton} type="button" className={`${styles.mobileTab} ${exploreOpen || !CAMPUS_PRIMARY_NAV.some(item => isCampusNavActive(item.to, location.pathname)) ? styles.active : ''}`} aria-expanded={exploreOpen} aria-controls="campus-mobile-explore" onClick={() => setExploreOpen(open => !open)}><CampusIcon name="menu" /><span>Menu</span></button>
    </nav>
  </div>;
};
