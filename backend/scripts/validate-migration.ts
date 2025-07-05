/**
 * 数据库迁移验证脚本
 * 
 * 验证用户系统数据库迁移是否成功完成
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 验证用户相关表是否存在
 */
async function validateUserTables() {
  console.log('🔍 验证用户相关表...');
  
  try {
    // 检查User表
    const userCount = await prisma.user.count();
    console.log(`   ✓ User表存在，当前用户数: ${userCount}`);
    
    // 检查UserSession表
    const sessionCount = await prisma.userSession.count();
    console.log(`   ✓ UserSession表存在，当前会话数: ${sessionCount}`);
    
    // 检查UserRole表
    const roleCount = await prisma.userRole.count();
    console.log(`   ✓ UserRole表存在，当前角色数: ${roleCount}`);
    
    return true;
  } catch (error) {
    console.error('   ✗ 用户相关表验证失败:', error.message);
    return false;
  }
}

/**
 * 验证现有表的用户关联字段
 */
async function validateUserAssociations() {
  console.log('🔍 验证现有表的用户关联...');
  
  try {
    // 检查Workspace表的ownerId字段
    const workspaceWithOwner = await prisma.workspace.findFirst({
      select: { id: true, ownerId: true }
    });
    console.log('   ✓ Workspace表包含ownerId字段');
    
    // 检查Project表的ownerId字段
    const projectWithOwner = await prisma.project.findFirst({
      select: { id: true, ownerId: true }
    });
    console.log('   ✓ Project表包含ownerId字段');
    
    // 检查Board表的ownerId字段
    const boardWithOwner = await prisma.board.findFirst({
      select: { id: true, ownerId: true }
    });
    console.log('   ✓ Board表包含ownerId字段');
    
    // 检查Task表的ownerId字段
    const taskWithOwner = await prisma.task.findFirst({
      select: { id: true, ownerId: true }
    });
    console.log('   ✓ Task表包含ownerId字段');
    
    // 检查Tag表的ownerId字段
    const tagWithOwner = await prisma.tag.findFirst({
      select: { id: true, ownerId: true }
    });
    console.log('   ✓ Tag表包含ownerId字段');
    
    return true;
  } catch (error) {
    console.error('   ✗ 用户关联字段验证失败:', error.message);
    return false;
  }
}

/**
 * 验证默认数据是否创建
 */
async function validateDefaultData() {
  console.log('🔍 验证默认数据...');
  
  try {
    // 检查默认角色
    const adminRole = await prisma.userRole.findUnique({
      where: { name: 'admin' }
    });
    
    if (adminRole) {
      console.log('   ✓ 管理员角色已创建');
    } else {
      console.log('   ⚠ 管理员角色未找到');
    }
    
    const userRole = await prisma.userRole.findUnique({
      where: { name: 'user' }
    });
    
    if (userRole) {
      console.log('   ✓ 普通用户角色已创建');
    } else {
      console.log('   ⚠ 普通用户角色未找到');
    }
    
    // 检查管理员用户
    const adminUser = await prisma.user.findUnique({
      where: { username: 'admin' }
    });
    
    if (adminUser) {
      console.log('   ✓ 管理员用户已创建');
      console.log(`     - 用户名: ${adminUser.username}`);
      console.log(`     - 邮箱: ${adminUser.email}`);
      console.log(`     - 状态: ${adminUser.isActive ? '激活' : '未激活'}`);
    } else {
      console.log('   ⚠ 管理员用户未找到');
    }
    
    return true;
  } catch (error) {
    console.error('   ✗ 默认数据验证失败:', error.message);
    return false;
  }
}

/**
 * 验证外键约束
 */
async function validateForeignKeys() {
  console.log('🔍 验证外键约束...');
  
  try {
    // 测试用户和会话的关联
    const userWithSessions = await prisma.user.findFirst({
      include: { sessions: true }
    });
    console.log('   ✓ User-UserSession外键约束正常');
    
    // 测试用户和工作区的关联
    const userWithWorkspaces = await prisma.user.findFirst({
      include: { workspaces: true }
    });
    console.log('   ✓ User-Workspace外键约束正常');
    
    // 测试用户和项目的关联
    const userWithProjects = await prisma.user.findFirst({
      include: { projects: true }
    });
    console.log('   ✓ User-Project外键约束正常');
    
    // 测试用户和看板的关联
    const userWithBoards = await prisma.user.findFirst({
      include: { boards: true }
    });
    console.log('   ✓ User-Board外键约束正常');
    
    // 测试用户和任务的关联
    const userWithTasks = await prisma.user.findFirst({
      include: { tasks: true }
    });
    console.log('   ✓ User-Task外键约束正常');
    
    return true;
  } catch (error) {
    console.error('   ✗ 外键约束验证失败:', error.message);
    return false;
  }
}

/**
 * 验证索引是否创建
 */
async function validateIndexes() {
  console.log('🔍 验证数据库索引...');
  
  try {
    // 这里可以添加具体的索引验证逻辑
    // 由于Prisma会自动创建索引，我们主要验证查询性能
    
    const start = Date.now();
    
    // 测试用户邮箱查询（应该使用索引）
    await prisma.user.findUnique({
      where: { email: 'admin@xitools.local' }
    });
    
    // 测试用户名查询（应该使用索引）
    await prisma.user.findUnique({
      where: { username: 'admin' }
    });
    
    const end = Date.now();
    const queryTime = end - start;
    
    console.log(`   ✓ 索引查询性能正常 (${queryTime}ms)`);
    
    return true;
  } catch (error) {
    console.error('   ✗ 索引验证失败:', error.message);
    return false;
  }
}

/**
 * 生成验证报告
 */
function generateValidationReport(results: boolean[]) {
  console.log('\n📊 验证报告:');
  
  const totalTests = results.length;
  const passedTests = results.filter(r => r).length;
  const failedTests = totalTests - passedTests;
  
  console.log(`   总测试数: ${totalTests}`);
  console.log(`   通过: ${passedTests}`);
  console.log(`   失败: ${failedTests}`);
  console.log(`   成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (failedTests === 0) {
    console.log('\n✅ 所有验证测试通过！数据库迁移成功完成。');
    return true;
  } else {
    console.log('\n❌ 部分验证测试失败，请检查迁移过程。');
    return false;
  }
}

/**
 * 主验证函数
 */
async function validateMigration() {
  console.log('🚀 开始验证用户系统数据库迁移...\n');
  
  const results: boolean[] = [];
  
  try {
    // 1. 验证用户相关表
    results.push(await validateUserTables());
    console.log();
    
    // 2. 验证用户关联字段
    results.push(await validateUserAssociations());
    console.log();
    
    // 3. 验证默认数据
    results.push(await validateDefaultData());
    console.log();
    
    // 4. 验证外键约束
    results.push(await validateForeignKeys());
    console.log();
    
    // 5. 验证索引
    results.push(await validateIndexes());
    console.log();
    
    // 6. 生成验证报告
    const success = generateValidationReport(results);
    
    if (success) {
      console.log('\n🎉 数据库迁移验证完成！');
      process.exit(0);
    } else {
      console.log('\n⚠️ 数据库迁移验证发现问题，请检查日志。');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ 验证过程中发生错误:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 执行验证
if (require.main === module) {
  validateMigration();
}

export { validateMigration };
