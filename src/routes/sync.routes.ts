import type { FastifyInstance } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { SyncService } from '../services/sync.service.js';
import { 
  syncBatchSchema, 
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
            sections: z.number().int(),
            students: z.number().int(),
            exams: z.number().int(),
            scanResults: z.number().int(),
          })
        }),
        500: z.object({
          success: z.boolean(),
          message: z.string(),
          error: z.string()
        })
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const data = request.body;

    try {
      const results = await syncService.syncBatch(userId, data);
      return {
        success: true,
        message: 'Sync completed successfully',
        results
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Sync failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
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
        }),
        500: z.object({
          success: z.boolean(),
          message: z.string(),
          error: z.string()
        })
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).id;
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

    try {
      const data = await syncService.getSyncData(userId, sinceDate);
      return {
        success: true,
        data
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch sync data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
