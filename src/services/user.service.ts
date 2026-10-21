import { prisma } from '../config/db';
import { AppError } from '../utils/errors';

export class UserService {
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        age: true,
        weightKg: true,
        goal: true,
        experienceLevel: true,
        sessionsPerWeek: true,
        sessionDurationMinutes: true,
        equipment: true,
        reminderTime: true,
        streakWeeks: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'Pengguna tidak ditemukan');
    }

    return user;
  }

  static async updateProfile(userId: string, data: Record<string, any>) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        displayName: true,
        age: true,
        weightKg: true,
        goal: true,
        experienceLevel: true,
        sessionsPerWeek: true,
        sessionDurationMinutes: true,
        equipment: true,
        reminderTime: true,
        streakWeeks: true,
      },
    });

    return updatedUser;
  }
}