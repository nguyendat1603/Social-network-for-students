export const APP_ROUTES = {
  LOGIN: '/login',
  REGISTER_EDU: '/register-edu',
  VERIFY_OTP: '/verify-otp',
  SSO_CALLBACK: '/oauth/callback',
  ACADEMIC_PROFILE: '/profile',

  // Module 2: Academic Feed
  CAMPUS_FEED: '/feed',
  DEPARTMENT_FEED: '/feed/department',
  COURSE_FEED: '/feed/course',
  POST_DETAIL: '/feed/posts/:postId',

  // Module 4: Course Review & Peer Q&A
  COURSE_REVIEWS: '/course-reviews',
  COURSE_REVIEW_DETAIL: '/course-reviews/:courseCode',
  SUBJECT_QA_FORUM: '/course-reviews/forum',

  // Module 5: Resource Hub
  RESOURCE_HUB: '/resources',
  RESOURCE_DETAIL: '/resources/:docId',
} as const;
