import { PrismaClient } from '../src/app/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Memulai Seeding Data Worky ---');

  // 1. Seed User Dummy (Badzlan Nur dari UI Profil)
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'badzlan@worky.id' },
    update: {},
    create: {
      email: 'badzlan@worky.id',
      passwordHash: hashedPassword,
      displayName: 'Badzlan Nur',
      age: 24,
      weightKg: 68.0,
      goal: 'GENERAL_FITNESS',
      experienceLevel: 'BEGINNER',
      sessionsPerWeek: 4,
      sessionDurationMinutes: 20,
      equipment: ['Tanpa alat'],
      reminderTime: '18:30',
      streakWeeks: 5,
    },
  });
  console.log(`User seeded: ${user.displayName}`);

  // 2. Seed Master Exercise
  const exercisesData = [
    {
      slug: 'push_up',
      name: 'Push-up',
      category: 'UPPER' as const,
      description: 'Dada / Tricep / Bahu',
      instructions: [
        'Tangan selebar bahu, badan lurus.',
        'Turunkan dada hingga siku ±90°.',
        'Dorong kembali ke posisi awal.',
      ],
      equipmentRequired: [],
      cameraGuidance: { position: 'Samping', distance: '2-3 m' },
      supportedErrors: ['hip_alignment', 'insufficient_depth', 'head_down'],
      defaultSets: 3,
      defaultTargetReps: 12,
      defaultRestSeconds: 45,
      cvStatus: 'VALIDATED' as const,
      modelVersion: 'v1.0.0',
    },
    {
      slug: 'squat',
      name: 'Squat',
      category: 'LOWER' as const,
      description: 'Paha / Glutes / Core',
      instructions: [
        'Buka kaki selebar bahu.',
        'Turunkan pinggul seperti hendak duduk hingga paha sejajar lantai.',
        'Dorong tumit untuk kembali berdiri tegak.',
      ],
      equipmentRequired: [],
      cameraGuidance: { position: 'Samping / Depan', distance: '2-3 m' },
      supportedErrors: ['insufficient_depth', 'knee_inward', 'forward_lean'],
      defaultSets: 3,
      defaultTargetReps: 15,
      defaultRestSeconds: 45,
      cvStatus: 'EXPERIMENTAL' as const,
      modelVersion: 'v0.9.0',
    },
    {
      slug: 'sit_up',
      name: 'Sit-up',
      category: 'CORE' as const,
      description: 'Otot Perut / Flexor Panggul',
      instructions: [
        'Berbaring telentang dengan lutut ditekuk.',
        'Angkat tubuh bagian atas menuju arah lutut.',
        'Turunkan tubuh secara perlahan ke lantai.',
      ],
      equipmentRequired: [],
      cameraGuidance: { position: 'Samping', distance: '2 m' },
      supportedErrors: ['incomplete_rep', 'excessive_momentum'],
      defaultSets: 3,
      defaultTargetReps: 20,
      defaultRestSeconds: 45,
      cvStatus: 'PLANNED' as const,
      modelVersion: 'v0.5.0',
    },
    {
      slug: 'plank',
      name: 'Plank',
      category: 'CORE' as const,
      description: 'Stabilitas Otot Core',
      instructions: [
        'Posisikan siku di lantai tepat di bawah bahu.',
        'Jaga tubuh tetap lurus dari kepala hingga tumit.',
        'Tahan posisi sesuai target durasi.',
      ],
      equipmentRequired: ['exercise_mat'],
      cameraGuidance: { position: 'Samping', distance: '2 m' },
      supportedErrors: ['hip_alignment'],
      defaultSets: 3,
      defaultTargetDurationSeconds: 45,
      defaultRestSeconds: 45,
      cvStatus: 'PLANNED' as const,
      modelVersion: 'v0.5.0',
    },
  ];

  const exercisesMap: Record<string, string> = {};
  for (const ex of exercisesData) {
    const created = await prisma.exercise.upsert({
      where: { slug: ex.slug },
      update: {},
      create: ex,
    });
    exercisesMap[ex.slug] = created.id;
  }
  console.log('Master exercises seeded.');

  // 3. Seed Workout Plan
  const plan = await prisma.workoutPlan.create({
    data: {
      userId: user.id,
      name: 'Minggu ke-5: Bentuk tubuh - Pemula',
      goal: 'GENERAL_FITNESS',
      status: 'ACTIVE',
      workoutPlanItems: {
        create: [
          { exerciseId: exercisesMap['push_up'], dayOfWeek: 1, sets: 3, targetReps: 12 },
          { exerciseId: exercisesMap['squat'], dayOfWeek: 2, sets: 3, targetReps: 15 },
          { exerciseId: exercisesMap['push_up'], dayOfWeek: 4, sets: 3, targetReps: 12 },
          { exerciseId: exercisesMap['sit_up'], dayOfWeek: 6, sets: 3, targetReps: 20 },
        ],
      },
    },
  });
  console.log(`Workout plan seeded: ${plan.name}`);

  // 4. Seed Riwayat Workout Sessions (Seusai dengan Gambar Beranda UI)
  await prisma.workoutSession.createMany({
    data: [
      {
        userId: user.id,
        exerciseId: exercisesMap['push_up'],
        sessionName: 'Full Body Pemula',
        totalAttempts: 48,
        totalReps: 48,
        validReps: 42,
        invalidReps: 6,
        activeDurationSeconds: 768, // 12:48
        validRepRate: 87.5,
        modelVersion: 'v1.0.0',
        status: 'COMPLETED',
      },
      {
        userId: user.id,
        exerciseId: exercisesMap['push_up'],
        sessionName: 'Upper Body Rumahan',
        totalAttempts: 40,
        totalReps: 40,
        validReps: 35,
        invalidReps: 5,
        activeDurationSeconds: 644, // 10:44
        validRepRate: 87.5,
        modelVersion: 'v1.0.0',
        status: 'COMPLETED',
      },
      {
        userId: user.id,
        exerciseId: exercisesMap['sit_up'],
        sessionName: 'Core 10 Menit',
        totalAttempts: 55,
        totalReps: 55,
        validReps: 50,
        invalidReps: 5,
        activeDurationSeconds: 618, // 10:18
        validRepRate: 90.9,
        modelVersion: 'v1.0.0',
        status: 'COMPLETED',
      },
    ],
  });
  console.log('Riwayat sesi latihan seeded.');

  console.log('--- Seeding Selesai 100% ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });