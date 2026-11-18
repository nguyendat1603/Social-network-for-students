import { APP_ROUTES } from './routes.config';

export interface CampusNavItem {
  label: string;
  mobileLabel?: string;
  to: string;
  icon: string;
}

export const CAMPUS_HOME: CampusNavItem = { label: 'Trang chủ', mobileLabel: 'Trang chủ', to: APP_ROUTES.CAMPUS_FEED, icon: 'home' };
export const CAMPUS_NAV_GROUPS: Array<{ id: string; label: string; items: CampusNavItem[] }> = [
  { id: 'learning', label: 'Học tập', items: [
    { label: 'Học phần', mobileLabel: 'Học phần', to: APP_ROUTES.COURSES, icon: 'book' },
    { label: 'Kho tài liệu', mobileLabel: 'Tài liệu', to: APP_ROUTES.RESOURCE_HUB, icon: 'files' },
    { label: 'Nhóm học & đồ án', mobileLabel: 'Nhóm học', to: APP_ROUTES.STUDY_GROUPS, icon: 'users' },
  ] },
  { id: 'community', label: 'Cộng đồng', items: [
    { label: 'Thảo luận khoa', to: APP_ROUTES.DEPARTMENT_FEED, icon: 'building' },
    { label: 'Chợ sinh viên', to: APP_ROUTES.MARKETPLACE_ITEMS, icon: 'shop' },
    { label: 'Phòng trọ & ở ghép', to: APP_ROUTES.HOUSING_FINDER, icon: 'home' },
  ] },
  { id: 'personal', label: 'Cá nhân', items: [
    { label: 'Tin nhắn', to: APP_ROUTES.MESSENGER, icon: 'message' },
    { label: 'Thông báo', to: APP_ROUTES.NOTIFICATIONS, icon: 'bell' },
    { label: 'Uy tín & đặc quyền', to: APP_ROUTES.ACADEMIC_KARMA, icon: 'spark' },
  ] },
];

export const CAMPUS_PRIMARY_NAV: CampusNavItem[] = [CAMPUS_HOME, ...CAMPUS_NAV_GROUPS[0].items];
export const CAMPUS_ALL_NAV: CampusNavItem[] = [CAMPUS_HOME, ...CAMPUS_NAV_GROUPS.flatMap(group => group.items)];

// Detail pages keep their parent highlighted. Course-scoped resources/groups
// still belong to their global feature, with course tabs providing the context.
export function isCampusNavActive(to: string, pathname: string) {
  if (to === APP_ROUTES.COURSES) return pathname === to || pathname === APP_ROUTES.COURSE_FEED || pathname.startsWith('/course-reviews');
  if (to === APP_ROUTES.CAMPUS_FEED) return pathname === to || pathname.startsWith('/feed/posts/');
  if (to === APP_ROUTES.MARKETPLACE_ITEMS) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}
