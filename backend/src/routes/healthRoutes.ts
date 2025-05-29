import { FastifyInstance } from 'fastify';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export default async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  // 简单健康检查端点
  fastify.get('/', async () => {
    return { status: 'ok', message: '服务运行正常' };
  });

  // 数据库连接检查
  fastify.get('/db', async () => {
    try {
      // 尝试执行一个简单的数据库查询
      await prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', message: '数据库连接正常' };
    } catch (error) {
      console.error('数据库连接检查失败', error);
      return { status: 'error', message: '数据库连接失败', error: String(error) };
    }
  });
} 