/**
 * XItools 用户系统数据库迁移脚本
 * 
 * 此脚本用于在Docker环境下执行用户系统的数据库迁移
 * 包括：
 * 1. 执行Prisma数据库迁移
 * 2. 初始化用户系统数据
 * 3. 验证迁移结果
 */

const { execSync } = require('child_process');
const path = require('path');

// 配置
const BACKEND_DIR = path.join(__dirname, '../backend');
const DOCKER_COMPOSE_FILE = 'docker-compose.dev.yml';

/**
 * 执行命令并输出结果
 */
function executeCommand(command, options = {}) {
  console.log(`🔧 执行命令: ${command}`);
  try {
    const result = execSync(command, {
      stdio: 'inherit',
      cwd: options.cwd || process.cwd(),
      ...options
    });
    return result;
  } catch (error) {
    console.error(`❌ 命令执行失败: ${command}`);
    console.error(error.message);
    throw error;
  }
}

/**
 * 检查Docker服务状态
 */
function checkDockerServices() {
  console.log('🐳 检查Docker服务状态...');
  
  try {
    executeCommand(`docker-compose -f ${DOCKER_COMPOSE_FILE} ps`);
    console.log('✅ Docker服务状态检查完成');
  } catch (error) {
    console.error('❌ Docker服务检查失败，请确保Docker服务正在运行');
    throw error;
  }
}

/**
 * 等待数据库服务就绪
 */
function waitForDatabase() {
  console.log('⏳ 等待数据库服务就绪...');
  
  const maxRetries = 30;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      executeCommand(
        `docker-compose -f ${DOCKER_COMPOSE_FILE} exec -T postgres pg_isready -U postgres`,
        { stdio: 'pipe' }
      );
      console.log('✅ 数据库服务已就绪');
      return;
    } catch (error) {
      retries++;
      console.log(`⏳ 等待数据库就绪... (${retries}/${maxRetries})`);
      
      if (retries >= maxRetries) {
        console.error('❌ 数据库服务启动超时');
        throw new Error('数据库服务启动超时');
      }
      
      // 等待2秒后重试
      execSync('sleep 2', { stdio: 'pipe' });
    }
  }
}

/**
 * 安装后端依赖
 */
function installBackendDependencies() {
  console.log('📦 安装后端依赖...');
  
  try {
    executeCommand(
      `docker-compose -f ${DOCKER_COMPOSE_FILE} exec -T backend npm install`,
      { stdio: 'inherit' }
    );
    console.log('✅ 后端依赖安装完成');
  } catch (error) {
    console.error('❌ 后端依赖安装失败');
    throw error;
  }
}

/**
 * 生成Prisma客户端
 */
function generatePrismaClient() {
  console.log('🔧 生成Prisma客户端...');
  
  try {
    executeCommand(
      `docker-compose -f ${DOCKER_COMPOSE_FILE} exec -T backend npm run prisma:generate`
    );
    console.log('✅ Prisma客户端生成完成');
  } catch (error) {
    console.error('❌ Prisma客户端生成失败');
    throw error;
  }
}

/**
 * 执行数据库迁移
 */
function runDatabaseMigration() {
  console.log('🗄️ 执行数据库迁移...');
  
  try {
    executeCommand(
      `docker-compose -f ${DOCKER_COMPOSE_FILE} exec -T backend npm run prisma:migrate:user-system`
    );
    console.log('✅ 数据库迁移完成');
  } catch (error) {
    console.error('❌ 数据库迁移失败');
    throw error;
  }
}

/**
 * 初始化用户系统
 */
function initializeUserSystem() {
  console.log('👤 初始化用户系统...');
  
  try {
    executeCommand(
      `docker-compose -f ${DOCKER_COMPOSE_FILE} exec -T backend npm run user:init`
    );
    console.log('✅ 用户系统初始化完成');
  } catch (error) {
    console.error('❌ 用户系统初始化失败');
    throw error;
  }
}

