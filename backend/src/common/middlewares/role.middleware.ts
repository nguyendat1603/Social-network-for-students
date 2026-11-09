import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../constants/roles.constant';
import { AppError } from '../utils/response.util';

export function requireRoles(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Vui lòng đăng nhập.', 401, 'UNAUTHORIZED'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(
        new AppError(
          'Bạn không có quyền truy cập chức năng này.',
          403,
          'FORBIDDEN_ROLE'
        )
      );
      return;
    }

    next();
  };
}
