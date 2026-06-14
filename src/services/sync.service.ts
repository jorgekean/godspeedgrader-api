import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import type { SyncBatchInput } from '../schemas/sync.schema.js';

export class SyncService {
  async syncBatch(userEmail: string, data: SyncBatchInput) {
    return await prisma.$transaction(async (tx) => {
      const results = {
        periods: 0,
        gradeLevels: 0,
        subjects: 0,
        sections: 0,
        students: 0,
        exams: 0,
        scanResults: 0,
      };

      // 0. Sync Periods
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

      // 0.1 Sync Grade Levels (NEW)
      if (data.gradeLevels && data.gradeLevels.length > 0) {
        await Promise.all(data.gradeLevels.map(gl => {
          return tx.gradeLevel.upsert({
            where: { id: gl.id },
            update: {
              title: gl.title,
              updatedAt: new Date(),
              deletedAt: gl.isDeleted ? new Date() : null,
            },
            create: {
              id: gl.id,
              title: gl.title,
              createdBy: userEmail,
              createdAt: gl.createdAt || new Date(),
              deletedAt: gl.isDeleted ? new Date() : null,
            },
          });
        }));
        results.gradeLevels = data.gradeLevels.length;
      }

      // 0.2 Sync Subjects (NEW)
      if (data.subjects && data.subjects.length > 0) {
        await Promise.all(data.subjects.map(s => {
          return tx.subject.upsert({
            where: { id: s.id },
            update: {
              title: s.title,
              updatedAt: new Date(),
              deletedAt: s.isDeleted ? new Date() : null,
            },
            create: {
              id: s.id,
              title: s.title,
              createdBy: userEmail,
              createdAt: s.createdAt || new Date(),
              deletedAt: s.isDeleted ? new Date() : null,
            },
          });
        }));
        results.subjects = data.subjects.length;
      }

      // 1. Sync Sections
      if (data.sections && data.sections.length > 0) {
        await Promise.all(data.sections.map(section => {
          return tx.section.upsert({
            where: { id: section.id },
            update: {
              gradeLevelId: section.gradeLevelId ?? null,
              gradeLevel: section.gradeLevel,
              sectionName: section.sectionName,
              updatedAt: new Date(),
              deletedAt: section.isDeleted ? new Date() : null, // Soft delete
            },
            create: {
              id: section.id,
              gradeLevelId: section.gradeLevelId ?? null,
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
              gradeLevelId: exam.gradeLevelId ?? null,
              subjectId: exam.subjectId ?? null,
              gradeLevel: exam.gradeLevel,
              subject: exam.subject,
              title: exam.title,
              examCode: exam.examCode ?? null,
              category: exam.category ?? null,
              maxScore: exam.maxScore ?? null,
              itemCount: exam.itemCount,
              answerKey: exam.answerKey,
              competencyMap: (exam.competencyMap as any) ?? null,
              updatedAt: new Date(),
              deletedAt: exam.isDeleted ? new Date() : null, // Soft delete
            },
            create: {
              id: exam.id,
              periodId: exam.periodId ?? null,
              gradeLevelId: exam.gradeLevelId ?? null,
              subjectId: exam.subjectId ?? null,
              gradeLevel: exam.gradeLevel,
              subject: exam.subject,
              title: exam.title,
              examCode: exam.examCode ?? null,
              category: exam.category ?? null,
              maxScore: exam.maxScore ?? null,
              itemCount: exam.itemCount,
              answerKey: exam.answerKey,
              competencyMap: (exam.competencyMap as any) ?? null,
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

    const [periods, gradeLevels, subjects, sections, students, exams, rawScanResults] = await Promise.all([
      prisma.period.findMany({ where: whereClause }),
      prisma.gradeLevel.findMany({ where: whereClause }),
      prisma.subject.findMany({ where: whereClause }),
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
      gradeLevels,
      subjects,
      sections,
      students,
      exams,
      scanResults,
    };
  }
}


