import { APP_ROUTES } from './routes.config';

export function courseNavigation(code: string) {
  const encoded = encodeURIComponent(code);
  return [
    { label: 'Thảo luận', to: `${APP_ROUTES.COURSE_FEED}?code=${encoded}`, path: APP_ROUTES.COURSE_FEED },
    { label: 'Hỏi đáp', to: `${APP_ROUTES.SUBJECT_QA_FORUM}?courseCode=${encoded}`, path: APP_ROUTES.SUBJECT_QA_FORUM },
    { label: 'Tài liệu', to: `${APP_ROUTES.RESOURCE_HUB}?code=${encoded}`, path: APP_ROUTES.RESOURCE_HUB },
    { label: 'Nhóm học', to: `${APP_ROUTES.STUDY_GROUPS}?code=${encoded}`, path: APP_ROUTES.STUDY_GROUPS },
    { label: 'Đánh giá', to: `${APP_ROUTES.COURSE_REVIEWS}/${encoded}`, path: `${APP_ROUTES.COURSE_REVIEWS}/${encoded}` },
  ];
}
