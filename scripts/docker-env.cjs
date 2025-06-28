#!/usr/bin/env node

/**
 * Docker环境管理脚本
 * 用于启动、停止和管理Docker化的XItools环境
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 环境类型
const ENVIRONMENTS = {
  development: 'development',
  production: 'production'
};

// Docker Compose文件映射
const COMPOSE_FILES = {
  development: 'docker-compose.dev.yml',
  production: 'docker-compose.prod.yml'
};

// 项目根目录
const PROJECT_ROOT = path.resolve(__dirname, '..');

/**
 * 执行命令并显示输出
 * @param {string} command 要执行的命令
 * @param {object} options 执行选项
 */
function executeCommand(command, options = {}) {
  console.log(`🔧 执行命令: ${command}`);
  try {
    const result = execSync(command, {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
      ...options
    });
    return result;
  } catch (error) {
    console.error(`❌ 命令执行失败: ${error.message}`);
    process.exit(1);
  }
}

/**
 * 检查Docker是否可用
 */
function checkDockerAvailable() {
  try {
    execSync('docker --version', { stdio: 'pipe' });
    execSync('docker-compose --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.error('❌ Docker或Docker Compose未安装或未启动');
    console.error('请确保Docker Desktop正在运行');
    return false;
  }
}

/**
 * 启动Docker环境
 * @param {string} env 环境类型
 * @param {object} options 启动选项
 */
function startEnvironment(env, options = {}) {
  if (!checkDockerAvailable()) {
    process.exit(1);
  }

  const composeFile = COMPOSE_FILES[env];
  const envFile = env === 'production' ? '.env.prod' : null;
  
  console.log(`🚀 启动 ${env} 环境...`);
  
  let command = `docker-compose -f ${composeFile}`;
  
  if (envFile && fs.existsSync(path.join(PROJECT_ROOT, envFile))) {
    command += ` --env-file ${envFile}`;
  }
  
  if (options.build) {
    command += ' up --build';
  } else {
    command += ' up';
  }
  
  if (options.detached) {
    command += ' -d';
  }
  
  executeCommand(command);
  
  if (options.detached) {
    console.log('✅ 环境启动完成！');
    printEnvironmentInfo(env);
    printDockerCommands(env);
  }
}

/**
 * 停止Docker环境
 * @param {string} env 环境类型
 */
function stopEnvironment(env) {
  if (!checkDockerAvailable()) {
    process.exit(1);
  }

  const composeFile = COMPOSE_FILES[env];
  console.log(`🛑 停止 ${env} 环境...`);
  
  executeCommand(`docker-compose -f ${composeFile} down`);
  console.log('✅ 环境已停止');
}

/**
 * 重启Docker环境
 * @param {string} env 环境类型
 */
function restartEnvironment(env) {
  console.log(`🔄 重启 ${env} 环境...`);
  stopEnvironment(env);
  startEnvironment(env, { detached: true, build: true });
}

/**
 * 查看环境状态
 * @param {string} env 环境类型
 */
function statusEnvironment(env) {
  if (!checkDockerAvailable()) {
    process.exit(1);
  }

  const composeFile = COMPOSE_FILES[env];
  console.log(`📊 ${env} 环境状态:`);
  
  executeCommand(`docker-compose -f ${composeFile} ps`);
}

/**
 * 查看环境日志
 * @param {string} env 环境类型
 * @param {string} service 服务名称
 */
function logsEnvironment(env, service = '') {
  if (!checkDockerAvailable()) {
    process.exit(1);
  }

  const composeFile = COMPOSE_FILES[env];
  console.log(`📋 ${env} 环境日志${service ? ` (${service})` : ''}:`);
  
  let command = `docker-compose -f ${composeFile} logs -f`;
  if (service) {
    command += ` ${service}`;
  }
  
  executeCommand(command);
}

/**
 * 打印环境信息
 * @param {string} env 环境类型
 */
function printEnvironmentInfo(env) {
  console.log('\n📋 环境信息:');
  
  if (env === 'development') {
    console.log('  前端地址: http://localhost:5173');
    console.log('  后端地址: http://localhost:3000');
    console.log('  数据库: localhost:5432');
  } else if (env === 'production') {
    console.log('  访问地址: http://localhost (nginx代理)');
    console.log('  后端API: http://localhost/api');
    console.log('  数据库: Docker内部网络');
  }
}

/**
 * 打印常用Docker命令
 * @param {string} env 环境类型
 */
function printDockerCommands(env) {
  const composeFile = COMPOSE_FILES[env];
  
  console.log('\n🔧 常用命令:');
  console.log(`  查看状态: npm run docker:status:${env}`);
  console.log(`  查看日志: npm run docker:logs:${env}`);
  console.log(`  停止环境: npm run docker:stop:${env}`);
  console.log(`  重启环境: npm run docker:restart:${env}`);
  console.log(`  直接命令: docker-compose -f ${composeFile} <command>`);
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
🐳 XItools Docker环境管理工具

用法:
  node scripts/docker-env.cjs <action> <environment> [options]

操作:
  start     - 启动环境
  stop      - 停止环境
  restart   - 重启环境
  status    - 查看状态
  logs      - 查看日志

环境:
  development  - 开发环境 (热重载)
  production   - 生产环境 (nginx代理)

选项:
  --build      - 重新构建镜像
  --detached   - 后台运行
  --service    - 指定服务名称 (仅用于logs)

示例:
  node scripts/docker-env.cjs start development --build --detached
  node scripts/docker-env.cjs stop production
  node scripts/docker-env.cjs logs development --service backend
  node scripts/docker-env.cjs status development

注意:
  - 确保Docker Desktop正在运行
  - 开发环境支持代码热重载
  - 生产环境使用nginx反向代理
  `);
}

// 主程序
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    showHelp();
    return;
  }
  
  const action = args[0];
  const env = args[1];
  
  // 解析选项
  const options = {
    build: args.includes('--build'),
    detached: args.includes('--detached'),
    service: args.includes('--service') ? args[args.indexOf('--service') + 1] : ''
  };
  
  if (!env || !Object.values(ENVIRONMENTS).includes(env)) {
    console.error(`❌ 无效的环境类型: ${env}`);
    console.error(`支持的环境: ${Object.values(ENVIRONMENTS).join(', ')}`);
    process.exit(1);
  }
  
  switch (action) {
    case 'start':
      startEnvironment(env, options);
      break;
    case 'stop':
      stopEnvironment(env);
      break;
    case 'restart':
      restartEnvironment(env);
      break;
    case 'status':
      statusEnvironment(env);
      break;
    case 'logs':
      logsEnvironment(env, options.service);
      break;
    default:
      console.error(`❌ 无效的操作: ${action}`);
      console.error('支持的操作: start, stop, restart, status, logs');
      process.exit(1);
  }
}

// 运行主程序
if (require.main === module) {
  main();
}

module.exports = {
  startEnvironment,
  stopEnvironment,
  restartEnvironment,
  statusEnvironment,
  logsEnvironment,
  ENVIRONMENTS
};
