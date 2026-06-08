// src/index.ts
import Fastify, { type FastifyReply, type FastifyRequest, type FastifyError } from 'fastify';
import cors from '@fastify/cors';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastifyJwt from '@fastify/jwt';

// Import routes
import { authRoutes } from './routes/auth.routes.js';
import { syncRoutes } from './routes/sync.routes.js';

// Match Vite behavior: Load .env.development if it exists, otherwise fall back to .env
const devEnvPath = path.resolve(process.cwd(), '.env.development');
if (fs.existsSync(devEnvPath)) {
    dotenv.config({ path: devEnvPath, override: true });
} else {
    dotenv.config({ override: true });
}

// 1. Tell TypeScript about our custom decorator
declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}

const fastify = Fastify({
    logger: {
        level: 'info',
        transport: {
            targets: [
                {
                    target: 'pino/file',
                    options: { destination: './logs/app.log', mkdir: true },
                    level: 'info'
                },
                {
                    target: 'pino-pretty',
                    options: { colorize: true },
                    level: 'info'
                }
            ]
        }
    }
});

// 2. Setup Zod Compilers for Fastify
fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

// 3. Register Plugins
fastify.register(cors, {
    origin: ['http://localhost:5173', 'https://localhost:5173', 'http://localhost:3000', 'https://localhost:3000', "https://godspeedgrader.com", "https://www.godspeedgrader.com"],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
});

fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'super_secret_godspeedgrader_key_2026_change_me'
});

// 4. Create the global authentication decorator
fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    try {
        await request.jwtVerify();
    } catch (err) {
        return reply.status(401).send({ message: "Unauthorized: Invalid or missing token." });
    }
});

// --- GLOBAL ERROR HANDLER ---
fastify.setErrorHandler((error: FastifyError, request, reply) => {
    // Log the error
    request.log.error(error);

    // If it's a validation error (Zod), Fastify handles it with a 400 status by default, 
    // but we can customize it here if needed.
    if (error.validation) {
        return reply.status(400).send({
            success: false,
            message: 'Validation failed',
            errors: error.validation
        });
    }

    // Default error response
    const statusCode = error.statusCode || 500;
    const isClientError = statusCode >= 400 && statusCode < 500;

    return reply.status(statusCode).send({
        success: false,
        message: isClientError ? error.message : 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

// 5. Swagger Documentation Setup
fastify.register(fastifySwagger, {
    openapi: {
        info: {
            title: 'GodspeedGrader API',
            description: 'Interactive API documentation for GodspeedGrader backend',
            version: '1.0.0'
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    transform: jsonSchemaTransform
});

fastify.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
        docExpansion: 'list',
        deepLinking: false
    }
});

// --- PUBLIC ROUTES ---
fastify.get('/health', async () => {
    return { status: 'GodspeedGrader API Active', timestamp: new Date() };
});

fastify.register(authRoutes, { prefix: '/api/auth' });

// --- PROTECTED ROUTES PLACEHOLDER ---
// Add protected routes here as you build the API
fastify.register(async function protectedRoutes(childServer) {
    childServer.addHook('onRequest', childServer.authenticate);

    // Add protected route groups here
    childServer.register(syncRoutes, { prefix: '/sync' });
}, { prefix: '/api' });

// 6. Start the Server
const start = async () => {
    try {
        const port = Number(process.env.PORT) || 3000;
        await fastify.listen({ port, host: '0.0.0.0' });
        console.log(`🚀 GodspeedGrader API running at http://localhost:${port}`);
        console.log(`📚 API Docs available at http://localhost:${port}/docs`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();