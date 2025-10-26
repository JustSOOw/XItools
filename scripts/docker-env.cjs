#!/usr/bin/env node

/**
 * XItools Docker环境管理脚本
 * 用于管理开发和生产环境的Docker容器
 * 
 * 使用方法:
 * node scripts/docker-env.cjs <command> <environment> [options]
 * 
 * 命令:
 * - start: 启动环境
 * - stop: 停止环境
 * - restart: 重启环境
 * - status: 查看状态
 * - logs: 查看日志
 * 
 * 环境:
 * - development: 开发环境
 * - production: 生产环境
 * 
 * 选项:
 * - --build: 重新构建镜像
 * - --detached: 后台运行
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 颜色输出工具
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function info(message) {
  colorLog('blue', `ℹ ${message}`);
}

function success(message) {
  colorLog('green', `✅ ${message}`);
}

function warning(message) {
  colorLog('yellow', `⚠️ ${message}`);
}

function error(message) {
  colorLog('red', `❌ ${message}`);
}

// 获取Docker Compose文件路径
function getComposeFile(environment) {
  const composeFiles = {
    development: 'docker-compose.dev.yml',
    production: 'docker-compose.prod.yml'
  };
  
  const file = composeFiles[environment];
  if (!file) {
    throw new Error(`不支持的环境: ${environment}`);
  }
  
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Docker Compose文件不存在: ${filePath}`);
  }
  
  return filePath;
}

// 获取Docker Compose命令（兼容V1和V2）
function getDockerComposeCmd() {
  try {
    execSync('docker-compose --version', { stdio: 'pipe' });
    return 'docker-compose';
  } catch {
    try {
      execSync('docker compose version', { stdio: 'pipe' });
      return 'docker compose';
    } catch {
      return null;
    }
  }
}

// 执行Docker Compose命令
function runDockerCompose(composeFile, command, options = {}) {
  const { detached = false, build = false, service = '' } = options;

  const dockerComposeCmd = getDockerComposeCmd();
  if (!dockerComposeCmd) {
    error('Docker Compose未找到');
    process.exit(1);
  }

  let cmd = `${dockerComposeCmd} -f ${composeFile}`;

  if (command === 'up') {
    cmd += ` up`;
    if (build) cmd += ` --build`;
    if (detached) cmd += ` -d`;
  } else if (command === 'down') {
    cmd += ` down`;
  } else if (command === 'restart') {
    cmd += ` restart`;
    if (service) cmd += ` ${service}`;
  } else if (command === 'ps') {
    cmd += ` ps`;
  } else if (command === 'logs') {
    cmd += ` logs`;
    if (service) cmd += ` ${service}`;
    else cmd += ` -f`;
  } else {
    cmd += ` ${command}`;
  }

  info(`执行命令: ${cmd}`);

  try {
    const result = execSync(cmd, {
      stdio: 'inherit',
      cwd: process.cwd(),
      encoding: 'utf8'
    });
    return result;
  } catch (err) {
    error(`命令执行失败: ${err.message}`);
    process.exit(1);
  }
}

// 检查Docker是否运行
function checkDocker() {
  try {
    execSync('docker --version', { stdio: 'pipe' });
  } catch (err) {
    error('Docker未安装或未运行');
    error('请确保Docker服务正在运行');
    process.exit(1);
  }

  const dockerComposeCmd = getDockerComposeCmd();
  if (!dockerComposeCmd) {
    error('Docker Compose未安装');
    error('请安装Docker Compose V1或V2');
    process.exit(1);
  }
}

// 检查环境文件
function checkEnvFiles(environment) {
  const envFiles = {
    development: ['backend/.env.development'],
    production: ['.env.production']
  };
  
  const files = envFiles[environment] || [];
  const missingFiles = files.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length > 0) {
    warning(`缺少环境配置文件:`);
    missingFiles.forEach(file => {
      warning(`  - ${file}`);
      const exampleFile = `${file}.example`;
      if (fs.existsSync(exampleFile)) {
        info(`  可以复制示例文件: cp ${exampleFile} ${file}`);
      }
    });
  }
}

// 主要命令处理函数
function handleStart(environment, options) {
  info(`启动${environment === 'development' ? '开发' : '生产'}环境...`);
  
  checkDocker();
  checkEnvFiles(environment);
  
  const composeFile = getComposeFile(environment);
  runDockerCompose(composeFile, 'up', options);
  
  success(`${environment === 'development' ? '开发' : '生产'}环境启动完成!`);
  
  if (environment === 'development') {
    info('访问地址:');
    info('  前端应用: http://localhost:5173');
    info('  后端API: http://localhost:3000');
    info('  Nginx代理: http://localhost:8080');
    info('  API文档: http://localhost:3000/documentation');
  } else {
    info('访问地址:');
    info('  应用入口: http://localhost');
    info('  后端API: http://localhost/api');
  }
}

function handleStop(environment) {
  info(`停止${environment === 'development' ? '开发' : '生产'}环境...`);
  
  const composeFile = getComposeFile(environment);
  runDockerCompose(composeFile, 'down');
  
  success(`${environment === 'development' ? '开发' : '生产'}环境已停止`);
}

function handleRestart(environment) {
  info(`重启${environment === 'development' ? '开发' : '生产'}环境...`);
  
  const composeFile = getComposeFile(environment);
  runDockerCompose(composeFile, 'restart');
  
  success(`${environment === 'development' ? '开发' : '生产'}环境已重启`);
}

function handleStatus(environment) {
  info(`查看${environment === 'development' ? '开发' : '生产'}环境状态...`);
  
  const composeFile = getComposeFile(environment);
  runDockerCompose(composeFile, 'ps');
}

function handleLogs(environment) {
  info(`查看${environment === 'development' ? '开发' : '生产'}环境日志...`);
  
  const composeFile = getComposeFile(environment);
  runDockerCompose(composeFile, 'logs');
}

// 显示帮助信息
function showHelp() {
  console.log(`
XItools Docker环境管理脚本

使用方法:
  node scripts/docker-env.cjs <command> <environment> [options]

命令:
  start       启动环境
  stop        停止环境
  restart     重启环境
  status      查看状态
  logs        查看日志

环境:
  development 开发环境
  production  生产环境

选项:
  --build     重新构建镜像
  --detached  后台运行

示例:
  node scripts/docker-env.cjs start development --build --detached
  node scripts/docker-env.cjs stop production
  node scripts/docker-env.cjs logs development
  `);
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    showHelp();
    process.exit(1);
  }
  
  const [command, environment] = args;
  const options = {
    build: args.includes('--build'),
    detached: args.includes('--detached')
  };
  
  if (!['development', 'production'].includes(environment)) {
    error(`不支持的环境: ${environment}`);
    showHelp();
    process.exit(1);
  }
  
  try {
    switch (command) {
      case 'start':
        handleStart(environment, options);
        break;
      case 'stop':
        handleStop(environment);
        break;
      case 'restart':
        handleRestart(environment);
        break;
      case 'status':
        handleStatus(environment);
        break;
      case 'logs':
        handleLogs(environment);
        break;
      default:
        error(`不支持的命令: ${command}`);
        showHelp();
        process.exit(1);
    }
  } catch (err) {
    error(`执行失败: ${err.message}`);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  handleStart,
  handleStop,
  handleRestart,
  handleStatus,
  handleLogs
};
