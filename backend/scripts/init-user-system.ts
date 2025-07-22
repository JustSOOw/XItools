/**
 * XItools 用户系统初始化脚本
 * 
 * 此脚本用于初始化用户系统的基础数据，包括：
 * 1. 创建默认用户角色
 * 2. 创建系统管理员用户（可选）
 * 3. 验证数据库架构
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * 默认用户角色配置
 */
const DEFAULT_ROLES = [
  {
    name: 'admin',
    displayName: '管理员',
    description: '系统管理员，拥有所有权限',
    permissions: ['*'], // 通配符表示所有权限
    isSystem: true,
  },
  {
    name: 'user',
    displayName: '普通用户',
    description: '普通用户，可以管理自己的数据',
    permissions: [
      'read:own',
      'write:own',
      'delete:own',
      'create:workspace',
      'create:project',
      'create:board',
      'create:task',
    ],
    isSystem: true,
  },
  {
    name: 'viewer',
    displayName: '查看者',
    description: '只读用户，只能查看被分享的数据',
    permissions: ['read:shared'],
    isSystem: true,
  },
];

/**
 * 创建默认用户角色
 */
async function createDefaultRoles() {
  console.log('🔧 创建默认用户角色...');
  
  for (const roleData of DEFAULT_ROLES) {
    try {
      // 检查角色是否已存在
      const existingRole = await prisma.userRole.findUnique({
        where: { name: roleData.name },
      });

      if (existingRole) {
        console.log(`   ✓ 角色 "${roleData.displayName}" 已存在，跳过创建`);
        continue;
      }

      // 创建新角色
      const role = await prisma.userRole.create({
        data: roleData,
      });

      console.log(`   ✓ 创建角色 "${role.displayName}" (${role.name})`);
    } catch (error) {
      console.error(`   ✗ 创建角色 "${roleData.displayName}" 失败:`, error);
      throw error;
    }
  }
}

/**
 * 创建系统管理员用户（可选）
 */
async function createAdminUser() {
  console.log('👤 检查系统管理员用户...');

  // 检查是否已有管理员用户
  const existingAdmin = await prisma.user.findFirst({
    where: { username: 'admin' },
  });

  if (existingAdmin) {
    console.log('   ✓ 系统管理员用户已存在，跳过创建');
    return existingAdmin;
  }

  // 询问是否创建管理员用户
  const shouldCreateAdmin = process.env.CREATE_ADMIN_USER === 'true';
  
  if (!shouldCreateAdmin) {
    console.log('   ℹ 跳过创建系统管理员用户（设置 CREATE_ADMIN_USER=true 来创建）');
    return null;
  }

  // 生成默认密码
  const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  try {
    const adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@xitools.local',
        passwordHash,
        bio: '系统管理员',
        role: 'admin',
        isActive: true,
      },
    });

    console.log('   ✓ 创建系统管理员用户成功');
    console.log(`   📧 邮箱: ${adminUser.email}`);
    console.log(`   🔑 密码: ${defaultPassword}`);
    console.log('   ⚠️  请及时修改默认密码！');

    return adminUser;
  } catch (error) {
    console.error('   ✗ 创建系统管理员用户失败:', error);
    throw error;
  }
}

/**
 * 验证数据库架构
 */
async function validateDatabaseSchema() {
  console.log('🔍 验证数据库架构...');

  try {
    // 检查用户表
    await prisma.user.findFirst();
    console.log('   ✓ User 表结构正常');

    // 检查用户会话表
    await prisma.userSession.findFirst();
    console.log('   ✓ UserSession 表结构正常');

    // 检查用户角色表
    await prisma.userRole.findFirst();
    console.log('   ✓ UserRole 表结构正常');

    // 检查现有表的用户关联字段
    const workspace = await prisma.workspace.findFirst();
    if (workspace && !workspace.ownerId) {
      console.log('   ⚠️  Workspace 表缺少 ownerId 字段或数据');
    } else {
      console.log('   ✓ Workspace 表用户关联正常');
    }

    console.log('   ✅ 数据库架构验证完成');
  } catch (error) {
    console.error('   ✗ 数据库架构验证失败:', error);
    throw error;
  }
}

/**
 * 创建默认工作区（为新用户）
 */
async function createDefaultWorkspaceForUser(userId: string) {
  console.log(`📁 为用户 ${userId} 创建默认工作区...`);

  try {
    const defaultWorkspace = await prisma.workspace.create({
      data: {
        name: '我的工作区',
        description: '默认工作区',
        isDefault: true,
        ownerId: userId,
      },
    });

    console.log(`   ✓ 创建默认工作区: ${defaultWorkspace.name}`);
    return defaultWorkspace;
  } catch (error) {
    console.error('   ✗ 创建默认工作区失败:', error);
    throw error;
  }
}

/**
 * 主初始化函数
 */
async function initializeUserSystem() {
  console.log('🚀 开始初始化 XItools 用户系统...\n');

  try {
    // 1. 验证数据库架构
    await validateDatabaseSchema();
    console.log();

    // 2. 创建默认角色
    await createDefaultRoles();
    console.log();

    // 3. 创建管理员用户（可选）
    const adminUser = await createAdminUser();
    console.log();

    // 4. 为管理员用户创建默认工作区
    if (adminUser) {
      await createDefaultWorkspaceForUser(adminUser.id);
      console.log();
    }

    console.log('✅ 用户系统初始化完成！');
    
    if (adminUser) {
      console.log('\n📋 初始化摘要:');
      console.log(`   👤 管理员用户: ${adminUser.username} (${adminUser.email})`);
      console.log(`   🔑 默认密码: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
      console.log('   ⚠️  请及时修改默认密码！');
    }

  } catch (error) {
    console.error('❌ 用户系统初始化失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * 清理用户系统数据（开发/测试用）
 */
async function cleanupUserSystem() {
  console.log('🧹 清理用户系统数据...');

  try {
    // 删除用户会话
    await prisma.userSession.deleteMany();
    console.log('   ✓ 清理用户会话数据');

    // 删除用户数据（这会级联删除相关数据）
    await prisma.user.deleteMany();
    console.log('   ✓ 清理用户数据');

    // 删除非系统角色
    await prisma.userRole.deleteMany({
      where: { isSystem: false },
    });
    console.log('   ✓ 清理自定义角色数据');

    console.log('✅ 用户系统数据清理完成');
  } catch (error) {
    console.error('❌ 清理用户系统数据失败:', error);
    throw error;
  }
}

// 命令行参数处理
const command = process.argv[2];

if (command === 'cleanup') {
  cleanupUserSystem()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} else {
  initializeUserSystem()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

// 导出函数供其他模块使用
export {
  initializeUserSystem,
  cleanupUserSystem,
  createDefaultRoles,
  createAdminUser,
  validateDatabaseSchema,
  createDefaultWorkspaceForUser,
};
