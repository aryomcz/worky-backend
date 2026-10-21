import { prisma } from '../config/db';
import { AppError } from '../utils/errors';

export class SessionService {
  static async startSession(
    userId: string,
    data: { exerciseId: string; planId?: string; sessionName?: string; modelVersion: string }
  ) {
    const exercise = await prisma.exercise.findUnique({ where: { id: data.exerciseId } });
    if (!exercise) {
      throw new AppError(404, 'Latihan tidak ditemukan');
    }

    const session = await prisma.workoutSession.create({
      data: {
        userId,
        exerciseId: data.exerciseId,
        planId: data.planId,
        sessionName: data.sessionName || `Sesi ${exercise.name}`,
        modelVersion: data.modelVersion,
        status: 'IN_PROGRESS',
      },
    });

    return session;
  }

  static async logEvents(userId: string, sessionId: string, events: any[]) {
    const session = await prisma.workoutSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new AppError(404, 'Sesi latihan tidak ditemukan');
    }

    const createdEvents = await prisma.workoutEvent.createMany({
      data: events.map((e) => ({
        sessionId,
        eventType: e.eventType,
        repIndex: e.repIndex,
        errorCode: e.errorCode,
        startMs: BigInt(e.startMs),
        endMs: e.endMs ? BigInt(e.endMs) : null,
        durationMs: e.durationMs,
        confidence: e.confidence,
        details: e.details || {},
      })),
    });

    return createdEvents;
  }

  static async completeSession(userId: string, sessionId: string, summary: any) {
    const session = await prisma.workoutSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new AppError(404, 'Sesi latihan tidak ditemukan');
    }

    const assessedAttempts = summary.validReps + summary.invalidReps;
    const validRepRate = assessedAttempts > 0 ? (summary.validReps / assessedAttempts) * 100 : 0;

    const updatedSession = await prisma.workoutSession.update({
      where: { id: sessionId },
      data: {
        completedAt: new Date(),
        activeDurationSeconds: summary.activeDurationSeconds,
        totalAttempts: summary.totalAttempts,
        totalReps: summary.totalReps,
        validReps: summary.validReps,
        invalidReps: summary.invalidReps,
        unassessedAttempts: summary.unassessedAttempts,
        validHoldSeconds: summary.validHoldSeconds,
        validRepRate: validRepRate,
        status: 'COMPLETED',
      },
      include: {
        exercise: { select: { name: true, slug: true } },
        workoutEvents: true,
      },
    });

    return updatedSession;
  }

  static async getUserHistory(userId: string) {
    const sessions = await prisma.workoutSession.findMany({
      where: { userId, status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
      include: {
        exercise: {
          select: { name: true, slug: true, category: true },
        },
      },
    });

    return sessions;
  }
}