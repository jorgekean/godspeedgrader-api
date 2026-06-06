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

// Section Schema
export const sectionSchema = z.object({
  id: IdSchema,
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
  gradeLevel: z.string().min(1),
  subject: z.string().min(1),
  title: z.string().min(1),
  itemCount: z.number().int().positive(),
  answerKey: z.string().min(1), // Expecting JSON string
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
  answers: z.string().min(1), // Expecting JSON string
  scannedAt: z.coerce.date(),
  createdAt: z.coerce.date().optional(),
  isDeleted: z.boolean().optional(), // Add this for hard-delete requests
});

// Batch Sync Schema (for bulk uploads)
export const syncBatchSchema = z.object({
  periods: z.array(periodSchema).optional(),
  sections: z.array(sectionSchema).optional(),
  students: z.array(studentSchema).optional(),
  exams: z.array(examSchema).optional(),
  scanResults: z.array(scanResultSchema).optional(),
});

export type SyncBatchInput = z.infer<typeof syncBatchSchema>;
export type PeriodInput = z.infer<typeof periodSchema>;
export type SectionInput = z.infer<typeof sectionSchema>;
export type StudentInput = z.infer<typeof studentSchema>;
export type ExamInput = z.infer<typeof examSchema>;
export type ScanResultInput = z.infer<typeof scanResultSchema>;
