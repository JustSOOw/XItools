/**
 * 团队邀请功能测试脚本
 *
 * 测试内容：
 * 1. 邀请码生成和验证
 * 2. 邀请流程（发送→接受→加入）
 * 3. 邀请拒绝流程
 * 4. 邀请过期机制
 * 5. 重复邀请处理
 * 6. 边界情况（已加入其他团队等）
 */

import { PrismaClient } from '@prisma/client';
import { teamService } from '../src/services/teamService';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// 测试用户数据
const testUsers = {
  owner: {
    id: '',
    email: 'team-owner@test.com',
    username: 'TeamOwner',
    password: 'password123'
  },
  member1: {
    id: '',
    email: 'member1@test.com',
    username: 'Member1',
    password: 'password123'
  },
  member2: {
    id: '',
    email: 'member2@test.com',
    username: 'Member2',
    password: 'password123'
  },
  otherOwner: {
    id: '',
    email: 'other-owner@test.com',
    username: 'OtherOwner',
    password: 'password123'
  }
};

let testTeamId = '';
let testInvitationId = '';
let testInviteCode = '';

/**
 * 创建测试用户
 */
async function createTestUsers() {
  console.log('\n=== 创建测试用户 ===');

  const salt = await bcrypt.genSalt(10);

  for (const [key, userData] of Object.entries(testUsers)) {
    // 检查用户是否已存在
    let user = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      user = await prisma.user.create({
        data: {
          email: userData.email,
          username: userData.username,
          passwordHash: hashedPassword,
          isActive: true,
          role: 'user'
        }
      });
      console.log(`✓ 创建用户: ${userData.username} (${userData.email})`);
    } else {
      console.log(`✓ 用户已存在: ${userData.username} (${userData.email})`);
    }

    testUsers[key as keyof typeof testUsers].id = user.id;
  }
}

/**
 * 测试1: 创建团队
 */
async function test1_CreateTeam() {
  console.log('\n=== 测试1: 创建团队 ===');

  try {
    const team = await teamService.createTeam(testUsers.owner.id, {
      name: '测试团队',
      description: '这是一个用于测试的团队'
    });

    testTeamId = team.id;
    console.log('✓ 创建团队成功');
    console.log(`  团队ID: ${team.id}`);
    console.log(`  团队名称: ${team.name}`);
    console.log(`  所有者: ${testUsers.owner.username}`);
  } catch (error: any) {
    console.error('✗ 创建团队失败:', error.message);
  }
}

/**
 * 测试2: 邀请码生成和验证
 */
async function test2_InviteCodeGeneration() {
  console.log('\n=== 测试2: 邀请码生成和验证 ===');

  try {
    // 发送邀请
    const invitations = await teamService.inviteMembers(
      testTeamId,
      testUsers.owner.id,
      { emails: [testUsers.member1.email] }
    );

    if (invitations.length > 0) {
      testInvitationId = invitations[0].id;
      testInviteCode = invitations[0].inviteCode;

      console.log('✓ 邀请码生成成功');
      console.log(`  邀请ID: ${testInvitationId}`);
      console.log(`  邀请码: ${testInviteCode}`);
      console.log(`  邀请邮箱: ${invitations[0].invitedEmail}`);
      console.log(`  过期时间: ${invitations[0].expiresAt}`);

      // 验证邀请码
      const invitation = await teamService.getInvitationByCode(testInviteCode);
      if (invitation) {
        console.log('✓ 邀请码验证成功');
        console.log(`  团队名称: ${invitation.team.name}`);
        console.log(`  邀请者: ${invitation.inviter.username}`);
      } else {
        console.error('✗ 邀请码验证失败');
      }
    } else {
      console.error('✗ 邀请发送失败: 未生成邀请记录');
    }
  } catch (error: any) {
    console.error('✗ 邀请码生成失败:', error.message);
  }
}

/**
 * 测试3: 重复邀请处理
 */
async function test3_DuplicateInvitation() {
  console.log('\n=== 测试3: 重复邀请处理 ===');

  try {
    // 尝试再次邀请同一个邮箱
    const invitations = await teamService.inviteMembers(
      testTeamId,
      testUsers.owner.id,
      { emails: [testUsers.member1.email] }
    );

    if (invitations.length === 0) {
      console.log('✓ 重复邀请被正确拒绝（返回空数组）');
    } else {
      console.error('✗ 重复邀请处理失败: 应该跳过已存在的待处理邀请');
    }
  } catch (error: any) {
    console.error('✗ 重复邀请测试失败:', error.message);
  }
}

/**
 * 测试4: 接受邀请流程
 */
async function test4_AcceptInvitation() {
  console.log('\n=== 测试4: 接受邀请流程 ===');

  try {
    // 获取待处理邀请
    const pendingInvitations = await teamService.getPendingInvitations(testUsers.member1.id);
    console.log(`  待处理邀请数量: ${pendingInvitations.length}`);

    if (pendingInvitations.length > 0) {
      // 接受邀请
      await teamService.acceptInvitation(testInvitationId, testUsers.member1.id);
      console.log('✓ 接受邀请成功');

      // 验证成员已加入团队
      const members = await teamService.getTeamMembers(testTeamId);
      const isMember = members.some(m => m.userId === testUsers.member1.id);

      if (isMember) {
        console.log('✓ 成员已成功加入团队');
        console.log(`  团队成员数量: ${members.length}`);
      } else {
        console.error('✗ 成员加入失败');
      }

      // 验证邀请状态已更新
      const invitation = await prisma.teamInvitation.findUnique({
        where: { id: testInvitationId }
      });

      if (invitation?.status === 'accepted') {
        console.log('✓ 邀请状态已更新为 accepted');
      } else {
        console.error('✗ 邀请状态未正确更新');
      }
    } else {
      console.error('✗ 未找到待处理邀请');
    }
  } catch (error: any) {
    console.error('✗ 接受邀请失败:', error.message);
  }
}

