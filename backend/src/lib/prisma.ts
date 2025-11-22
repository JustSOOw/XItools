/**
 * 共享的 Prisma Client 实例
 *
 * 用于整个应用程序，避免创建多个 Prisma Client 实例
 * 也方便在测试中进行 mock
 */

import { PrismaClient } from '@prisma/client';

// 创建全局单例 Prisma Client
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
