import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/response.util';

export function verifiedStudentMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    next(new AppError('Vui lòng đăng nhập.', 401, 'UNAUTHORIZED'));
    return;
  }

  if (!req.user.isVerifiedStudent) {
    next(
      new AppError(
        'Tài khoản chưa được xác thực email sinh viên (.edu). Vui lòng xác thực OTP hoặc SSO trường để mở khóa huy hiệu Verified Student.',
        403,
        'VERIFIED_STUDENT_REQUIRED'
      )
    );
    return;
  }

  next();
}
