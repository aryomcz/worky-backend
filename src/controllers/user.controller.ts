import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { UserService } from '../services/user.service';
import { updateProfileSchema } from '../schemas/user.schema';

export class UserController {
  static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const profile = await UserService.getProfile(userId);
      res.status(200).json({ status: 'success', data: profile });
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const validatedData = updateProfileSchema.parse(req.body);
      const updated = await UserService.updateProfile(userId, validatedData);
      res.status(200).json({ status: 'success', data: updated });
    } catch (err) {
      next(err);
    }
  }
}