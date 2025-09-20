// /api/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// This ensures there is only one instance of Prisma Client in your application.
const prisma = new PrismaClient();

export default prisma;