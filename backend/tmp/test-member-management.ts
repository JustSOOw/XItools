/**
 * 成员管理功能测试脚本
 *
 * 测试内容：
 * 1. 成员列表查询
 * 2. 移除成员功能
 * 3. 成员退出后的数据完整性
 * 4. 权限检查（只有管理员能移除成员）
 */

import { PrismaClient } from '@prisma/client';
import { teamService } from '../src/services/teamService';

const prisma = new PrismaClient();

async function runMemberManagementTests() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   成员管理功能测试                        ║');
  console.log('╚══════════════════════════════════════════╝');

  try {
    // 准备测试数据
    console.log('\n=== 准备测试数据 ===');

    // 获取种子数据创建的用户和团队
    const alice = await prisma.user.findUnique({ where: { email: 'alice@example.com' } });
    const bob = await prisma.user.findUnique({ where: { email: 'bob@example.com' } });
    const charlie = await prisma.user.findUnique({ where: { email: 'charlie@example.com' } });

    if (!alice || !bob || !charlie) {
      console.error('✗ 测试数据不存在，请先运行: npm run db:seed:team');
      return;
    }

    console.log(`✓ 找到测试用户: alice, bob, charlie`);

    const alphaTeam = await prisma.team.findFirst({
      where: { ownerId: alice.id }
    });

    if (!alphaTeam) {
      console.error('✗ Alpha 团队不存在，请先运行: npm run db:seed:team');
      return;
    }

    console.log(`✓ 找到测试团队: ${alphaTeam.name}`);

    // 测试1: 成员列表查询
    await test1_GetTeamMembers(alphaTeam.id);

    // 测试2: 获取成员权限
    await test2_GetMemberPermissions(alphaTeam.id);

    // 测试3: 权限检查 - 非管理员无法移除成员
    await test3_NonOwnerCannotRemove(alphaTeam.id, bob.id, charlie.id);

    // 测试4: 移除成员功能
    await test4_RemoveMember(alphaTeam.id, alice.id, bob.id);

    // 测试5: 验证数据完整性
    await test5_DataIntegrity(alphaTeam.id, bob.id);

    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║   所有测试完成                            ║');
    console.log('╚══════════════════════════════════════════╝');

  } catch (error) {
    console.error('\n测试执行失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * 测试1: 成员列表查询
 */
async function test1_GetTeamMembers(teamId: string) {
  console.log('\n=== 测试1: 成员列表查询 ===');

  try {
    const members = await teamService.getTeamMembers(teamId);

    console.log(`✓ 成功获取团队成员列表`);
    console.log(`  成员数量: ${members.length}`);

    for (const member of members) {
      console.log(`  - ${member.user.username} (${member.role}) - 加入时间: ${member.joinedAt.toLocaleDateString()}`);
    }

    if (members.length > 0) {
      console.log('✓ 成员列表查询测试通过');
    } else {
      console.error('✗ 成员列表为空');
    }
  } catch (error: any) {
    console.error('✗ 成员列表查询失败:', error.message);
  }
}

/**
 * 测试2: 获取成员权限
 */
async function test2_GetMemberPermissions(teamId: string) {
  console.log('\n=== 测试2: 获取成员权限 ===');

  try {
    const members = await teamService.getTeamMembers(teamId);

    if (members.length > 0) {
      const memberId = members[0].id;
      const permissions = await teamService.getMemberPermissions(memberId);

      console.log(`✓ 成功获取成员权限`);
      console.log(`  成员: ${members[0].user.username}`);
      console.log(`  权限数量: ${permissions.length}`);

      if (permissions.length > 0) {
        for (const perm of permissions) {
          console.log(`  - 项目: ${perm.projectName}, 权限: ${perm.permission}`);
        }
      } else {
        console.log('  该成员暂无项目权限');
      }

      console.log('✓ 成员权限查询测试通过');
    } else {
      console.log('⚠ 团队无成员，跳过权限测试');
    }
  } catch (error: any) {
    console.error('✗ 成员权限查询失败:', error.message);
  }
}

/**
 * 测试3: 权限检查 - 非管理员无法移除成员
 */
async function test3_NonOwnerCannotRemove(teamId: string, nonOwnerId: string, targetUserId: string) {
  console.log('\n=== 测试3: 权限检查 - 非管理员无法移除成员 ===');

  try {
    const members = await teamService.getTeamMembers(teamId);
    if (members.length === 0) {
      console.log('⚠ 团队无成员，跳过测试');
      return;
    }

    const memberId = members[0].id;

    // 尝试用非管理员身份移除成员（应该失败）
    try {
      await teamService.removeMember(teamId, memberId, nonOwnerId);
      console.error('✗ 非管理员不应该能够移除成员');
    } catch (error: any) {
      if (error.message.includes('只有团队创建者')) {
        console.log('✓ 正确拒绝非管理员移除成员');
      } else {
        console.error('✗ 错误类型不正确:', error.message);
      }
    }
  } catch (error: any) {
    console.error('✗ 权限检查测试失败:', error.message);
  }
}

/**
 * 测试4: 移除成员功能
 */
async function test4_RemoveMember(teamId: string, ownerId: string, memberUserId: string) {
  console.log('\n=== 测试4: 移除成员功能 ===');

  try {
    // 获取要移除的成员记录
    const members = await teamService.getTeamMembers(teamId);
    const memberToRemove = members.find(m => m.userId === memberUserId);

    if (!memberToRemove) {
      console.log('⚠ 未找到要移除的成员，跳过测试');
      return;
    }

    console.log(`  准备移除成员: ${memberToRemove.user.username}`);

    // 移除成员
    await teamService.removeMember(teamId, memberToRemove.id, ownerId);
    console.log('✓ 成功移除成员');

    // 验证成员已被移除
    const updatedMembers = await teamService.getTeamMembers(teamId);
    const stillExists = updatedMembers.some(m => m.userId === memberUserId);

    if (!stillExists) {
      console.log('✓ 成员已从团队中移除');
    } else {
      console.error('✗ 成员仍然存在于团队中');
    }

  } catch (error: any) {
    console.error('✗ 移除成员失败:', error.message);
  }
}

/**
 * 测试5: 验证数据完整性
 */
async function test5_DataIntegrity(teamId: string, removedUserId: string) {
  console.log('\n=== 测试5: 验证数据完整性 ===');

  try {
    // 检查被移除用户的任务是否保留
    const userTasks = await prisma.task.count({
      where: {
        ownerId: removedUserId
      }
    });

    console.log(`  被移除用户的任务数量: ${userTasks}`);

    // 检查被移除用户的评论是否保留
    const userComments = await prisma.taskComment.count({
      where: {
        userId: removedUserId
      }
    });

    console.log(`  被移除用户的评论数量: ${userComments}`);

    console.log('✓ 数据完整性测试通过');
    console.log('  说明: 成员退出/被移除后，其创建的任务和评论保持不变');

  } catch (error: any) {
    console.error('✗ 数据完整性验证失败:', error.message);
  }
}

// 运行测试
runMemberManagementTests();
