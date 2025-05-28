import { fastify } from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifyCors from '@fastify/cors';
import { Server } from 'socket.io';
import { loadConfig } from './config/config';
import { setupMCPService } from './services/mcpService';
import { setupRoutes } from './routes';

// 加载配置
const config = loadConfig();
const server = fastify({ logger: true });

// 注册插件
server.register(fastifyCors, {
  origin: config.cors.allowedOrigins,
  credentials: true
});

server.register(fastifySwagger, {
  routePrefix: '/documentation',
  swagger: {
    info: {
      title: 'XItools API Documentation',
      description: 'API documentation for XItools MCP Service',
      version: '0.1.0'
    },
  },
  exposeRoute: true
});

// 注册路由
server.register(setupRoutes);

// 启动服务器
const start = async () => {
  try {
    const address = await server.listen({ port: config.server.port, host: config.server.host });
    console.log(`服务器运行在 ${address}`);

    // 初始化Socket.IO
    const io = new Server(server.server, {
      cors: {
        origin: config.cors.allowedOrigins,
        credentials: true
      }
    });

    // 设置MCP服务
    setupMCPService(server, io);

  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start(); 