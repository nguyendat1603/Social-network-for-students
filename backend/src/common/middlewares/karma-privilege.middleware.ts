import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../database';
import { AppError } from '../utils/response.util';

export function requireMinKarma(minKarma: number, featureName: string) {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Vui lòng đăng nhập.', 401, 'UNAUTHORIZED');
      }

      const { data: user } = await supabase
        .from('users')
        .select('karma_points')
        .eq('id', req.user.userId)
        .maybeSingle();

      const currentKarma = user?.karma_points ?? 0;
      if (currentKarma < minKarma) {
        throw new AppError(
          `Chức năng "${featureName}" yêu cầu tối thiểu ${minKarma} điểm Academic Karma (Hiện tại: ${currentKarma}).`,
          403,
          'INSUFFICIENT_KARMA_PRIVILEGE',
          { requiredKarma: minKarma, currentKarma }
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
