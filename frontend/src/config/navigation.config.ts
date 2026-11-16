import { APP_ROUTES } from './routes.config';

export const CAMPUS_PRIMARY_NAV = [
  { label: 'Trang chủ', mobileLabel: 'Trang chủ', to: APP_ROUTES.CAMPUS_FEED, icon: 'home' },
  { label: 'Theo môn học', mobileLabel: 'Học phần', to: APP_ROUTES.COURSE_FEED, icon: 'book' },
  { label: 'Kho tài liệu', mobileLabel: 'Tài liệu', to: APP_ROUTES.RESOURCE_HUB, icon: 'files' },
  { label: 'Tìm nhóm học / đồ án', mobileLabel: 'Tìm nhóm', to: APP_ROUTES.STUDY_GROUPS, icon: 'users' },
] as const;

export const CAMPUS_SECONDARY_NAV = [
  { label: 'Thảo luận Khoa / Viện', to: APP_ROUTES.DEPARTMENT_FEED },
  { label: 'Đánh giá học phần & giảng viên', to: APP_ROUTES.COURSE_REVIEWS },
  { label: 'Diễn đàn hỏi bài', to: APP_ROUTES.SUBJECT_QA_FORUM },
  { label: 'Chợ sinh viên', to: APP_ROUTES.MARKETPLACE_ITEMS },
  { label: 'Phòng trọ & ở ghép', to: APP_ROUTES.HOUSING_FINDER },
  { label: 'Tin nhắn & chat nhóm', to: APP_ROUTES.MESSENGER },
  { label: 'Thông báo', to: APP_ROUTES.NOTIFICATIONS },
  { label: 'Karma & đặc quyền', to: APP_ROUTES.ACADEMIC_KARMA },
  { label: 'Hồ sơ học thuật', to: APP_ROUTES.ACADEMIC_PROFILE },
] as const;
