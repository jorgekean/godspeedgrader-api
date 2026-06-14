-- AlterTable
ALTER TABLE "exams" ADD COLUMN     "grade_level_id" TEXT;

-- AlterTable
ALTER TABLE "sections" ADD COLUMN     "grade_level_id" TEXT;

-- CreateTable
CREATE TABLE "grade_levels" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "grade_levels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exams_grade_level_id_idx" ON "exams"("grade_level_id");

-- CreateIndex
CREATE INDEX "sections_grade_level_id_idx" ON "sections"("grade_level_id");

-- AddForeignKey
ALTER TABLE "grade_levels" ADD CONSTRAINT "grade_levels_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_grade_level_id_fkey" FOREIGN KEY ("grade_level_id") REFERENCES "grade_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_grade_level_id_fkey" FOREIGN KEY ("grade_level_id") REFERENCES "grade_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;
