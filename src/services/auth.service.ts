// src/services/auth.service.ts
import { prisma } from '../lib/prisma.js';
import * as argon2 from 'argon2';
import { z } from 'zod';
import { registerSchema } from '../schemas/auth.schema.js';

type RegisterInput = z.infer<typeof registerSchema>;

export class AuthService {

    static async registerUser(data: RegisterInput) {
        // 1. Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            throw new Error("Email already registered");
        }

        // 2. Hash the password using Argon2
        const hashedPassword = await argon2.hash(data.password);

        // 3. Create the user
        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                role: data.role || 'user'
            }
        });

        // 4. Return user WITHOUT the password
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    // Login with email and password
    static async verifyLogin(email: string, plainPassword: string) {
        // 1. Find user by email
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) return null;

        // 2. Verify the plain text password against the Argon2 hash
        const isValid = await argon2.verify(user.password, plainPassword);
        if (!isValid) return null;

        // 3. Return user WITHOUT the password
        const { password, ...userData } = user;
        return userData;
    }
}