import { z } from 'zod';

export const updateProfileSchema = z.object({
  displayName: z.string().min(2, 'Nama minimal 2 karakter').optional(),
  age: z.number().int().positive('Umur harus positif').optional(),
  weightKg: z.number().positive('Berat badan harus positif').optional(),
  goal: z.enum([
    'GENERAL_FITNESS',
    'STRENGTH_DEVELOPMENT',
    'MUSCULAR_ENDURANCE',
    'BUILDING_CONSISTENCY',
  ]).optional(),
  experienceLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  sessionsPerWeek: z.number().int().min(1).max(7).optional(),
  sessionDurationMinutes: z.number().int().positive().optional(),
  equipment: z.array(z.string()).optional(),
  reminderTime: z.string().optional(),
});