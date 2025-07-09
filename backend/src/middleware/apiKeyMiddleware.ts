/**
 * API密钥认证中间件
 * 
 * 提供MCP服务的API密钥认证功能
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { getApiKeyService } from '../services/apiKeyService';
import {
  ApiKeyError,
  ApiKeyErrorCode,
  ApiKeyPermission,
  McpUserContext
} from '../types/apiKeyTypes';

// 初始化服务
const prisma = new PrismaClient();
const apiKeyService = getApiKeyService(prisma);

/**
 * 从请求头中提取API密钥
 */
export function extractApiKey(authHeader?: string): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * API密钥认证中间件
 */
export async function authenticateApiKey(request: FastifyRequest, reply: FastifyReply) {
  const startTime = Date.now();

  try {
    const apiKey = extractApiKey(request.headers.authorization);
    
    if (!apiKey) {
      return reply.status(401).send({
        success: false,
        error: '缺少认证token',
        code: 'MISSING_API_KEY'
      });
    }
    
    // 验证API密钥
    const validation = await apiKeyService.validateApiKey(apiKey);
    
    if (!validation.isValid) {
      return reply.status(401).send({
        success: false,
        error: validation.error || 'API密钥无效',
        code: 'INVALID_API_KEY'
      });
    }
    
    // 更新API密钥使用记录
    if (validation.apiKeyId) {
      await apiKeyService.updateApiKeyUsage(
        validation.apiKeyId,
        request.ip
      );
    }
    
    // 将MCP用户信息添加到请求上下文
    request.mcpUser = {
      userId: validation.userId!,
      apiKeyId: validation.apiKeyId!,
      permissions: validation.permissions!,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    };
    
  } catch (error) {
    console.error('API密钥认证中间件错误:', error);
    
    // 记录错误日志
    if (request.mcpUser?.apiKeyId) {
      await apiKeyService.logMcpUsage({
        apiKeyId: request.mcpUser.apiKeyId,
        userId: request.mcpUser.userId,
        toolName: 'auth_middleware',
        responseStatus: 500,
        errorMessage: error instanceof Error ? error.message : '认证失败',
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        executionTimeMs: Date.now() - startTime
      });
    }
    
    return reply.status(500).send({
      success: false,
      error: '认证失败',
      code: 'AUTH_ERROR'
    });
  }
}

/**
 * 可选API密钥认证中间件 - 如果有密钥则验证，没有则跳过
 */
export async function optionalApiKeyAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    const apiKey = extractApiKey(request.headers.authorization);
    
    if (apiKey) {
      const validation = await apiKeyService.validateApiKey(apiKey);
      
      if (validation.isValid && validation.apiKeyId) {
        await apiKeyService.updateApiKeyUsage(
          validation.apiKeyId,
          request.ip
        );
        
        request.mcpUser = {
          userId: validation.userId!,
          apiKeyId: validation.apiKeyId!,
          permissions: validation.permissions!,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        };
      }
    }
    
    // 无论是否有token都继续执行
  } catch (error) {
    console.error('可选API密钥认证中间件错误:', error);
    // 忽略错误，继续执行
  }
}

/**
 * 获取当前MCP用户ID的辅助函数
 */
export function getCurrentMcpUserId(request: FastifyRequest): string | null {
  return request.mcpUser?.userId || null;
}

/**
 * 确保MCP用户已认证的辅助函数
 */
export function requireMcpAuth(request: FastifyRequest): McpUserContext {
  if (!request.mcpUser) {
    throw new ApiKeyError(
      ApiKeyErrorCode.INVALID_API_KEY,
      'MCP用户未认证',
      401
    );
  }
  return request.mcpUser;
}

/**
 * 权限验证中间件生成器
 */
export function requirePermissions(...permissions: ApiKeyPermission[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const mcpUser = request.mcpUser;
    
    if (!mcpUser) {
      return reply.status(401).send({
        success: false,
        error: 'MCP用户未认证',
        code: 'UNAUTHENTICATED'
      });
    }
    
    // 检查是否有管理员权限
    if (mcpUser.permissions.includes(ApiKeyPermission.MCP_ADMIN)) {
      return; // 管理员拥有所有权限
    }
    
    // 检查具体权限
    const hasPermission = permissions.every(permission =>
      mcpUser.permissions.includes(permission)
    );
    
    if (!hasPermission) {
      return reply.status(403).send({
        success: false,
        error: `权限不足，需要权限: ${permissions.join(', ')}`,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
  };
}

/**
 * MCP工具调用日志中间件
 */
export function logMcpToolCall(toolName: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const startTime = Date.now();
    const mcpUser = request.mcpUser;

    if (!mcpUser) {
      return; // 如果没有MCP用户信息，则跳过日志记录
    }

    // 将日志记录信息存储在请求对象中，在路由处理完成后记录
    (request as any).mcpLogInfo = {
      startTime,
      toolName,
      mcpUser
    };
  };
}

/**
 * 速率限制配置
 */
export interface RateLimitConfig {
  windowMs: number; // 时间窗口（毫秒）
  max: number; // 最大请求次数
  keyGenerator?: (request: FastifyRequest) => string; // 自定义key生成器
  message?: string; // 自定义错误消息
}

/**
 * 简单的内存速率限制实现
 */
class SimpleRateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  
  constructor(private config: RateLimitConfig) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.requests.get(key);
    
    if (!record || now > record.resetTime) {
      // 新窗口或窗口已过期
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs
      });
      return true;
    }
    
    if (record.count >= this.config.max) {
      return false; // 超出限制
    }
    
    record.count++;
    return true;
  }
  
  // 定期清理过期记录
  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

/**
 * 速率限制中间件
 */
export function createRateLimit(config: RateLimitConfig) {
  const limiter = new SimpleRateLimiter(config);
  
  // 每分钟清理一次过期记录
  setInterval(() => limiter.cleanup(), 60000);
  
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const key = config.keyGenerator 
      ? config.keyGenerator(request)
      : request.mcpUser?.apiKeyId || request.ip;
    
    if (!limiter.isAllowed(key)) {
      return reply.status(429).send({
        success: false,
        error: config.message || '请求过于频繁，请稍后再试',
        code: 'RATE_LIMITED'
      });
    }
  };
}

// 默认的MCP速率限制配置
export const defaultMcpRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000, // 每个API密钥最多1000次请求
  keyGenerator: (request) => request.mcpUser?.apiKeyId || request.ip,
  message: 'MCP API请求过于频繁，请稍后再试'
});