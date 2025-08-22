/**
 * MCP认证和速率限制中间件
 *
 * 为MCP API调用提供API密钥认证、速率限制和使用统计功能
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { Permission } from '../types/userTypes';

const prisma = new PrismaClient();

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
    lastRequest: number;
  };
}

// 内存中的速率限制存储
const rateLimitStore: RateLimitStore = {};

// 速率限制配置
const RATE_LIMIT_CONFIG = {
  // 每分钟请求限制
  requestsPerMinute: 60,
  // 每小时请求限制
  requestsPerHour: 1000,
  // 每天请求限制
  requestsPerDay: 10000,
  // 清理过期数据的间隔（毫秒）
  cleanupInterval: 5 * 60 * 1000, // 5分钟
};

/**
 * 清理过期的速率限制数据
 */
function cleanupExpiredLimits() {
  const now = Date.now();
  for (const key in rateLimitStore) {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  }
}

// 定期清理过期数据
setInterval(cleanupExpiredLimits, RATE_LIMIT_CONFIG.cleanupInterval);

/**
 * 检查速率限制
 */
function checkRateLimit(
  apiKeyId: string,
  window: 'minute' | 'hour' | 'day',
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const key = `${apiKeyId}:${window}`;

  let windowMs: number;
  let limit: number;

  switch (window) {
    case 'minute':
      windowMs = 60 * 1000;
      limit = RATE_LIMIT_CONFIG.requestsPerMinute;
      break;
    case 'hour':
      windowMs = 60 * 60 * 1000;
      limit = RATE_LIMIT_CONFIG.requestsPerHour;
      break;
    case 'day':
      windowMs = 24 * 60 * 60 * 1000;
      limit = RATE_LIMIT_CONFIG.requestsPerDay;
      break;
    default:
      throw new Error(`不支持的时间窗口: ${window}`);
  }

  if (!rateLimitStore[key] || rateLimitStore[key].resetTime <= now) {
    // 初始化或重置计数器
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + windowMs,
      lastRequest: now,
    };
    return {
      allowed: true,
      remaining: limit - 1,
      resetTime: rateLimitStore[key].resetTime,
    };
  }

  // 更新计数器
  rateLimitStore[key].count++;
  rateLimitStore[key].lastRequest = now;

  const remaining = Math.max(0, limit - rateLimitStore[key].count);
  const allowed = rateLimitStore[key].count <= limit;

  return {
    allowed,
    remaining,
    resetTime: rateLimitStore[key].resetTime,
  };
}

/**
 * 提取API密钥
 */
function extractApiKey(authorization?: string): string | null {
  if (!authorization) return null;

  if (authorization.startsWith('Bearer ')) {
    return authorization.slice(7);
  }

  return null;
}
/**
 * 从请求中尽可能鲁棒地提取 API 密钥（开发期增强兼容）
 * 支持以下来源：
 * - Authorization: Bearer <token>
 * - X-Api-Key: <token>
 * - X-Authorization: Bearer <token> 或 <token>
 * - 查询参数：api_key / apikey / token / key
 * 注意：该函数仅用于增强不同 Host/传输下的兼容性，不改变现有 Cursor 的正常用法。
 */
function extractApiKeyFromRequest(request: FastifyRequest): string | null {
  // 1) 标准 Authorization: Bearer ...
  const auth = request.headers.authorization;
  const bearer = extractApiKey(auth || undefined);
  if (bearer) return bearer;

  // 2) 兼容自定义头 X-Api-Key
  const xApiKeyHeader = request.headers['x-api-key'];
  if (typeof xApiKeyHeader === 'string' && xApiKeyHeader) return xApiKeyHeader;

  // 3) 兼容 X-Authorization（可能包含 Bearer 或直接 token）
  const xAuth = request.headers['x-authorization'];
  if (typeof xAuth === 'string' && xAuth) {
    const fromXAuth = extractApiKey(xAuth) || xAuth;
    if (fromXAuth) return fromXAuth;
  }

  // 4) 查询参数（用于某些 Host 在握手/预检阶段不带头部时的兜底）
  try {
    const q = (request.query || {}) as Record<string, any>;
    const qp = q.api_key || q.apikey || q.token || q.key;
    if (typeof qp === 'string' && qp) return qp;
  } catch {}

  return null;
}


/**
 * 记录API使用情况
 */
