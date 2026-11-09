import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, sendError } from '../utils/response.util';

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  if (err instanceof AppError) {
    return sendError(res, err.message, err.code, err.statusCode, err.details);
  }

  if (err instanceof ZodError) {
    return sendError(
      res,
      'Dữ liệu đầu vào không hợp lệ.',
      'VALIDATION_ERROR',
      400,
      err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }))
    );
  }

  const fallbackMessage =
    err instanceof Error ? err.message : 'Lỗi hệ thống không xác định.';
  return sendError(res, fallbackMessage, 'INTERNAL_SERVER_ERROR', 500);
}