/**
 * 验证迁移结果
 */
function validateMigration() {
  console.log('🔍 验证迁移结果...');
  
  try {
    // 检查用户表是否存在
    executeCommand(
      `docker-compose -f ${DOCKER_COMPOSE_FILE} exec -T postgres psql -U postgres -d xitools -c "\\dt" | grep -E "(User|UserSession|UserRole)"`,
      { stdio: 'pipe' }
    );
    
    console.log('✅ 用户相关表创建成功');
    
    // 检查现有表是否添加了ownerId字段
    executeCommand(
      `docker-compose -f ${DOCKER_COMPOSE_FILE} exec -T postgres psql -U postgres -d xitools -c "\\d Workspace" | grep ownerId`,
      { stdio: 'pipe' }
    );
    
    console.log('✅ 现有表用户关联字段添加成功');
    console.log('✅ 数据库迁移验证完成');
  } catch (error) {
    console.error('❌ 迁移验证失败');
    throw error;
  }
}

/**
 * 重启后端服务以应用更改
 */
function restartBackendService() {
  console.log('🔄 重启后端服务...');
  
  try {
    executeCommand(`docker-compose -f ${DOCKER_COMPOSE_FILE} restart backend`);
    console.log('✅ 后端服务重启完成');
  } catch (error) {
    console.error('❌ 后端服务重启失败');
    throw error;
  }
}

/**
 * 显示迁移完成信息
 */
function showCompletionInfo() {
  console.log('\n🎉 用户系统数据库迁移完成！\n');
  
  console.log('📋 迁移摘要:');
  console.log('   ✅ 用户相关数据表已创建');
  console.log('   ✅ 现有表已添加用户关联');
  console.log('   ✅ 默认用户角色已创建');
  console.log('   ✅ 系统管理员用户已创建');
  console.log('   ✅ 后端服务已重启');
  
  console.log('\n🔑 默认管理员账户:');
  console.log('   用户名: admin');
  console.log('   邮箱: admin@xitools.local');
  console.log('   密码: admin123');
  console.log('   ⚠️  请及时修改默认密码！');
  
  console.log('\n🌐 访问地址:');
  console.log('   前端应用: http://localhost:5173');
  console.log('   后端API: http://localhost:3000');
  console.log('   nginx代理: http://localhost:8080');
  console.log('   API文档: http://localhost:3000/documentation');
  
  console.log('\n📚 下一步:');
  console.log('   1. 开发用户认证服务');
  console.log('   2. 实现前端登录界面');
  console.log('   3. 测试用户注册和登录功能');
}

/**
 * 主迁移函数
 */
async function main() {
  console.log('🚀 开始XItools用户系统数据库迁移...\n');
  
  try {
    // 1. 检查Docker服务
    checkDockerServices();
    
    // 2. 等待数据库就绪
    waitForDatabase();
    
    // 3. 安装后端依赖
    installBackendDependencies();
    
    // 4. 生成Prisma客户端
    generatePrismaClient();
    
    // 5. 执行数据库迁移
    runDatabaseMigration();
    
    // 6. 初始化用户系统
    initializeUserSystem();
    
    // 7. 验证迁移结果
    validateMigration();
    
    // 8. 重启后端服务
    restartBackendService();
    
    // 9. 显示完成信息
    showCompletionInfo();
    
  } catch (error) {
    console.error('\n❌ 用户系统迁移失败:', error.message);
    console.error('\n🔧 故障排除建议:');
    console.error('   1. 检查Docker服务是否正常运行');
    console.error('   2. 检查数据库连接是否正常');
    console.error('   3. 检查后端服务日志: npm run docker:logs:dev');
    console.error('   4. 如需重试，请先清理: npm run user:cleanup');
    
    process.exit(1);
  }
}

// 执行迁移
if (require.main === module) {
  main();
}
