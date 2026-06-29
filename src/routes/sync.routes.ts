import type { FastifyInstance } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { SyncService } from '../services/sync.service.js';
import {
  syncBatchSchema,
  periodSchema,
  gradeLevelSchema,
  subjectSchema,
  sectionSchema,
  studentSchema,
  examSchema,
  scanResultSchema
} from '../schemas/sync.schema.js';

export async function syncRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();
  const syncService = new SyncService();

  // 1. POST /sync - Batch upload from client
  server.post('/', {
    schema: {
      description: 'Sync batch data from client to server (Offline-first)',
      tags: ['Sync'],
      body: syncBatchSchema,
      security: [{ bearerAuth: [] }],
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          results: z.object({
            periods: z.number().int(),
            gradeLevels: z.number().int(),
            subjects: z.number().int(),
            sections: z.number().int(),
            students: z.number().int(),
            exams: z.number().int(),
            scanResults: z.number().int(),
          })
        }),
        500: z.object({
          success: z.boolean(),
          message: z.string(),
          stack: z.string().optional()
        })
      }
    }
  }, async (request, reply) => {
    const userEmail = (request.user as any).email;
    const data = request.body;

    const results = await syncService.syncBatch(userEmail, data);
    return {
      success: true,
      message: 'Sync completed successfully',
      results
    };
  });

  // 2. GET /sync - Pull data for the user (Supports incremental sync)
  server.get('/', {
    schema: {
      description: 'Fetch user data for synchronization. Use "since" for incremental sync.',
      tags: ['Sync'],
      querystring: z.object({
        since: z.string().optional().describe('ISO timestamp or milliseconds')
      }),
      security: [{ bearerAuth: [] }],
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            periods: z.array(periodSchema.extend({
              createdBy: z.string(),
              updatedAt: z.date()
            })),
            gradeLevels: z.array(gradeLevelSchema.extend({
              createdBy: z.string(),
              updatedAt: z.date()
            })),
            subjects: z.array(subjectSchema.extend({
              createdBy: z.string(),
              updatedAt: z.date()
            })),
            sections: z.array(sectionSchema.extend({
              createdBy: z.string(),
              updatedAt: z.date()
            })),
            students: z.array(studentSchema.extend({
              createdBy: z.string(),
              updatedAt: z.date()
            })),
            exams: z.array(examSchema.extend({
              createdBy: z.string(),
              updatedAt: z.date()
            })),
            scanResults: z.array(scanResultSchema.extend({
              createdBy: z.string(),
              updatedAt: z.date()
            })),
          })
        }),
        400: z.object({
          success: z.boolean(),
          message: z.string()
        })
      }
    }
  }, async (request, reply) => {
    const userEmail = (request.user as any).email;
    const { since } = request.query as { since?: string };

    // Parse 'since' into a Date object if provided
    let sinceDate: Date | undefined;
    if (since) {
      // Handle both numeric strings (ms) and ISO strings
      const numericSince = Number(since);
      sinceDate = !isNaN(numericSince) ? new Date(numericSince) : new Date(since);

      if (isNaN(sinceDate.getTime())) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid "since" parameter format. Use ISO string or milliseconds.'
        } as any);
      }
    }
    console.log(`Fetching sync data for user: ${userEmail}, since: ${sinceDate?.toISOString() || 'N/A'}`);
    const data = await syncService.getSyncData(userEmail, sinceDate);
    console.log(`Fetched sync data for user: ${userEmail}, periods: ${data.periods.length}, gradeLevels: ${data.gradeLevels.length}, subjects: ${data.subjects.length}, sections: ${data.sections.length}, students: ${data.students.length}, exams: ${data.exams.length}, scanResults: ${data.scanResults.length}`);
    return {
      success: true,
      data: data as any
    };
  });
}
