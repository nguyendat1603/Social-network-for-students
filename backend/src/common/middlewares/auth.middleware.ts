import { Request, Response, NextFunction } from 'express';
import { JwtUserPayload, verifyAccessToken } from '../utils/jwt.util';
import { AppError } from '../utils/response.util';

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(
        'Vui lòng đăng nhập để tiếp tục.',
        401,
        'UNAUTHORIZED'
      );
    }

    const token = authHeader.slice(7).trim();
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof AppError) {
      next(err);
      return;
    }
    next(
      new AppError(
        'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.',
        401,
        'INVALID_ACCESS_TOKEN'
      )
    );
  }
}
