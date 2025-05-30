import { FastifyInstance } from 'fastify';
import healthRoutes from './healthRoutes';
import { PrismaClient } from '../generated/prisma';

// 初始化Prisma客户端
const prisma = new PrismaClient();

export async function setupRoutes(fastify: FastifyInstance): Promise<void> {
  // 注册健康检查路由
  fastify.register(healthRoutes, { prefix: '/health' });
  
  // 未来可在此处添加其他路由
  
  // 添加根路径响应
  fastify.get('/', async () => {
    return { status: 'ok', message: 'XItools MCP服务正在运行' };
  });

  // 添加直接API端点来处理任务列表请求
  fastify.post('/api/tasks/list', async (request, reply) => {
    try {
      // 设置响应头
      reply.header('Content-Type', 'application/json');
      
      console.log('接收到直接API任务列表请求:', request.body);
      
      // 获取过滤选项
      const filterOptions = request.body ? (request.body as any).filter_options || {} : {};
      
      // 构建查询条件
      const where: any = {};

      if (filterOptions) {
        if (filterOptions.status) {
          where.status = filterOptions.status;
        }
        if (filterOptions.priority) {
          where.priority = filterOptions.priority;
        }
        if (filterOptions.assignee) {
          where.assignee = filterOptions.assignee;
        }
        if (filterOptions.tags && filterOptions.tags.length > 0) {
          where.tags = {
            some: {
              name: {
                in: filterOptions.tags
              }
            }
          };
        }
      }

      // 查询数据库
      const tasks = await prisma.task.findMany({
        where,
        include: {
          tags: true,
        },
        orderBy: { createdAt: 'desc' }
      });
      
      console.log(`直接API返回 ${tasks.length} 个任务`);
      return { success: true, data: tasks };
    } catch (error) {
      console.error('获取任务列表失败:', error);
      reply.status(500);
      return { success: false, error: '获取任务列表失败' };
    }
  });
} 