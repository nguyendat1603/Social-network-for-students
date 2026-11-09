import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { APP_ROUTES } from './config/routes.config';
import { useAuth } from './hooks/useAuth';
import { AcademicProfilePage } from './features/identity/pages/AcademicProfilePage';
import { LoginPage } from './features/identity/pages/LoginPage';
import { OtpVerificationPage } from './features/identity/pages/OtpVerificationPage';
import { RegisterEduPage } from './features/identity/pages/RegisterEduPage';
import { SsoCallbackPage } from './features/identity/pages/SsoCallbackPage';
import { CampusFeedPage } from './features/feed/pages/CampusFeedPage';
import { CourseFeedPage } from './features/feed/pages/CourseFeedPage';
import { DepartmentFeedPage } from './features/feed/pages/DepartmentFeedPage';
import { PostDetailPage } from './features/feed/pages/PostDetailPage';
import { CourseReviewDetailPage } from './features/course-review/pages/CourseReviewDetailPage';
import { CourseReviewDirectoryPage } from './features/course-review/pages/CourseReviewDirectoryPage';
import { SubjectQaForumPage } from './features/course-review/pages/SubjectQaForumPage';
import { DocumentDetailPage } from './features/resource-hub/pages/DocumentDetailPage';
import { ResourceHubPage } from './features/resource-hub/pages/ResourceHubPage';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to={APP_ROUTES.LOGIN} replace />;
  }
  return children;
};

export const AppRouter: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to={
                isAuthenticated
                  ? APP_ROUTES.CAMPUS_FEED
                  : APP_ROUTES.LOGIN
              }
              replace
            />
          }
        />

        {/* Module 1: Identity & Student Verification */}
        <Route path={APP_ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={APP_ROUTES.REGISTER_EDU} element={<RegisterEduPage />} />
        <Route path={APP_ROUTES.VERIFY_OTP} element={<OtpVerificationPage />} />
        <Route path={APP_ROUTES.SSO_CALLBACK} element={<SsoCallbackPage />} />
        <Route
          path={APP_ROUTES.ACADEMIC_PROFILE}
          element={
            <ProtectedRoute>
              <AcademicProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Module 2: Academic Discussion & Feed */}
        <Route
          path={APP_ROUTES.CAMPUS_FEED}
          element={
            <ProtectedRoute>
              <CampusFeedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.DEPARTMENT_FEED}
          element={
            <ProtectedRoute>
              <DepartmentFeedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.COURSE_FEED}
          element={
            <ProtectedRoute>
              <CourseFeedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.POST_DETAIL}
          element={
            <ProtectedRoute>
              <PostDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Module 4: Course Review & Peer Q&A */}
        <Route
          path={APP_ROUTES.COURSE_REVIEWS}
          element={
            <ProtectedRoute>
              <CourseReviewDirectoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.SUBJECT_QA_FORUM}
          element={
            <ProtectedRoute>
              <SubjectQaForumPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.COURSE_REVIEW_DETAIL}
          element={
            <ProtectedRoute>
              <CourseReviewDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Module 5: Document & Resource Hub */}
        <Route
          path={APP_ROUTES.RESOURCE_HUB}
          element={
            <ProtectedRoute>
              <ResourceHubPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.RESOURCE_DETAIL}
          element={
            <ProtectedRoute>
              <DocumentDetailPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
