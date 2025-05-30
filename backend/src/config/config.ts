import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 在ESM模块中创建__dirname等价物
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

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