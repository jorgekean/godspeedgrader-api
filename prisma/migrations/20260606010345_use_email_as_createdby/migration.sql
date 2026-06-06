-- DropForeignKey
ALTER TABLE "exams" DROP CONSTRAINT "exams_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "scan_results" DROP CONSTRAINT "scan_results_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "sections" DROP CONSTRAINT "sections_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_createdBy_fkey";

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scan_results" ADD CONSTRAINT "scan_results_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;
