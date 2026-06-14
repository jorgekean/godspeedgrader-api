import { z } from 'zod';

// Base ID schema
const IdSchema = z.string().uuid();

// Period Schema
export const periodSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  createdAt: z.coerce.date().optional(),
  isDeleted: z.boolean().optional(),
});

// Grade Level Schema (NEW)
export const gradeLevelSchema = z.object({
  id: IdSchema,
  title: z.string().min(1),
  createdAt: z.coerce.date().optional(),
  isDeleted: z.boolean().optional(),
});

// Subject Schema (NEW)
export const subjectSchema = z.object({
  id: IdSchema,
  title: z.string().min(1),
  createdAt: z.coerce.date().optional(),
  isDeleted: z.boolean().optional(),
});

// Section Schema
export const sectionSchema = z.object({
  id: IdSchema,
  gradeLevelId: IdSchema.optional().nullable(),
  gradeLevel: z.string().min(1),
  sectionName: z.string().min(1),
  createdAt: z.coerce.date().optional(),
  isDeleted: z.boolean().optional(), // Add this for hard-delete requests
});

// Student Schema
export const studentSchema = z.object({
  id: IdSchema,
  sectionId: IdSchema,
  fullName: z.string().min(1),
  studentNo: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  isDeleted: z.boolean().optional(), // Add this for hard-delete requests
});

// Exam Schema
export const examSchema = z.object({
  id: IdSchema,
  periodId: IdSchema.optional().nullable(),
  gradeLevelId: IdSchema.optional().nullable(),
  subjectId: IdSchema.optional().nullable(),
  gradeLevel: z.string().min(1),
  subject: z.string().min(1),
  title: z.string().min(1),
  category: z.string().optional().nullable(),
  maxScore: z.number().int().optional().nullable(),
  itemCount: z.number().int().positive(),
  answerKey: z.string().min(1),
  competencyMap: z.record(z.string(), z.string()).optional().nullable(),
  createdAt: z.coerce.date().optional(),
  isDeleted: z.boolean().optional(), // Add this for hard-delete requests
});

// Scan Result Schema
export const scanResultSchema = z.object({
  id: IdSchema,
  examId: IdSchema,
  studentId: IdSchema,
  sectionId: IdSchema,
  periodId: IdSchema.optional().nullable(),
  score: z.number().int().min(0),
  total: z.number().int().positive(),
  answers: z.record(z.string(), z.string()), // Accept the object from frontend (Key: QuestionID, Value: Answer)
  scannedAt: z.coerce.date(),
  createdAt: z.coerce.date().optional(),
  isDeleted: z.boolean().optional(), // Add this for hard-delete requests
});

// Batch Sync Schema (for bulk uploads)
export const syncBatchSchema = z.object({
  periods: z.array(periodSchema).optional(),
  gradeLevels: z.array(gradeLevelSchema).optional(),
  subjects: z.array(subjectSchema).optional(),
  sections: z.array(sectionSchema).optional(),
  students: z.array(studentSchema).optional(),
  exams: z.array(examSchema).optional(),
  scanResults: z.array(scanResultSchema).optional(),
});

export type SyncBatchInput = z.infer<typeof syncBatchSchema>;
export type PeriodInput = z.infer<typeof periodSchema>;
export type GradeLevelInput = z.infer<typeof gradeLevelSchema>;
export type SubjectInput = z.infer<typeof subjectSchema>;
export type SectionInput = z.infer<typeof sectionSchema>;
export type StudentInput = z.infer<typeof studentSchema>;
export type ExamInput = z.infer<typeof examSchema>;
export type ScanResultInput = z.infer<typeof scanResultSchema>;