/**
 * 测试5: 邀请拒绝流程
 */
async function test5_RejectInvitation() {
  console.log('\n=== 测试5: 邀请拒绝流程 ===');

  try {
    // 发送新邀请给 member2
    const invitations = await teamService.inviteMembers(
      testTeamId,
      testUsers.owner.id,
      { emails: [testUsers.member2.email] }
    );

    if (invitations.length > 0) {
      const invitationId = invitations[0].id;
      console.log(`  创建新邀请: ${invitationId}`);

      // 拒绝邀请
      await teamService.rejectInvitation(invitationId, testUsers.member2.id);
      console.log('✓ 拒绝邀请成功');

      // 验证邀请状态
      const invitation = await prisma.teamInvitation.findUnique({
        where: { id: invitationId }
      });

      if (invitation?.status === 'rejected') {
        console.log('✓ 邀请状态已更新为 rejected');
      } else {
        console.error('✗ 邀请状态未正确更新');
      }

      // 验证成员未加入团队
      const members = await teamService.getTeamMembers(testTeamId);
      const isMember = members.some(m => m.userId === testUsers.member2.id);

      if (!isMember) {
        console.log('✓ 成员未加入团队（符合预期）');
      } else {
        console.error('✗ 拒绝邀请后成员不应加入团队');
      }
    } else {
      console.error('✗ 创建邀请失败');
    }
  } catch (error: any) {
    console.error('✗ 拒绝邀请测试失败:', error.message);
  }
}

/**
 * 测试6: 边界情况 - 已加入其他团队
 */
async function test6_AlreadyInTeam() {
  console.log('\n=== 测试6: 边界情况 - 已加入其他团队 ===');

  try {
    // 创建另一个团队
    const otherTeam = await teamService.createTeam(testUsers.otherOwner.id, {
      name: '其他团队',
      description: '用于测试边界情况的团队'
    });
    console.log(`  创建其他团队: ${otherTeam.name}`);

    // 尝试邀请已加入第一个团队的成员
    const invitations = await teamService.inviteMembers(
      otherTeam.id,
      testUsers.otherOwner.id,
      { emails: [testUsers.member1.email] }
    );

    if (invitations.length > 0) {
      const invitationId = invitations[0].id;
      console.log(`  创建邀请: ${invitationId}`);

      // 尝试接受邀请（应该失败）
      try {
        await teamService.acceptInvitation(invitationId, testUsers.member1.id);
        console.error('✗ 应该拒绝已加入其他团队的用户');
      } catch (error: any) {
        if (error.message.includes('已经加入了一个团队')) {
          console.log('✓ 正确拒绝已加入其他团队的用户');
        } else {
          console.error('✗ 错误类型不正确:', error.message);
        }
      }
    } else {
      console.error('✗ 创建邀请失败');
    }
  } catch (error: any) {
    console.error('✗ 边界情况测试失败:', error.message);
  }
}

/**
 * 测试7: 邀请过期机制
 */
async function test7_InvitationExpiry() {
  console.log('\n=== 测试7: 邀请过期机制 ===');

  try {
    // 创建一个已过期的邀请（手动修改数据库）
    const expiredInvitation = await prisma.teamInvitation.create({
      data: {
        inviteCode: 'expired-' + crypto.randomBytes(16).toString('hex'),
        invitedEmail: 'expired@test.com',
        status: 'pending',
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 昨天过期
        teamId: testTeamId,
        inviterId: testUsers.owner.id
      }
    });

    console.log(`  创建已过期邀请: ${expiredInvitation.id}`);

    // 运行过期清理
    const expiredCount = await teamService.expireOldInvitations();
    console.log(`✓ 过期清理完成，更新了 ${expiredCount} 个邀请`);

    // 验证邀请状态
    const invitation = await prisma.teamInvitation.findUnique({
      where: { id: expiredInvitation.id }
    });

    if (invitation?.status === 'expired') {
      console.log('✓ 邀请状态已更新为 expired');
    } else {
      console.error('✗ 邀请状态未正确更新:', invitation?.status);
    }
  } catch (error: any) {
    console.error('✗ 邀请过期测试失败:', error.message);
  }
}

/**
 * 清理测试数据
 */
async function cleanup() {
  console.log('\n=== 清理测试数据 ===');

  try {
    // 删除测试团队（级联删除成员和邀请）
    await prisma.team.deleteMany({
      where: {
        name: {
          in: ['测试团队', '其他团队']
        }
      }
    });
    console.log('✓ 删除测试团队');

    // 删除测试用户
    await prisma.user.deleteMany({
      where: {
        email: {
          in: Object.values(testUsers).map(u => u.email)
        }
      }
    });
    console.log('✓ 删除测试用户');

  } catch (error: any) {
    console.error('✗ 清理失败:', error.message);
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   团队邀请功能测试                        ║');
  console.log('╚══════════════════════════════════════════╝');

  try {
    await createTestUsers();
    await test1_CreateTeam();
    await test2_InviteCodeGeneration();
    await test3_DuplicateInvitation();
    await test4_AcceptInvitation();
    await test5_RejectInvitation();
    await test6_AlreadyInTeam();
    await test7_InvitationExpiry();

    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║   所有测试完成                            ║');
    console.log('╚══════════════════════════════════════════╝');

  } catch (error) {
    console.error('\n测试执行失败:', error);
  } finally {
    // 询问是否清理测试数据
    console.log('\n是否清理测试数据？(手动运行清理)');
    // await cleanup();
    await prisma.$disconnect();
  }
}

// 运行测试
runAllTests();
