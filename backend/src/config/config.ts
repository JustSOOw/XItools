import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface ServerConfig {
  port: number;
  host: string;
}

export interface DatabaseConfig {
  url: string;
}

export interface CorsConfig {
  allowedOrigins: string | string[];
}

export interface Config {
  server: ServerConfig;
  database: DatabaseConfig;
  cors: CorsConfig;
}

// 加载配置
export function loadConfig(): Config {
  return {
    server: {
      port: parseInt(process.env.PORT || '3000', 10),
      host: process.env.HOST || '0.0.0.0'
    },
    database: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/xitools'
    },
    cors: {
      allowedOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173']
    }
  };
} 