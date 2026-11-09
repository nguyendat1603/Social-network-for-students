import { Response } from 'express';

export interface PaginationMeta {
  page?: number;
  limit?: number;
  total?: number;
  [key: string]: unknown;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode = 400,
    code = 'BAD_REQUEST',
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  meta: PaginationMeta | null = null,
  statusCode = 200
): Response {
  return res.status(statusCode).json({
    success: true,
    data,
    meta,
    error: null,
  });
}

export function sendError(
  res: Response,
  message: string,
  code = 'INTERNAL_ERROR',
  statusCode = 500,
  details: unknown = null
): Response {
  return res.status(statusCode).json({
    success: false,
    data: null,
    meta: null,
    error: {
      code,
      message,
      details,
    },
  });
}
