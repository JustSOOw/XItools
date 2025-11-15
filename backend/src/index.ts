import { fastify } from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifyCors from '@fastify/cors';
import { Server } from 'socket.io';
import { loadConfig } from './config/config';
import { setupRoutes } from './routes';
// import { setupMCPService } from './services/mcpService'; // 已废弃非认证MCP服务
import { setupAuthenticatedMCPService } from './services/authenticatedMcpService';
import { apiKeyExpirationManager } from './services/apiKeyExpirationManager';
import { invitationExpirationManager } from './services/invitationExpirationManager';

// 扩展FastifyInstance类型以包含io属性
declare module 'fastify' {
  interface FastifyInstance {
    io?: Server;
  }
}

// 加载配置
const config = loadConfig();
const server = fastify({
  logger: true,
  // 移除请求体大小限制，支持任意大小的头像上传
  bodyLimit: 1024 * 1024 * 1024, // 1GB，实际上相当于无限制
  // 确保正确处理JSON请求
  ajv: {
    customOptions: {
      removeAdditional: false,
      useDefaults: true,
      coerceTypes: 'array',
    },
  },
});

// 注册插件
server.register(fastifyCors, {
  origin: config.cors.allowedOrigins,
  credentials: true,
});

server.register(fastifySwagger, {
  swagger: {
    info: {
      title: 'XItools API Documentation',
      description: 'API documentation for XItools MCP Service',
      version: '0.1.0',
    },
  },
});

// 注册路由
server.register(setupRoutes);

// 启动服务器
const start = async () => {
  try {
    // 初始化Socket.IO
    const io = new Server(server.server, {
      cors: {
        origin: config.cors.allowedOrigins,
        credentials: true,
      },
    });

    // 将io实例附加到server上，以便在路由中使用
    server.io = io;

    // 设置MCP服务（仅使用API Key认证版本）
    // await setupMCPService(server, io); // 已废弃非认证MCP服务
    await setupAuthenticatedMCPService(server, io);

    // 启动API密钥过期管理器
    apiKeyExpirationManager.start();

    // 启动团队邀请过期管理器
    invitationExpirationManager.start();

    // 启动HTTP服务器
    const address = await server.listen({ port: config.server.port, host: config.server.host });
    console.log(`服务器运行在 ${address}`);
    console.log(`API文档：${address}/documentation`);
    console.log(`MCP认证端点：${address}/api/mcp/:toolName 和 ${address}/mcp-auth`);
    console.log(`Socket.IO端点：${address}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
