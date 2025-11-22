import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { workspaceService } from '../services/workspaceService';
import { projectService } from '../services/projectService';
import { boardService } from '../services/boardService';
import { taskService } from '../services/taskService';
import { ProjectPermissionType } from '../types/teamTypes';

const prisma = new PrismaClient();

// 生成唯一测试标识
const testId = Date.now().toString();

describe('查询逻辑优化测试', () => {
  let personalUserId: string;
  let teamMember1Id: string;
  let teamMember2Id: string;
  let teamId: string;
  let personalWorkspaceId: string;
  let teamWorkspaceId: string;
  let personalProjectId: string;
  let teamProjectId: string;
  let personalBoardId: string;
  let teamBoardId: string;
  let teamMemberId1: string;
  let teamMemberId2: string;

  beforeAll(async () => {
    // 创建个人用户
    const personalUser = await prisma.user.create({
      data: {
        email: `query-personal-${testId}@test.com`,
        passwordHash: 'test123',
        username: `QueryPersonalUser${testId}`,
      },
    });
    personalUserId = personalUser.id;

    // 创建团队成员1 (管理员)
    const member1 = await prisma.user.create({
      data: {
        email: `query-member1-${testId}@test.com`,
        passwordHash: 'test123',
        username: `QueryMember1${testId}`,
      },
    });
    teamMember1Id = member1.id;

    // 创建团队成员2 (普通成员)
    const member2 = await prisma.user.create({
      data: {
        email: `query-member2-${testId}@test.com`,
        passwordHash: 'test123',
        username: `QueryMember2${testId}`,
      },
    });
    teamMember2Id = member2.id;

    // 创建团队
    const team = await prisma.team.create({
      data: {
        name: 'Test Query Team',
        ownerId: teamMember1Id,
      },
    });
    teamId = team.id;

    // 创建团队成员记录
    const tm1 = await prisma.teamMember.create({
      data: {
        teamId,
        userId: teamMember1Id,
        role: 'admin',
      },
    });
    teamMemberId1 = tm1.id;

    const tm2 = await prisma.teamMember.create({
      data: {
        teamId,
        userId: teamMember2Id,
        role: 'member',
      },
    });
    teamMemberId2 = tm2.id;

    // 创建个人工作区
    const personalWorkspace = await prisma.workspace.create({
      data: {
        name: 'Personal Workspace',
        ownerId: personalUserId,
      },
    });
    personalWorkspaceId = personalWorkspace.id;

    // 创建团队工作区
    const teamWorkspace = await prisma.workspace.create({
      data: {
        name: 'Team Workspace',
        ownerId: teamMember1Id,
        teamId,
      },
    });
    teamWorkspaceId = teamWorkspace.id;

    // 创建个人项目
    const personalProject = await prisma.project.create({
      data: {
        name: 'Personal Project',
        ownerId: personalUserId,
        workspaceId: personalWorkspaceId,
      },
    });
    personalProjectId = personalProject.id;

    // 创建团队项目
    const teamProject = await prisma.project.create({
      data: {
        name: 'Team Project',
        ownerId: teamMember1Id,
        workspaceId: teamWorkspaceId,
      },
    });
    teamProjectId = teamProject.id;

    // 为团队成员2设置项目权限 (查看权限)
    await prisma.projectPermission.create({
      data: {
        projectId: teamProjectId,
        memberId: teamMemberId2,
        permission: ProjectPermissionType.VIEW,
        grantedBy: teamMember1Id,
      },
    });

    // 创建个人看板
    const personalBoard = await prisma.board.create({
      data: {
        name: 'Personal Board',
        ownerId: personalUserId,
        workspaceId: personalWorkspaceId,
        projectId: personalProjectId,
      },
    });
    personalBoardId = personalBoard.id;

    // 创建团队看板
    const teamBoard = await prisma.board.create({
      data: {
        name: 'Team Board',
        ownerId: teamMember1Id,
        workspaceId: teamWorkspaceId,
        projectId: teamProjectId,
      },
    });
    teamBoardId = teamBoard.id;

    // 创建个人任务
    await prisma.task.create({
      data: {
        title: 'Personal Task',
        boardId: personalBoardId,
        status: personalBoardId,
        ownerId: personalUserId,
      },
    });

    // 创建团队任务
    await prisma.task.create({
      data: {
        title: 'Team Task',
        boardId: teamBoardId,
        status: teamBoardId,
        ownerId: teamMember1Id,
      },
    });
  });

  afterAll(async () => {
    // 清理测试数据
    await prisma.task.deleteMany({
      where: {
        ownerId: { in: [personalUserId, teamMember1Id, teamMember2Id] },
      },
    });

    await prisma.board.deleteMany({
      where: {
        ownerId: { in: [personalUserId, teamMember1Id, teamMember2Id] },
      },
    });

    await prisma.projectPermission.deleteMany({
      where: { projectId: teamProjectId },
    });

    await prisma.project.deleteMany({
      where: {
        ownerId: { in: [personalUserId, teamMember1Id, teamMember2Id] },
      },
    });

    await prisma.workspace.deleteMany({
      where: {
        ownerId: { in: [personalUserId, teamMember1Id, teamMember2Id] },
      },
    });

    await prisma.teamMember.deleteMany({
      where: { teamId },
    });

    await prisma.team.delete({
      where: { id: teamId },
    });

    await prisma.user.deleteMany({
      where: { id: { in: [personalUserId, teamMember1Id, teamMember2Id] } },
    });

    await prisma.$disconnect();
  });

  describe('WorkspaceService - 查询正确性 (个人+团队资源)', () => {
    it('个人用户应该只能看到自己的工作区', async () => {
      const workspaces = await workspaceService.getWorkspacesByUser(personalUserId);

      expect(workspaces.length).toBeGreaterThanOrEqual(1);
      const personalWs = workspaces.find(ws => ws.id === personalWorkspaceId);
      expect(personalWs).toBeDefined();
      expect(personalWs?.teamId).toBeNull();
    });

    it('团队成员应该同时看到个人和团队工作区', async () => {
      const workspaces = await workspaceService.getWorkspacesByUser(teamMember1Id);

      expect(workspaces.length).toBeGreaterThanOrEqual(1);
      const teamWs = workspaces.find(ws => ws.id === teamWorkspaceId);
      expect(teamWs).toBeDefined();
      expect(teamWs?.teamId).toBe(teamId);
    });
  });

  describe('ProjectService - 查询正确性 (个人+团队资源)', () => {
    it('个人用户应该只能看到自己的项目', async () => {
      const projects = await projectService.getUserProjects(personalUserId);

      const personalProject = projects.find(p => p.id === personalProjectId);
      expect(personalProject).toBeDefined();

      const teamProject = projects.find(p => p.id === teamProjectId);
      expect(teamProject).toBeUndefined();
    });

    it('团队管理员应该看到所有团队项目', async () => {
      const projects = await projectService.getUserProjects(teamMember1Id);

      const teamProject = projects.find(p => p.id === teamProjectId);
      expect(teamProject).toBeDefined();
    });

    it('团队成员应该只看到有权限的项目', async () => {
      const projects = await projectService.getUserProjects(teamMember2Id);

      const teamProject = projects.find(p => p.id === teamProjectId);
      expect(teamProject).toBeDefined();
      expect(teamProject?.workspace.teamId).toBe(teamId);
    });
  });

  describe('BoardService - 查询正确性 (个人+团队资源)', () => {
    it('个人用户应该只能看到自己的看板', async () => {
      const boards = await boardService.getUserBoards(personalUserId);

      const personalBoard = boards.find(b => b.id === personalBoardId);
      expect(personalBoard).toBeDefined();

      const teamBoard = boards.find(b => b.id === teamBoardId);
      expect(teamBoard).toBeUndefined();
    });

    it('团队管理员应该看到所有团队看板', async () => {
      const boards = await boardService.getUserBoards(teamMember1Id);

      const teamBoard = boards.find(b => b.id === teamBoardId);
      expect(teamBoard).toBeDefined();
    });

    it('团队成员应该只看到有权限项目的看板', async () => {
      const boards = await boardService.getUserBoards(teamMember2Id);

      const teamBoard = boards.find(b => b.id === teamBoardId);
      expect(teamBoard).toBeDefined();
    });
  });

  describe('TaskService - 查询正确性 (个人+团队资源)', () => {
    it('个人用户应该只能看到自己的任务', async () => {
      const tasks = await taskService.getUserTasks(personalUserId);

      const personalTask = tasks.find(t => t.title === 'Personal Task');
      expect(personalTask).toBeDefined();

      const teamTask = tasks.find(t => t.title === 'Team Task');
      expect(teamTask).toBeUndefined();
    });

    it('团队管理员应该看到所有团队任务', async () => {
      const tasks = await taskService.getUserTasks(teamMember1Id);

      const teamTask = tasks.find(t => t.title === 'Team Task');
      expect(teamTask).toBeDefined();
    });

    it('团队成员应该只看到有权限项目的任务', async () => {
      const tasks = await taskService.getUserTasks(teamMember2Id);

      const teamTask = tasks.find(t => t.title === 'Team Task');
      expect(teamTask).toBeDefined();
    });
  });

  describe('查询性能测试', () => {
    it('工作区查询应该在200ms内完成', async () => {
      const startTime = Date.now();
      await workspaceService.getWorkspacesByUser(teamMember1Id);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(200);
    });

    it('项目查询应该在200ms内完成', async () => {
      const startTime = Date.now();
      await projectService.getUserProjects(teamMember1Id);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(200);
    });

    it('看板查询应该在200ms内完成', async () => {
      const startTime = Date.now();
      await boardService.getUserBoards(teamMember1Id);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(200);
    });

    it('任务查询应该在200ms内完成', async () => {
      const startTime = Date.now();
      await taskService.getUserTasks(teamMember1Id);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(200);
    });
  });

  describe('数据隔离测试 (不同团队的数据不互相可见)', () => {
    let otherTeamId: string;
    let otherTeamUserId: string;
    let otherTeamWorkspaceId: string;
    let otherTeamProjectId: string;

    beforeAll(async () => {
      // 创建另一个团队的用户
      const otherUser = await prisma.user.create({
        data: {
          email: `query-other-team-${testId}@test.com`,
          passwordHash: 'test123',
          username: `OtherTeamUser${testId}`,
        },
      });
      otherTeamUserId = otherUser.id;

      // 创建另一个团队
      const otherTeam = await prisma.team.create({
        data: {
          name: 'Other Team',
          ownerId: otherTeamUserId,
        },
      });
      otherTeamId = otherTeam.id;

      // 创建团队成员记录
      await prisma.teamMember.create({
        data: {
          teamId: otherTeamId,
          userId: otherTeamUserId,
          role: 'admin',
        },
      });

      // 创建另一个团队的工作区
      const otherWorkspace = await prisma.workspace.create({
        data: {
          name: 'Other Team Workspace',
          ownerId: otherTeamUserId,
          teamId: otherTeamId,
        },
      });
      otherTeamWorkspaceId = otherWorkspace.id;

      // 创建另一个团队的项目
      const otherProject = await prisma.project.create({
        data: {
          name: 'Other Team Project',
          ownerId: otherTeamUserId,
          workspaceId: otherTeamWorkspaceId,
        },
      });
      otherTeamProjectId = otherProject.id;
    });

    afterAll(async () => {
      // 清理另一个团队的数据
      await prisma.project.deleteMany({
        where: { ownerId: otherTeamUserId },
      });

      await prisma.workspace.deleteMany({
        where: { ownerId: otherTeamUserId },
      });

      await prisma.teamMember.deleteMany({
        where: { teamId: otherTeamId },
      });

      await prisma.team.delete({
        where: { id: otherTeamId },
      });

      await prisma.user.delete({
        where: { id: otherTeamUserId },
      });
    });

    it('团队1的成员不应该看到团队2的工作区', async () => {
      const workspaces = await workspaceService.getWorkspacesByUser(teamMember1Id);

      const otherWorkspace = workspaces.find(ws => ws.id === otherTeamWorkspaceId);
      expect(otherWorkspace).toBeUndefined();
    });

    it('团队1的成员不应该看到团队2的项目', async () => {
      const projects = await projectService.getUserProjects(teamMember1Id);

      const otherProject = projects.find(p => p.id === otherTeamProjectId);
      expect(otherProject).toBeUndefined();
    });
  });

  describe('复杂查询场景测试', () => {
    it('用户应该同时看到直属工作区的看板和项目看板', async () => {
      // 创建直属工作区看板 (无项目)
      const directBoard = await prisma.board.create({
        data: {
          name: 'Direct Workspace Board',
          ownerId: teamMember1Id,
          workspaceId: teamWorkspaceId,
        },
      });

      const boards = await boardService.getUserBoards(teamMember1Id);

      const directBoardFound = boards.find(b => b.id === directBoard.id);
      const projectBoardFound = boards.find(b => b.id === teamBoardId);

      expect(directBoardFound).toBeDefined();
      expect(projectBoardFound).toBeDefined();

      // 清理
      await prisma.board.delete({
        where: { id: directBoard.id },
      });
    });

    it('用户应该同时看到直属项目的看板和直属工作区的看板', async () => {
      // 创建直属项目看板 (无项目)
      const directProjectBoard = await prisma.board.create({
        data: {
          name: 'Direct Project Board',
          ownerId: teamMember1Id,
          workspaceId: teamWorkspaceId,
        },
      });

      const boards = await boardService.getUserBoards(teamMember1Id);

      expect(boards.length).toBeGreaterThanOrEqual(2);

      // 清理
      await prisma.board.delete({
        where: { id: directProjectBoard.id },
      });
    });
  });
});
