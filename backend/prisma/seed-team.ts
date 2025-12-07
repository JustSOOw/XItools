/**
 * 团队协作模块种子数据
 *
 * 用于生成测试和开发环境的团队相关数据
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始生成团队协作模块种子数据...');

  // 1. 创建测试用户
  const users = await createUsers();

  // 2. 创建团队
  const teams = await createTeams(users);

  // 3. 添加团队成员
  await createTeamMembers(teams, users);

  // 4. 创建团队邀请（示例）
  await createTeamInvitations(teams, users);

  console.log('种子数据生成完成！');
}

/**
 * 创建测试用户
 */
async function createUsers() {
  console.log('\n📝 创建测试用户...');

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('password123', salt);

  const usersList = [
    {
      username: 'alice',
      email: 'alice@example.com',
      passwordHash: password,
      role: 'user',
      isActive: true,
    },
    {
      username: 'bob',
      email: 'bob@example.com',
      passwordHash: password,
      role: 'user',
      isActive: true,
    },
    {
      username: 'charlie',
      email: 'charlie@example.com',
      passwordHash: password,
      role: 'user',
      isActive: true,
    },
    {
      username: 'diana',
      email: 'diana@example.com',
      passwordHash: password,
      role: 'user',
      isActive: true,
    },
  ];

  const createdUsers: any[] = [];

  for (const userData of usersList) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
    console.log(`  ✓ 用户: ${user.username} (${user.email})`);
    createdUsers.push(user);
  }

  return createdUsers;
}

/**
 * 创建团队
 */
async function createTeams(users: any[]) {
  console.log('\n🏢 创建团队...');

  const teamsData = [
    {
      name: 'Alpha 团队',
      description: '主要开发团队，负责核心功能开发',
      ownerId: users[0].id, // alice
      avatar: null,
      isActive: true,
    },
    {
      name: 'Beta 团队',
      description: '测试和质量保证团队',
      ownerId: users[2].id, // charlie
      avatar: null,
      isActive: true,
    },
  ];

  const createdTeams: any[] = [];

  for (const teamData of teamsData) {
    try {
      const team = await prisma.team.create({
        data: teamData,
      });
      console.log(`  ✓ 团队: ${team.name} (所有者: ${teamsData.find(t => t.ownerId === team.ownerId)?.name})`);
      createdTeams.push(team);
    } catch (error) {
      console.log(`  ⚠ 团队已存在: ${teamData.name}`);
    }
  }

  return createdTeams;
}

/**
 * 创建团队成员
 */
async function createTeamMembers(teams: any[], users: any[]) {
  console.log('\n👥 添加团队成员...');

  const membersData = [
    {
      teamId: teams[0]?.id, // Alpha 团队
      userId: users[1]?.id, // bob
      role: 'member',
      status: 'active',
    },
    {
      teamId: teams[1]?.id, // Beta 团队
      userId: users[3]?.id, // diana
      role: 'member',
      status: 'active',
    },
  ];

  for (const memberData of membersData) {
    if (!memberData.teamId || !memberData.userId) continue;

    try {
      const member = await prisma.teamMember.create({
        data: memberData,
      });
      const team = teams.find(t => t.id === member.teamId);
      const user = users.find(u => u.id === member.userId);
      console.log(`  ✓ 成员: ${user?.username} → ${team?.name}`);
    } catch (error) {
      console.log(`  ⚠ 成员已存在`);
    }
  }
}

/**
 * 创建团队邀请（示例）
 */
async function createTeamInvitations(teams: any[], users: any[]) {
  console.log('\n✉️  创建团队邀请...');

  const invitationsData = [
    {
      teamId: teams[0]?.id, // Alpha 团队
      inviterId: users[0]?.id, // alice
      invitedEmail: 'newuser@example.com',
      inviteCode: 'sample-invite-code-1',
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后
    },
  ];

  for (const invitationData of invitationsData) {
    if (!invitationData.teamId || !invitationData.inviterId) continue;

    try {
      const invitation = await prisma.teamInvitation.create({
        data: invitationData,
      });
      const team = teams.find(t => t.id === invitation.teamId);
      console.log(`  ✓ 邀请: ${invitation.invitedEmail} → ${team?.name}`);
    } catch (error) {
      console.log(`  ⚠ 邀请已存在`);
    }
  }
}

main()
  .catch((e) => {
    console.error('生成种子数据失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
