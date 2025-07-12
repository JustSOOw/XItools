import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface ServerConfig {
  port: number;
  host: string;
  nodeEnv: string;
  trustProxy: boolean;
}

export interface DatabaseConfig {
  url: string;
}

export interface CorsConfig {
  allowedOrigins: string | string[];
}

export interface LogConfig {
  level: string;
  debugMode: boolean;
}

export interface Config {
  server: ServerConfig;
  database: DatabaseConfig;
  cors: CorsConfig;
  log: LogConfig;
}

// 加载配置
export function loadConfig(): Config {
  const nodeEnv = process.env.NODE_ENV || 'development';

  return {
    server: {
      port: parseInt(process.env.PORT || '3000', 10),
      host: process.env.HOST || '0.0.0.0',
      nodeEnv,
      trustProxy: process.env.TRUST_PROXY === 'true',
    },
    database: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/xitools',
    },
    cors: {
      allowedOrigins: process.env.CORS_ORIGINS?.split(',') || [
        'http://localhost:3000',
        'http://localhost:5173',
      ],
    },
    log: {
      level: process.env.LOG_LEVEL || 'info',
      debugMode: process.env.DEBUG_MODE === 'true',
    },
  };
}

// 获取当前环境
export function getCurrentEnvironment(): string {
  return process.env.NODE_ENV || 'development';
}

// 检查是否为开发环境
export function isDevelopment(): boolean {
  return getCurrentEnvironment() === 'development';
}

// 检查是否为生产环境
export function isProduction(): boolean {
  return getCurrentEnvironment() === 'production';
}