async function logApiUsage(
  apiKeyId: string,
  userId: string,
  toolName: string,
  responseStatus: number,
  executionTimeMs: number,
  userAgent?: string,
  ipAddress?: string,
  errorMessage?: string,
  requestParams?: any,
): Promise<void> {
  try {
    await prisma.mcpUsageLog.create({
      data: {
        apiKeyId,
        userId,
        toolName,
        requestParams,
        responseStatus,
        errorMessage,
        userAgent: userAgent || 'Unknown',
        ipAddress: ipAddress || 'Unknown',
        executionTimeMs,
      },
    });
  } catch (error) {
    console.error('记录API使用失败:', error);
    // 不抛出错误，避免影响主要功能
  }
}

/**
 * 更新API密钥的最后使用时间
 */
async function updateLastUsed(apiKeyId: string): Promise<void> {
  try {
    await prisma.userApiKey.update({
      where: { id: apiKeyId },
      data: { lastUsedAt: new Date() },
    });
  } catch (error) {
    console.error('更新API密钥最后使用时间失败:', error);
  }
}

/**
 * MCP认证中间件
 */
export async function mcpAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const startTime = Date.now();

  try {
    // 提取API密钥（增强兼容：Authorization / X-Api-Key / X-Authorization / query）
    const apiKey = extractApiKeyFromRequest(request);

    if (!apiKey) {
      await reply.status(401).send({
        success: false,
        error: '缺少API密钥',
        code: 'MISSING_API_KEY',
      });
      return;
    }

    // 验证API密钥格式
    // 预检请求(CORS)直接放行，避免因未携带鉴权头导致Host连接失败（如Cursor的streamable-http预检）
    if (request.method === 'OPTIONS') {
      const origin = (request.headers['origin'] as string) || '*';
      reply
        .header('Access-Control-Allow-Origin', origin)
        .header('Vary', 'Origin')
        .header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        .header(
          'Access-Control-Allow-Headers',
          'Authorization, X-Api-Key, X-Authorization, Content-Type, Accept',
        )
        .header('Access-Control-Max-Age', '600');
      await reply.status(204).send();
      return;
    }

    if (!apiKey.startsWith('xitool_') || apiKey.length !== 71) {
      await reply.status(401).send({
        success: false,
        error: 'API密钥格式无效',
        code: 'INVALID_API_KEY_FORMAT',
      });
      return;
    }

    // 查找API密钥
    const userApiKey = await prisma.userApiKey.findFirst({
      where: {
        apiKey: apiKey,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

    if (!userApiKey) {
      await reply.status(401).send({
        success: false,
        error: 'API密钥无效或已禁用',
        code: 'INVALID_API_KEY',
      });
      return;
    }

    // 检查用户账户状态
    if (!userApiKey.user.isActive) {
      await reply.status(401).send({
        success: false,
        error: '用户账户已禁用',
        code: 'USER_DISABLED',
      });
      return;
    }

    // 检查API密钥是否过期
    if (userApiKey.expiresAt && userApiKey.expiresAt < new Date()) {
      await reply.status(401).send({
        success: false,
        error: 'API密钥已过期',
        code: 'API_KEY_EXPIRED',
      });
      return;
    }

    // 检查权限
    const endpoint = request.url;
    const requiredPermission = endpoint.includes('mcp') ? 'mcp:read' : 'general';

    if (endpoint.includes('POST') || endpoint.includes('PUT') || endpoint.includes('DELETE')) {
      const writePermission = endpoint.includes('mcp') ? 'mcp:write' : 'general:write';
      if (
        !userApiKey.permissions.includes(writePermission) &&
        !userApiKey.permissions.includes('admin')
      ) {
        await reply.status(403).send({
          success: false,
          error: '权限不足，需要写入权限',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
        return;
      }
    } else {
      if (
        !userApiKey.permissions.includes(requiredPermission) &&
        !userApiKey.permissions.includes('admin')
      ) {
        await reply.status(403).send({
          success: false,
          error: '权限不足，需要读取权限',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
        return;
      }
    }

    // 速率限制检查
    const minuteLimit = checkRateLimit(userApiKey.id, 'minute');
    const hourLimit = checkRateLimit(userApiKey.id, 'hour');
    const dayLimit = checkRateLimit(userApiKey.id, 'day');

    // 设置速率限制响应头
    reply.header('X-RateLimit-Limit-Minute', RATE_LIMIT_CONFIG.requestsPerMinute);
    reply.header('X-RateLimit-Remaining-Minute', minuteLimit.remaining);
    reply.header('X-RateLimit-Reset-Minute', Math.ceil(minuteLimit.resetTime / 1000));

    reply.header('X-RateLimit-Limit-Hour', RATE_LIMIT_CONFIG.requestsPerHour);
    reply.header('X-RateLimit-Remaining-Hour', hourLimit.remaining);
    reply.header('X-RateLimit-Reset-Hour', Math.ceil(hourLimit.resetTime / 1000));

    reply.header('X-RateLimit-Limit-Day', RATE_LIMIT_CONFIG.requestsPerDay);
    reply.header('X-RateLimit-Remaining-Day', dayLimit.remaining);
    reply.header('X-RateLimit-Reset-Day', Math.ceil(dayLimit.resetTime / 1000));

    // 检查是否超出限制
    if (!minuteLimit.allowed) {
      await reply.status(429).send({
        success: false,
        error: '每分钟请求次数超出限制',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((minuteLimit.resetTime - Date.now()) / 1000),
      });
      return;
    }

    if (!hourLimit.allowed) {
      await reply.status(429).send({
        success: false,
        error: '每小时请求次数超出限制',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((hourLimit.resetTime - Date.now()) / 1000),
      });
      return;
    }

    if (!dayLimit.allowed) {
      await reply.status(429).send({
        success: false,
        error: '每日请求次数超出限制',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((dayLimit.resetTime - Date.now()) / 1000),
      });
      return;
    }

    // 将用户信息和API密钥信息添加到请求上下文
    request.user = {
      userId: userApiKey.user.id,
      username: userApiKey.user.username,
      email: userApiKey.user.email,
      sessionId: userApiKey.id,
      permissions: userApiKey.permissions as Permission[],
      isActive: userApiKey.user.isActive,
    };

    request.apiKey = {
      id: userApiKey.id,
      name: userApiKey.name,
      permissions: userApiKey.permissions as Permission[],
      keyPrefix: userApiKey.keyPrefix,
    };

    // 异步更新最后使用时间
    updateLastUsed(userApiKey.id).catch(console.error);

    // 记录请求开始时间，用于计算响应时间
    request.requestStartTime = startTime;
  } catch (error) {
    console.error('MCP认证中间件错误:', error);
    await reply.status(500).send({
      success: false,
      error: '认证服务暂时不可用',
      code: 'AUTH_SERVICE_ERROR',
    });
  }
}

/**
 * 记录MCP请求的中间件（在响应后执行）
 * 注意：这个函数需要在路由的onResponse钩子中使用，而不是作为中间件
 */
export async function logMcpRequest(
  request: FastifyRequest,
  reply: FastifyReply,
  toolName: string,
  requestParams?: any,
): Promise<void> {
  if (request.apiKey && request.requestStartTime) {
    const responseTime = Date.now() - request.requestStartTime;
    const userAgent = request.headers['user-agent'];
    const ipAddress = request.ip || (request.headers['x-forwarded-for'] as string) || 'unknown';

    await logApiUsage(
      request.apiKey.id,
      request.user?.userId || 'unknown',
      toolName,
      reply.statusCode,
      responseTime,
      userAgent,
      ipAddress,
      reply.statusCode >= 400 ? `HTTP ${reply.statusCode}` : undefined,
      requestParams,
    );
  }
}

/**
 * 获取速率限制配置
 */
export function getRateLimitConfig() {
  return { ...RATE_LIMIT_CONFIG };
}

/**
 * 获取API密钥的当前速率限制状态
 */
export function getApiKeyRateLimit(apiKeyId: string) {
  const minute = checkRateLimit(apiKeyId, 'minute');
  const hour = checkRateLimit(apiKeyId, 'hour');
  const day = checkRateLimit(apiKeyId, 'day');

  return {
    minute: {
      limit: RATE_LIMIT_CONFIG.requestsPerMinute,
      remaining: minute.remaining,
      resetTime: minute.resetTime,
    },
    hour: {
      limit: RATE_LIMIT_CONFIG.requestsPerHour,
      remaining: hour.remaining,
      resetTime: hour.resetTime,
    },
    day: {
      limit: RATE_LIMIT_CONFIG.requestsPerDay,
      remaining: day.remaining,
      resetTime: day.resetTime,
    },
  };
}

/**
 * 重置API密钥的速率限制（仅限管理员使用）
 */
export function resetApiKeyRateLimit(apiKeyId: string) {
  const keys = Object.keys(rateLimitStore).filter((key) => key.startsWith(`${apiKeyId}:`));
  keys.forEach((key) => delete rateLimitStore[key]);
}

// 扩展FastifyRequest类型
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: string;
      username: string;
      email: string;
      sessionId: string;
      permissions: Permission[];
      isActive: boolean;
    };
    apiKey?: {
      id: string;
      name: string;
      permissions: Permission[];
      keyPrefix: string;
    };
    requestStartTime?: number;
  }
}

export default {
  mcpAuthMiddleware,
  logMcpRequest,
  getRateLimitConfig,
  getApiKeyRateLimit,
  resetApiKeyRateLimit,
};
