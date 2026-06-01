import { prisma } from '../lib/prisma.js';
import type { SyncBatchInput } from '../schemas/sync.schema.js';

export class SyncService {
  async syncBatch(userId: string, data: SyncBatchInput) {
    return await prisma.$transaction(async (tx) => {
      const results = {
        sections: 0,
        students: 0,
        exams: 0,
        scanResults: 0,
      };

      // 1. Sync Sections
      if (data.sections && data.sections.length > 0) {
        await Promise.all(data.sections.map(section => {
          return tx.section.upsert({
            where: { id: section.id },
            update: {
              gradeLevel: section.gradeLevel,
              sectionName: section.sectionName,
              updatedAt: new Date(),
              deletedAt: section.isDeleted ? new Date() : null, // Soft delete
            },
            create: {
              id: section.id,
              gradeLevel: section.gradeLevel,
              sectionName: section.sectionName,
              createdBy: userId,
              createdAt: section.createdAt || new Date(),
              deletedAt: section.isDeleted ? new Date() : null,
            },
          });
        }));
        results.sections = data.sections.length;
      }

      // 2. Sync Students
      if (data.students && data.students.length > 0) {
        await Promise.all(data.students.map(student => {
          return tx.student.upsert({
            where: { id: student.id },
            update: {
              sectionId: student.sectionId,
              fullName: student.fullName,
              studentNo: student.studentNo ?? null,
              updatedAt: new Date(),
              deletedAt: student.isDeleted ? new Date() : null, // Soft delete
            },
            create: {
              id: student.id,
              sectionId: student.sectionId,
              fullName: student.fullName,
              studentNo: student.studentNo ?? null,
              createdBy: userId,
              createdAt: student.createdAt || new Date(),
              deletedAt: student.isDeleted ? new Date() : null,
            },
          });
        }));
        results.students = data.students.length;
      }

      // 3. Sync Exams
      if (data.exams && data.exams.length > 0) {
        await Promise.all(data.exams.map(exam => {
          return tx.exam.upsert({
            where: { id: exam.id },
            update: {
              gradeLevel: exam.gradeLevel,
              subject: exam.subject,
              title: exam.title,
              itemCount: exam.itemCount,
              answerKey: exam.answerKey,
              updatedAt: new Date(),
              deletedAt: exam.isDeleted ? new Date() : null, // Soft delete
            },
            create: {
              id: exam.id,
              gradeLevel: exam.gradeLevel,
              subject: exam.subject,
              title: exam.title,
              itemCount: exam.itemCount,
              answerKey: exam.answerKey,
              createdBy: userId,
              createdAt: exam.createdAt || new Date(),
              deletedAt: exam.isDeleted ? new Date() : null,
            },
          });
        }));
        results.exams = data.exams.length;
      }

      // 4. Sync Scan Results
      if (data.scanResults && data.scanResults.length > 0) {
        await Promise.all(data.scanResults.map(result => {
          return tx.scanResult.upsert({
            where: { id: result.id },
            update: {
              examId: result.examId,
              studentId: result.studentId,
              sectionId: result.sectionId,
              score: result.score,
              total: result.total,
              answers: result.answers,
              scannedAt: result.scannedAt,
              updatedAt: new Date(),
              deletedAt: result.isDeleted ? new Date() : null, // Soft delete
            },
            create: {
              id: result.id,
              examId: result.examId,
              studentId: result.studentId,
              sectionId: result.sectionId,
              score: result.score,
              total: result.total,
              answers: result.answers,
              scannedAt: result.scannedAt,
              createdBy: userId,
              createdAt: result.createdAt || new Date(),
              deletedAt: result.isDeleted ? new Date() : null,
            },
          });
        }));
        results.scanResults = data.scanResults.length;
      }

      return results;
    });
  }

  async getSyncData(userId: string, since?: Date) {
    const whereClause = {
      createdBy: userId,
      ...(since ? { updatedAt: { gte: since } } : {}),
    };

    const [sections, students, exams, scanResults] = await Promise.all([
      prisma.section.findMany({ where: whereClause }),
      prisma.student.findMany({ where: whereClause }),
      prisma.exam.findMany({ where: whereClause }),
      prisma.scanResult.findMany({ where: whereClause }),
    ]);

    return {
      sections,
      students,
      exams,
      scanResults,
    };
  }
}

