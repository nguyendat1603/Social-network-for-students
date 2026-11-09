import { Router } from 'express';
import { authMiddleware } from '../../common/middlewares/auth.middleware';
import { verifiedStudentMiddleware } from '../../common/middlewares/verified-student.middleware';
import { identityController } from './identity.controller';

const router = Router();

// Public Academic Catalog (Faculties & Courses)
router.get('/catalog', (req, res, next) =>
  identityController.getCatalog(req, res, next)
);

// Registration & Student Verification (.edu OTP & School SSO OAuth2)
router.post('/register-edu', (req, res, next) =>
  identityController.registerEdu(req, res, next)
);
router.post('/verify-otp', (req, res, next) =>
  identityController.verifyOtp(req, res, next)
);
router.post('/resend-otp', (req, res, next) =>
  identityController.resendOtp(req, res, next)
);
router.post('/login', (req, res, next) =>
  identityController.login(req, res, next)
);
router.post('/oauth/school/callback', (req, res, next) =>
  identityController.schoolSsoCallback(req, res, next)
);
router.post('/refresh', (req, res, next) =>
  identityController.refresh(req, res, next)
);

// Protected Academic Profile & Anonymous Handle Routes
router.get('/profile/me', authMiddleware, (req, res, next) =>
  identityController.getMyProfile(req, res, next)
);
router.get('/profile/:userId', authMiddleware, (req, res, next) =>
  identityController.getProfileByUserId(req, res, next)
);
router.put(
  '/profile',
  authMiddleware,
  verifiedStudentMiddleware,
  (req, res, next) => identityController.updateMyProfile(req, res, next)
);
router.patch(
  '/anonymous-handle',
  authMiddleware,
  verifiedStudentMiddleware,
  (req, res, next) => identityController.updateAnonymousHandle(req, res, next)
);

export const identityRoutes = router;
