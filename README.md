# GodspeedGrader API

A modern authentication API built with **Fastify**, **Prisma**, and **PostgreSQL**.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (via Docker)

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start PostgreSQL database:**
   ```bash
   docker-compose up -d
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

API available at `http://localhost:3000`

## 📚 API Endpoints

### Authentication
- **POST** `/api/auth/register` - Create new user
- **POST** `/api/auth/login` - Login and get JWT token
- **GET** `/health` - Health check
- **GET** `/docs` - Swagger documentation

### Test Users
```
Email: admin@godspeedgrader.com | Password: Admin2026! | Role: admin
Email: school@godspeedgrader.com | Password: School2026! | Role: school
Email: user@godspeedgrader.com | Password: User2026! | role: user
```

## 🗄️ Database Management

### View Database (Prisma Studio)
```bash
npx prisma studio
```
Opens browser at `http://localhost:5555` - Visual DB explorer

### Add New Table

1. **Edit schema:**
   ```bash
   # Edit prisma/schema.prisma
   model YourTable {
     id    String   @id @default(uuid())
     name  String
     email String   @unique
     createdAt DateTime @default(now()) @map("created_at")
   
     @@map("your_tables")
   }
   ```

2. **Create migration:**
   ```bash
   npx prisma migrate dev --name add_your_table
   ```

3. **Generate types:**
   ```bash
   npx prisma generate
   ```

### Update Existing Table

1. **Modify schema in** `prisma/schema.prisma`

2. **Create migration:**
   ```bash
   npx prisma migrate dev --name update_table_description
   ```

3. **Auto-applies** and generates types

### Delete Table

1. **Remove from schema** in `prisma/schema.prisma`

2. **Create migration:**
   ```bash
   npx prisma migrate dev --name remove_table_name
   ```

### Useful Prisma Commands

```bash
# View pending changes
npx prisma migrate diff

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset

# Deploy migrations to prod
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Format schema
npx prisma format
```

## 📁 Project Structure

```
src/
├── index.ts              # Main server setup
├── lib/
│   └── prisma.ts         # Prisma Client instance
├── routes/
│   └── auth.routes.ts    # Auth endpoints
├── services/
│   └── auth.service.ts   # Auth business logic
└── schemas/
    └── auth.schema.ts    # Zod validation schemas

prisma/
├── schema.prisma         # Database schema
├── seed.ts               # Database seeding
└── migrations/           # Migration history
```

## 🔧 Scripts

```bash
npm run dev      # Start development server with hot-reload
npm run build    # Compile TypeScript to dist/
npm run start    # Run production build
```

## 🔐 Authentication

- **Password Hashing:** Argon2 (industry standard)
- **JWT Token:** 7-day expiration
- **Protected Routes:** Decorator pattern with `@authenticate`

## 📝 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid(),
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,          -- Argon2 hash
  role VARCHAR DEFAULT 'user',        -- user, school, admin
  createdAt TIMESTAMP DEFAULT NOW()
);
```

## 🐛 Troubleshooting

**Database connection fails:**
```bash
docker-compose ps              # Check if containers running
docker-compose up -d           # Restart containers
```

**Migration conflicts:**
```bash
npx prisma migrate reset       # Reset and reseed (DEV ONLY)
```

**Type errors after schema change:**
```bash
npx prisma generate           # Regenerate types
```

## 📖 Environment Variables

Create `.env` file (already created):
```
DATABASE_URL=postgres://jorge_admin:dev_password@localhost:5432/godspeedgrader_dev
PORT=3000
JWT_SECRET=super_secret_godspeedgrader_key_2026_change_me_in_production
```

## 🚢 Deployment Notes

1. Update `JWT_SECRET` in production
2. Use Prisma migrations: `npx prisma migrate deploy`
3. Seed production data as needed
4. Configure PostgreSQL connection string

## 📞 Support

For questions about Prisma, visit: https://www.prisma.io/docs/
For Fastify, visit: https://www.fastify.io/docs/latest/
