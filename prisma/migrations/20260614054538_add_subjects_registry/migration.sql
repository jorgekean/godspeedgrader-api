-- AlterTable
ALTER TABLE "exams" ADD COLUMN     "subject_id" TEXT;

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exams_subject_id_idx" ON "exams"("subject_id");

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
