/**
 * 创建测试账号并加入到 test@test.com 的团队
 *
 * 用于功能性测试，绕过邮箱验证码
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// 测试账号配置
const TEST_ACCOUNTS = [
  { username: 'tester01', email: 'tester01@test.com' },
  { username: 'tester02', email: 'tester02@test.com' },
  { username: 'tester03', email: 'tester03@test.com' },
  { username: 'tester04', email: 'tester04@test.com' },
  { username: 'tester05', email: 'tester05@test.com' },
  { username: 'tester06', email: 'tester06@test.com' },
  { username: 'tester07', email: 'tester07@test.com' },
  { username: 'tester08', email: 'tester08@test.com' },
  { username: 'tester09', email: 'tester09@test.com' },
  { username: 'tester10', email: 'tester10@test.com' },
];

const TEST_PASSWORD = 'test123'; // 统一密码

async function main() {
  console.log('🚀 开始创建测试账号...\n');

  // 1. 查找 test@test.com 用户
  const mainUser = await prisma.user.findUnique({
    where: { email: 'test@test.com' },
    include: { ownedTeam: true },
  });

  if (!mainUser) {
    console.error('❌ 未找到 test@test.com 用户，请先创建该用户');
    process.exit(1);
  }

  console.log(`✓ 找到主账号: ${mainUser.username} (${mainUser.email})`);

  // 2. 检查/创建团队
  let team = mainUser.ownedTeam;
  if (!team) {
    console.log('\n📝 test@test.com 没有团队，正在创建...');
    team = await prisma.team.create({
      data: {
        name: 'Test Team',
        description: '测试团队 - 用于功能测试',
        ownerId: mainUser.id,
        isActive: true,
      },
    });
    console.log(`✓ 创建团队: ${team.name}`);
  } else {
    console.log(`✓ 使用现有团队: ${team.name}`);
  }

  // 3. 创建测试账号并加入团队
  console.log('\n👥 创建测试账号并加入团队...\n');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, salt);

  const createdAccounts: { username: string; email: string; password: string }[] = [];

  for (const account of TEST_ACCOUNTS) {
    try {
      // 检查用户是否已存在
      const existingUser = await prisma.user.findUnique({
        where: { email: account.email },
      });

      let user;
      if (existingUser) {
        user = existingUser;
        console.log(`  ⚠ 用户已存在: ${account.username} (${account.email})`);
      } else {
        // 创建用户和默认工作区
        user = await prisma.user.create({
          data: {
            username: account.username,
            email: account.email,
            passwordHash,
            role: 'user',
            isActive: true,
            workspaces: {
              create: {
                name: '默认工作区',
                description: `${account.username} 的个人工作区`,
                isDefault: true,
              },
            },
          },
        });
        console.log(`  ✓ 创建用户: ${account.username} (${account.email})`);
      }

      // 检查是否已是团队成员
      const existingMember = await prisma.teamMember.findUnique({
        where: { userId: user.id },
      });

      if (existingMember) {
        console.log(`    ⚠ 已是团队成员`);
      } else {
        // 加入团队
        await prisma.teamMember.create({
          data: {
            teamId: team.id,
            userId: user.id,
            role: 'member',
            status: 'active',
          },
        });
        console.log(`    ✓ 已加入团队: ${team.name}`);
      }

      createdAccounts.push({
        username: account.username,
        email: account.email,
        password: TEST_PASSWORD,
      });
    } catch (error) {
      console.error(`  ❌ 处理账号失败: ${account.email}`, error);
    }
  }

  // 4. 输出结果
  console.log('\n' + '='.repeat(60));
  console.log('📋 测试账号信息（可添加到 README.md）：');
  console.log('='.repeat(60));
  console.log('\n### 测试账号\n');
  console.log('主账号：');
  console.log(`- test@test.com / test123\n`);
  console.log('团队成员账号（密码统一为 test123）：');
  for (const acc of createdAccounts) {
    console.log(`- ${acc.email}`);
  }
  console.log('\n' + '='.repeat(60));
  console.log('✅ 完成！共创建/检查了 ' + createdAccounts.length + ' 个测试账号');
}

main()
  .catch((e) => {
    console.error('❌ 执行失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
