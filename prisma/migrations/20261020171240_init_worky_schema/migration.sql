-- CreateEnum
CREATE TYPE "workout_goal" AS ENUM ('general_fitness', 'strength_development', 'muscular_endurance', 'building_workout_consistency');

-- CreateEnum
CREATE TYPE "user_experience_level" AS ENUM ('beginner', 'intermediate', 'advanced');

-- CreateEnum
CREATE TYPE "cv_status_type" AS ENUM ('planned', 'experimental', 'validated');

-- CreateEnum
CREATE TYPE "plan_status" AS ENUM ('active', 'archived');

-- CreateEnum
CREATE TYPE "session_status" AS ENUM ('in_progress', 'completed', 'abandoned');

-- CreateEnum
CREATE TYPE "event_type" AS ENUM ('rep_completed', 'valid_rep', 'invalid_rep', 'form_error_start', 'form_error_end', 'tracking_lost', 'tracking_recovered', 'session_paused', 'session_resumed', 'session_completed');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "goal" "workout_goal" NOT NULL DEFAULT 'general_fitness',
    "experience_level" "user_experience_level" NOT NULL DEFAULT 'beginner',
    "sessions_per_week" INTEGER,
    "session_duration_minutes" INTEGER,
    "equipment" JSONB DEFAULT '[]',
    "preferences" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "equipment_required" JSONB DEFAULT '[]',
    "camera_guidance" JSONB DEFAULT '{}',
    "supported_errors" JSONB DEFAULT '[]',
    "cv_status" "cv_status_type" NOT NULL DEFAULT 'planned',
    "model_version" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_plans" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "goal" "workout_goal" NOT NULL,
    "status" "plan_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_plan_items" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "exercise_id" UUID NOT NULL,
    "day_of_week" INTEGER,
    "order_index" INTEGER NOT NULL DEFAULT 1,
    "sets" INTEGER NOT NULL,
    "target_reps" INTEGER,
    "target_duration_seconds" INTEGER,
    "rest_seconds" INTEGER NOT NULL DEFAULT 60,
    "notes" TEXT,

    CONSTRAINT "workout_plan_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "plan_id" UUID,
    "exercise_id" UUID NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "active_duration_seconds" INTEGER NOT NULL DEFAULT 0,
    "total_attempts" INTEGER NOT NULL DEFAULT 0,
    "valid_reps" INTEGER NOT NULL DEFAULT 0,
    "invalid_reps" INTEGER NOT NULL DEFAULT 0,
    "unassessed_attempts" INTEGER NOT NULL DEFAULT 0,
    "valid_hold_seconds" INTEGER,
    "valid_rep_rate" DECIMAL(5,2),
    "model_version" VARCHAR(50) NOT NULL,
    "status" "session_status" NOT NULL DEFAULT 'in_progress',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workout_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_events" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "event_type" "event_type" NOT NULL,
    "rep_index" INTEGER,
    "error_code" VARCHAR(100),
    "start_ms" BIGINT NOT NULL,
    "end_ms" BIGINT,
    "duration_ms" INTEGER,
    "confidence" DOUBLE PRECISION,
    "details" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workout_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "exercises_slug_key" ON "exercises"("slug");

-- CreateIndex
CREATE INDEX "workout_events_session_id_idx" ON "workout_events"("session_id");

-- CreateIndex
CREATE INDEX "workout_events_error_code_idx" ON "workout_events"("error_code");

-- AddForeignKey
ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_plan_items" ADD CONSTRAINT "workout_plan_items_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_plan_items" ADD CONSTRAINT "workout_plan_items_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "workout_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_events" ADD CONSTRAINT "workout_events_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "workout_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
