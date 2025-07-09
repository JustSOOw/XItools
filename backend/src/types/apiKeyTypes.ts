/**
 * API密钥管理相关的类型定义
 * 
 * 包含API密钥模型、请求/响应、权限等类型定义
 */

import { z } from 'zod';

// ================================
// API密钥基础类型
// ================================

/**
 * API密钥权限枚举
 */
export enum ApiKeyPermission {
  MCP_READ = 'mcp:read',
  MCP_WRITE = 'mcp:write',
  MCP_ADMIN = 'mcp:admin',
}

/**
 * API密钥基本信息接口
 */
export interface UserApiKey {
  id: string;
  userId: string;
  name: string;
  apiKey: string;
  keyPrefix: string;
  permissions: ApiKeyPermission[];
  lastUsedAt?: Date | null;
  lastUsedIp?: string | null;
  expiresAt?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * MCP使用日志接口
 */
export interface McpUsageLog {
  id: string;
  apiKeyId: string;
  userId: string;
  toolName: string;
  requestParams?: any;
  responseStatus?: number;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  executionTimeMs?: number;
  createdAt: Date;
}

// ================================
// 请求/响应类型
// ================================

/**
 * 创建API密钥请求Schema
 */
export const createApiKeySchema = z.object({
  name: z.string()
    .min(1, 'API密钥名称不能为空')
    .max(100, 'API密钥名称不能超过100个字符'),
  permissions: z.array(z.enum(['mcp:read', 'mcp:write', 'mcp:admin']))
    .min(1, '至少需要选择一个权限')
    .default(['mcp:read', 'mcp:write']),
  expiresAt: z.string().datetime().nullable().optional(),
});

export type CreateApiKeyRequest = z.infer<typeof createApiKeySchema>;

/**
 * API密钥列表响应
 */
export interface ApiKeyListResponse {
  success: true;
  data: ApiKeyInfo[];
}

/**
 * API密钥信息（不包含完整密钥）
 */
export interface ApiKeyInfo {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: ApiKeyPermission[];
  lastUsedAt?: Date | null;
  lastUsedIp?: string | null;
  expiresAt?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 创建API密钥响应
 */
export interface CreateApiKeyResponse {
  success: true;
  data: {
    id: string;
    name: string;
    apiKey: string; // 完整密钥，仅在创建时返回
    keyPrefix: string;
    permissions: ApiKeyPermission[];
    expiresAt?: Date | null;
    createdAt: Date;
  };
}

/**
 * 删除API密钥响应
 */
export interface DeleteApiKeyResponse {
  success: true;
  message: string;
}

/**
 * API密钥使用统计
 */
export interface ApiKeyUsageStats {
  totalRequests: number;
  successRequests: number;
  failedRequests: number;
  lastUsedAt?: Date | null;
  mostUsedTool?: string;
}

// ================================
// MCP认证相关类型
// ================================

/**
 * MCP用户上下文
 */
export interface McpUserContext {
  userId: string;
  apiKeyId: string;
  permissions: ApiKeyPermission[];
  ipAddress?: string;
  userAgent?: string;
}

/**
 * MCP工具调用日志参数
 */
export interface McpLogParams {
  apiKeyId: string;
  userId: string;
  toolName: string;
  requestParams?: any;
  responseStatus?: number;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  executionTimeMs?: number;
}

// ================================
// 扩展Fastify Request类型
// ================================

/**
 * 扩展Fastify Request以包含MCP用户信息
 */
declare module 'fastify' {
  interface FastifyRequest {
    mcpUser?: McpUserContext;
  }
}

// ================================
// 错误类型
// ================================

/**
 * API密钥错误类型
 */
export enum ApiKeyErrorCode {
  INVALID_API_KEY = 'INVALID_API_KEY',
  EXPIRED_API_KEY = 'EXPIRED_API_KEY',
  INACTIVE_API_KEY = 'INACTIVE_API_KEY',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  API_KEY_NOT_FOUND = 'API_KEY_NOT_FOUND',
  DUPLICATE_API_KEY_NAME = 'DUPLICATE_API_KEY_NAME',
  RATE_LIMITED = 'RATE_LIMITED',
}

/**
 * API密钥错误类
 */
export class ApiKeyError extends Error {
  constructor(
    public code: ApiKeyErrorCode,
    message: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'ApiKeyError';
  }
}

// ================================
// 工具函数类型
// ================================

/**
 * API密钥生成选项
 */
export interface ApiKeyGenerateOptions {
  prefix?: string;
  length?: number;
}

/**
 * API密钥验证结果
 */
export interface ApiKeyValidationResult {
  isValid: boolean;
  userId?: string;
  apiKeyId?: string;
  permissions?: ApiKeyPermission[];
  error?: string;
}

// ================================
// 导出所有类型
// ================================

export type {
  UserApiKey,
  McpUsageLog,
  CreateApiKeyRequest,
  ApiKeyListResponse,
  ApiKeyInfo,
  CreateApiKeyResponse,
  DeleteApiKeyResponse,
  ApiKeyUsageStats,
  McpUserContext,
  McpLogParams,
  ApiKeyGenerateOptions,
  ApiKeyValidationResult,
};