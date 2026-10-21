import { prisma } from '../config/db';
import { AppError } from '../utils/errors';

export class PlanService {
  // Ambil Plan Aktif Pengguna
  static async getActivePlan(userId: string) {
    const plan = await prisma.workoutPlan.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: {
        workoutPlanItems: {
          include: {
            exercise: {
              select: { id: true, slug: true, name: true, category: true, equipmentRequired: true },
            },
          },
          orderBy: [{ dayOfWeek: 'asc' }, { orderIndex: 'asc' }],
        },
      },
    });

    return plan;
  }

  // Generate / Buat Workout Plan Baru Berdasarkan Profil
  static async generatePlan(userId: string, customName?: string, customGoal?: any) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, 'User tidak ditemukan');

    const goal = customGoal || user.goal || 'GENERAL_FITNESS';
    const name = customName || `Plan ${goal.replace('_', ' ')}`;

    // Nonaktifkan plan aktif sebelumnya jika ada
    await prisma.workoutPlan.updateMany({
      where: { userId, status: 'ACTIVE' },
      data: { status: 'ARCHIVED' },
    });

    // Ambil daftar latihan aktif dari DB
    const exercises = await prisma.exercise.findMany({ where: { isActive: true } });
    if (exercises.length === 0) throw new AppError(400, 'Katalog latihan belum tersedia');

    // Buat Plan Baru
    const newPlan = await prisma.workoutPlan.create({
      data: {
        userId,
        name,
        goal,
        status: 'ACTIVE',
      },
    });

    // Susun item latihan otomatis berdasarkan jumlah hari latihan per minggu
    const sessionsPerWeek = user.sessionsPerWeek || 3;
    const itemsData = [];

    for (let i = 0; i < Math.min(sessionsPerWeek, 7); i++) {
      const exercise = exercises[i % exercises.length];
      itemsData.push({
        planId: newPlan.id,
        exerciseId: exercise.id,
        dayOfWeek: (i * 2) % 7 + 1, // Menyebar hari (misal: Senin, Rabu, Jumat)
        orderIndex: 1,
        sets: exercise.defaultSets || 3,
        targetReps: exercise.defaultTargetReps || 12,
        targetDurationSeconds: exercise.defaultTargetDurationSeconds,
        restSeconds: exercise.defaultRestSeconds || 45,
      });
    }

    await prisma.workoutPlanItem.createMany({ data: itemsData });

    return this.getActivePlan(userId);
  }

  // Update Item Plan (Ubah Set, Repetisi, Istirahat, & Hari Latihan)
  static async updatePlanItem(userId: string, itemId: string, data: Record<string, any>) {
    const item = await prisma.workoutPlanItem.findUnique({
      where: { id: itemId },
      include: { plan: true },
    });

    if (!item || item.plan.userId !== userId) {
      throw new AppError(404, 'Item latihan tidak ditemukan atau bukan milik Anda');
    }

    const updatedItem = await prisma.workoutPlanItem.update({
      where: { id: itemId },
      data,
      include: {
        exercise: {
          select: { id: true, slug: true, name: true, category: true },
        },
      },
    });

    return updatedItem;
  }
}