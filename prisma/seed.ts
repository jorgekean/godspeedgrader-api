// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as argon2 from 'argon2';

// Load the environment variables
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed for GodspeedGrader API...');

    // Seed test users
    const testUsers = [
        {
            email: 'admin@godspeedgrader.local',
            password: 'Admin2026!',
            role: 'admin'
        },
        {
            email: 'school@godspeedgrader.local',
            password: 'School2026!',
            role: 'school'
        },
        {
            email: 'user@godspeedgrader.local',
            password: 'User2026!',
            role: 'user'
        }
    ];

    for (const userData of testUsers) {
        const hashedPassword = await argon2.hash(userData.password);

        await prisma.user.upsert({
            where: { email: userData.email },
            update: { password: hashedPassword, role: userData.role },
            create: {
                email: userData.email,
                password: hashedPassword,
                role: userData.role
            }
        });
        console.log(`✅ Seeded User: ${userData.email} (${userData.role})`);
    }

    console.log('🏁 Database seeding completed successfully.');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });