import { prisma } from '../lib/prisma.js';
import type { SyncBatchInput } from '../schemas/sync.schema.js';

export class SyncService {
  async syncBatch(userEmail: string, data: SyncBatchInput) {
    return await prisma.$transaction(async (tx) => {
      const results = {
        periods: 0,
        sections: 0,
        students: 0,
        exams: 0,
        scanResults: 0,
      };

      // 0. Sync Periods (NEW)
      if (data.periods && data.periods.length > 0) {
        await Promise.all(data.periods.map(period => {
          return tx.period.upsert({
            where: { id: period.id },
            update: {
              name: period.name,
              startDate: period.startDate,
              endDate: period.endDate,
              updatedAt: new Date(),
              deletedAt: period.isDeleted ? new Date() : null,
            },
            create: {
              id: period.id,
              name: period.name,
              startDate: period.startDate,
              endDate: period.endDate,
              createdBy: userEmail,
              createdAt: period.createdAt || new Date(),
              deletedAt: period.isDeleted ? new Date() : null,
            },
          });
        }));
        results.periods = data.periods.length;
      }

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
              createdBy: userEmail,
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
              createdBy: userEmail,
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
              periodId: exam.periodId ?? null,
              gradeLevel: exam.gradeLevel,
              subject: exam.subject,
              title: exam.title,
              category: exam.category ?? null,
              maxScore: exam.maxScore ?? null,
              itemCount: exam.itemCount,
              answerKey: exam.answerKey,
              updatedAt: new Date(),
              deletedAt: exam.isDeleted ? new Date() : null, // Soft delete
            },
            create: {
              id: exam.id,
              periodId: exam.periodId ?? null,
              gradeLevel: exam.gradeLevel,
              subject: exam.subject,
              title: exam.title,
              category: exam.category ?? null,
              maxScore: exam.maxScore ?? null,
              itemCount: exam.itemCount,
              answerKey: exam.answerKey,
              createdBy: userEmail,
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
          const stringifiedAnswers = JSON.stringify(result.answers);
          return tx.scanResult.upsert({
            where: { id: result.id },
            update: {
              examId: result.examId,
              studentId: result.studentId,
              sectionId: result.sectionId,
              periodId: result.periodId ?? null,
              score: result.score,
              total: result.total,
              answers: stringifiedAnswers,
              scannedAt: result.scannedAt,
              updatedAt: new Date(),
              deletedAt: result.isDeleted ? new Date() : null, // Soft delete
            },
            create: {
              id: result.id,
              examId: result.examId,
              studentId: result.studentId,
              sectionId: result.sectionId,
              periodId: result.periodId ?? null,
              score: result.score,
              total: result.total,
              answers: stringifiedAnswers,
              scannedAt: result.scannedAt,
              createdBy: userEmail,
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

  async getSyncData(userEmail: string, since?: Date) {
    const whereClause = {
      createdBy: userEmail,
      deletedAt: null,
      ...(since ? { updatedAt: { gte: since } } : {}),
    };

    const [periods, sections, students, exams, rawScanResults] = await Promise.all([
      prisma.period.findMany({ where: whereClause }),
      prisma.section.findMany({ where: whereClause }),
      prisma.student.findMany({ where: whereClause }),
      prisma.exam.findMany({ where: whereClause }),
      prisma.scanResult.findMany({ where: whereClause }),
    ]);

    // Parse JSON answers for the client
    const scanResults = rawScanResults.map(sr => ({
      ...sr,
      answers: JSON.parse(sr.answers)
    }));

    return {
      periods,
      sections,
      students,
      exams,
      scanResults,
    };
  }
}


