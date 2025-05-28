import { FastifyInstance } from 'fastify';
import healthRoutes from './healthRoutes';

export async function setupRoutes(fastify: FastifyInstance): Promise<void> {
  // 注册健康检查路由
  fastify.register(healthRoutes, { prefix: '/health' });
  
  // 未来可在此处添加其他路由
  
  // 添加根路径响应
  fastify.get('/', async () => {
    return { status: 'ok', message: 'XItools MCP服务正在运行' };
  });
} 