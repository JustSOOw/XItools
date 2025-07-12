/**
 * JWT工具函数
 *
 * 提供JWT token的生成、验证、刷新等功能
 */

import jwt from 'jsonwebtoken';

// JWT配置
const JWT_SECRET = process.env.JWT_SECRET || 'xitools-default-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

import { JWTPayload } from '../types/userTypes';

/**
 * JWT刷新载荷接口
 */
export interface JWTRefreshPayload {
  userId: string;
  tokenId: string;
  iat?: number;
  exp?: number;
}

/**
 * 生成访问token
 */
export function generateJWT(payload: {
  userId: string;
  username: string;
  email?: string;
  sessionId?: string;
}): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'xitools',
    audience: 'xitools-users',
  });
}

/**
 * 生成刷新token
 */
export function generateRefreshToken(payload: Omit<JWTRefreshPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'xitools',
    audience: 'xitools-refresh',
  });
}

/**
 * 验证访问token
 */
export function verifyJWT(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'xitools',
      audience: 'xitools-users',
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token已过期');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Token无效');
    } else {
      throw new Error('Token验证失败');
    }
  }
}

/**
 * 验证刷新token
 */
export function verifyRefreshToken(token: string): JWTRefreshPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'xitools',
      audience: 'xitools-refresh',
    }) as JWTRefreshPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('刷新Token已过期');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('刷新Token无效');
    } else {
      throw new Error('刷新Token验证失败');
    }
  }
}

/**
 * 解码token（不验证签名）
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Token解码失败:', error);
    return null;
  }
}

/**
 * 检查token是否即将过期（剩余时间少于指定分钟数）
 */
export function isTokenExpiringSoon(token: string, minutesThreshold: number = 30): boolean {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - now;
    const thresholdSeconds = minutesThreshold * 60;

    return timeUntilExpiry <= thresholdSeconds;
  } catch (error) {
    return true;
  }
}

/**
 * 获取token剩余有效时间（秒）
 */
export function getTokenRemainingTime(token: string): number {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) {
      return 0;
    }

    const now = Math.floor(Date.now() / 1000);
    const remainingTime = decoded.exp - now;

    return Math.max(0, remainingTime);
  } catch (error) {
    return 0;
  }
}

/**
 * 从请求头中提取Bearer token
 */
export function extractBearerToken(authHeader?: string): string | null {
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
 * 生成token对（访问token + 刷新token）
 */
export function generateTokenPair(
  userId: string,
  username: string,
  sessionId: string,
): {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
} {
  const accessToken = generateJWT({ userId, username });
  const refreshToken = generateRefreshToken({ userId, tokenId: sessionId });

  // 计算访问token的过期时间（秒）
  const expiresIn = getTokenExpirationTime(JWT_EXPIRES_IN);

  return {
    accessToken,
    refreshToken,
    expiresIn,
  };
}

/**
 * 将时间字符串转换为秒数
 */
function getTokenExpirationTime(expiresIn: string): number {
  // 简单的时间解析，支持 '7d', '24h', '60m', '3600s' 格式
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  if (!match) {
    return 7 * 24 * 60 * 60; // 默认7天
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 'd':
      return value * 24 * 60 * 60;
    case 'h':
      return value * 60 * 60;
    case 'm':
      return value * 60;
    case 's':
      return value;
    default:
      return 7 * 24 * 60 * 60;
  }
}
