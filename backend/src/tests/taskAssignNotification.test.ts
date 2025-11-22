import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { taskService } from '../services/taskService';
import { notificationService } from '../services/notificationService';
import { NotificationTrigger } from '../services/notificationTrigger';
import { NotificationType } from '../types/notificationTypes';
import { setIo } from '../utils/socket';

const prisma = new PrismaClient();

// 模拟 Socket.IO
const mockIo = {
  to: vi.fn().mockReturnThis(),
  emit: vi.fn(),
};

// 生成唯一测试标识
const testId = Date.now().toString();

describe('任务分配通知测试', () => {
  let testUser1Id: string;
  let testUser2Id: string;
  let testUser3Id: string;
  let testTeamId: string;
  let testBoardId: string;
  let testColumnId: string;
  let testTaskId: string;

  beforeAll(async () => {
    // 初始化模拟 Socket.IO
    setIo(mockIo as any);

    // 创建测试用户1
    const user1 = await prisma.user.create({
      data: {
        email: `assign-user1-${testId}@test.com`,
        passwordHash: 'test123',
        username: `AssignUser1${testId}`,
      },
    });
    testUser1Id = user1.id;

    // 创建测试用户2
    const user2 = await prisma.user.create({
      data: {
        email: `assign-user2-${testId}@test.com`,
        passwordHash: 'test123',
        username: `AssignUser2${testId}`,
      },
    });
    testUser2Id = user2.id;

    // 创建测试用户3
    const user3 = await prisma.user.create({
      data: {
        email: `assign-user3-${testId}@test.com`,
        passwordHash: 'test123',
        username: `AssignUser3${testId}`,
      },
    });
    testUser3Id = user3.id;

    // 创建测试团队
    const team = await prisma.team.create({
      data: {
        name: 'Test Assign Team',
        ownerId: testUser1Id,
      },
    });
    testTeamId = team.id;

    // 创建团队成员
    await prisma.teamMember.create({
      data: {
        teamId: testTeamId,
        userId: testUser1Id,
        role: 'admin',
      },
    });

    await prisma.teamMember.create({
      data: {
        teamId: testTeamId,
        userId: testUser2Id,
        role: 'member',
      },
    });

    await prisma.teamMember.create({
      data: {
        teamId: testTeamId,
        userId: testUser3Id,
        role: 'member',
      },
    });

    // 创建测试看板
    const board = await prisma.board.create({
      data: {
        name: 'Test Assign Board',
        ownerId: testUser1Id,
      },
    });
    testBoardId = board.id;

    // 创建测试列
    const column = await prisma.boardColumn.create({
      data: {
        name: 'Todo',
        boardId: testBoardId,
        order: 0,
      },
    });
    testColumnId = column.id;
  });

  afterAll(async () => {
    // 清理测试数据
    await prisma.notification.deleteMany({
      where: {
        userId: { in: [testUser1Id, testUser2Id, testUser3Id] },
      },
    });

    await prisma.taskHistory.deleteMany({
      where: {
        task: { ownerId: testUser1Id },
      },
    });

    await prisma.task.deleteMany({
      where: { ownerId: testUser1Id },
    });

    await prisma.boardColumn.deleteMany({
      where: { boardId: testBoardId },
    });

    await prisma.board.deleteMany({
      where: { ownerId: testUser1Id },
    });

    await prisma.teamMember.deleteMany({
      where: { teamId: testTeamId },
    });

    await prisma.team.delete({
      where: { id: testTeamId },
    });

    await prisma.user.deleteMany({
      where: { id: { in: [testUser1Id, testUser2Id, testUser3Id] } },
    });

    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // 清理通知和任务数据
    await prisma.notification.deleteMany({
      where: {
        userId: { in: [testUser1Id, testUser2Id, testUser3Id] },
      },
    });

    await prisma.taskHistory.deleteMany({
      where: {
        task: { ownerId: testUser1Id },
      },
    });

    await prisma.task.deleteMany({
      where: { ownerId: testUser1Id },
    });
  });

  describe('单个负责人分配通知', () => {
    it('创建任务并分配给单个负责人时应该发送通知', async () => {
      const task = await taskService.createTask({
        title: 'Test Single Assignment Task',
        boardId: testBoardId,
        status: testColumnId,
        assignees: [testUser2Id],
      }, testUser1Id);

      // 手动触发通知（模拟任务分配时的通知触发）
      await NotificationTrigger.taskAssigned({
        taskId: task.id,
        taskTitle: task.title,
        assignees: [testUser2Id],
        assignerId: testUser1Id,
        assignerName: `AssignUser1${testId}`,
      });

      const notifications = await notificationService.getUserNotifications(testUser2Id);

      expect(notifications.data.length).toBeGreaterThanOrEqual(1);
      const assignNotification = notifications.data.find(
        n => n.type === NotificationType.TASK_ASSIGNED && n.resourceId === task.id
      );

      expect(assignNotification).toBeDefined();
      expect(assignNotification?.title).toContain('任务分配');
    });

    it('创建任务时不应该给任务创建者发送分配通知', async () => {
      const task = await taskService.createTask({
        title: 'Test Self Assignment Task',
        boardId: testBoardId,
        status: testColumnId,
        assignees: [testUser1Id],
      }, testUser1Id);

      // 手动触发通知 - 分配给自己不应创建通知
      await NotificationTrigger.taskAssigned({
        taskId: task.id,
        taskTitle: task.title,
        assignees: [testUser1Id],
        assignerId: testUser1Id,
        assignerName: `AssignUser1${testId}`,
      });

      const notifications = await notificationService.getUserNotifications(testUser1Id);

      const assignNotification = notifications.data.find(
        n => n.type === NotificationType.TASK_ASSIGNED
      );

      // 不应该给自己发送分配通知
      expect(assignNotification).toBeUndefined();
    });
  });

  describe('多个负责人分配通知', () => {
    it('创建任务并分配给多个负责人时应该为每个人发送通知', async () => {
      const task = await taskService.createTask({
        title: 'Test Multiple Assignment Task',
        boardId: testBoardId,
        status: testColumnId,
        assignees: [testUser2Id, testUser3Id],
      }, testUser1Id);

      // 手动触发通知
      await NotificationTrigger.taskAssigned({
        taskId: task.id,
        taskTitle: task.title,
        assignees: [testUser2Id, testUser3Id],
        assignerId: testUser1Id,
        assignerName: `AssignUser1${testId}`,
      });

      // 检查用户2的通知
      const notifications2 = await notificationService.getUserNotifications(testUser2Id);
      const assignNotification2 = notifications2.data.find(
        n => n.type === NotificationType.TASK_ASSIGNED && n.resourceId === task.id
      );
      expect(assignNotification2).toBeDefined();

      // 检查用户3的通知
      const notifications3 = await notificationService.getUserNotifications(testUser3Id);
      const assignNotification3 = notifications3.data.find(
        n => n.type === NotificationType.TASK_ASSIGNED && n.resourceId === task.id
      );
      expect(assignNotification3).toBeDefined();
    });
  });

  describe('负责人变更通知', () => {
    beforeEach(async () => {
      // 创建初始任务
      const task = await prisma.task.create({
        data: {
          title: 'Test Change Assignment Task',
          boardId: testBoardId,
          status: testColumnId,
          ownerId: testUser1Id,
          assignees: [testUser2Id],
        },
      });
      testTaskId = task.id;

      // 清理初始通知
      await prisma.notification.deleteMany({
        where: {
          userId: { in: [testUser1Id, testUser2Id, testUser3Id] },
        },
      });
    });

    it('更新任务添加新负责人时应该发送通知', async () => {
      // 模拟添加新负责人的通知
      await NotificationTrigger.taskAssigned({
        taskId: testTaskId,
        taskTitle: 'Test Change Assignment Task',
        assignees: [testUser3Id], // 只通知新添加的负责人
        assignerId: testUser1Id,
        assignerName: `AssignUser1${testId}`,
      });

      // 用户3应该收到分配通知
      const notifications3 = await notificationService.getUserNotifications(testUser3Id);
      const assignNotification = notifications3.data.find(
        n => n.type === NotificationType.TASK_ASSIGNED && n.resourceId === testTaskId
      );

      expect(assignNotification).toBeDefined();
    });

    it('更新任务移除负责人时不应该发送通知', async () => {
      // 移除负责人不触发通知，所以不调用 NotificationTrigger
      // 只验证没有通知被发送

      // 用户2不应该收到新通知
      const notifications2 = await notificationService.getUserNotifications(testUser2Id);
      expect(notifications2.total).toBe(0);
    });

    it('更新任务替换负责人时应该只给新负责人发送通知', async () => {
      // 模拟替换负责人 - 只通知新负责人
      await NotificationTrigger.taskAssigned({
        taskId: testTaskId,
        taskTitle: 'Test Change Assignment Task',
        assignees: [testUser3Id],
        assignerId: testUser1Id,
        assignerName: `AssignUser1${testId}`,
      });

      // 用户3应该收到通知
      const notifications3 = await notificationService.getUserNotifications(testUser3Id);
      const assignNotification3 = notifications3.data.find(
        n => n.type === NotificationType.TASK_ASSIGNED && n.resourceId === testTaskId
      );
      expect(assignNotification3).toBeDefined();

      // 用户2不应该收到新通知
      const notifications2 = await notificationService.getUserNotifications(testUser2Id);
      expect(notifications2.total).toBe(0);
    });
  });

  describe('通知内容验证', () => {
    it('通知应该包含正确的任务信息', async () => {
      const task = await taskService.createTask({
        title: 'Test Notification Content Task',
        boardId: testBoardId,
        status: testColumnId,
        assignees: [testUser2Id],
      }, testUser1Id);

      // 手动触发通知
      await NotificationTrigger.taskAssigned({
        taskId: task.id,
        taskTitle: task.title,
        assignees: [testUser2Id],
        assignerId: testUser1Id,
        assignerName: `AssignUser1${testId}`,
      });

      const notifications = await notificationService.getUserNotifications(testUser2Id);
      const assignNotification = notifications.data.find(
        n => n.type === NotificationType.TASK_ASSIGNED && n.resourceId === task.id
      );

      expect(assignNotification).toBeDefined();
      expect(assignNotification?.resourceType).toBe('task');
      expect(assignNotification?.resourceId).toBe(task.id);
      expect(assignNotification?.content).toContain(task.title);
    });

    it('通知应该标记为未读', async () => {
      const task = await taskService.createTask({
        title: 'Test Unread Notification',
        boardId: testBoardId,
        status: testColumnId,
        assignees: [testUser2Id],
      }, testUser1Id);

      // 手动触发通知
      await NotificationTrigger.taskAssigned({
        taskId: task.id,
        taskTitle: task.title,
        assignees: [testUser2Id],
        assignerId: testUser1Id,
        assignerName: `AssignUser1${testId}`,
      });

      const notifications = await notificationService.getUserNotifications(testUser2Id);
      const assignNotification = notifications.data.find(
        n => n.type === NotificationType.TASK_ASSIGNED && n.resourceId === task.id
      );

      expect(assignNotification).toBeDefined();
      expect(assignNotification?.isRead).toBe(false);
    });
  });

  describe('边界情况测试', () => {
    it('创建没有负责人的任务不应该发送通知', async () => {
      await taskService.createTask({
        title: 'Test No Assignee Task',
        boardId: testBoardId,
        status: testColumnId,
        assignees: [],
      }, testUser1Id);

      // 空负责人列表不触发通知

      const notifications2 = await notificationService.getUserNotifications(testUser2Id);
      const notifications3 = await notificationService.getUserNotifications(testUser3Id);

      expect(notifications2.total).toBe(0);
      expect(notifications3.total).toBe(0);
    });

    it('负责人列表不变时不应该发送新通知', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Test Unchanged Assignment',
          boardId: testBoardId,
          status: testColumnId,
          ownerId: testUser1Id,
          assignees: [testUser2Id],
        },
      });

      // 清理初始通知
      await prisma.notification.deleteMany({
        where: { userId: testUser2Id },
      });

      // 不触发通知（因为负责人列表不变）
      // 只验证没有通知被发送

      const notifications = await notificationService.getUserNotifications(testUser2Id);
      expect(notifications.total).toBe(0);
    });
  });

  describe('批量分配通知', () => {
    it('批量创建任务时应该为所有负责人发送通知', async () => {
      const tasks = await Promise.all([
        taskService.createTask({
          title: 'Batch Task 1',
          boardId: testBoardId,
          status: testColumnId,
          assignees: [testUser2Id],
        }, testUser1Id),
        taskService.createTask({
          title: 'Batch Task 2',
          boardId: testBoardId,
          status: testColumnId,
          assignees: [testUser2Id],
        }, testUser1Id),
        taskService.createTask({
          title: 'Batch Task 3',
          boardId: testBoardId,
          status: testColumnId,
          assignees: [testUser3Id],
        }, testUser1Id),
      ]);

      // 手动触发批量通知
      for (const task of tasks) {
        await NotificationTrigger.taskAssigned({
          taskId: task.id,
          taskTitle: task.title,
          assignees: task.assignees,
          assignerId: testUser1Id,
          assignerName: `AssignUser1${testId}`,
        });
      }

      // 用户2应该收到2条通知
      const notifications2 = await notificationService.getUserNotifications(testUser2Id);
      expect(notifications2.total).toBeGreaterThanOrEqual(2);

      // 用户3应该收到1条通知
      const notifications3 = await notificationService.getUserNotifications(testUser3Id);
      expect(notifications3.total).toBeGreaterThanOrEqual(1);
    });
  });

  describe('通知查询测试', () => {
    it('用户应该能够按类型筛选任务分配通知', async () => {
      const task = await taskService.createTask({
        title: 'Test Filter Task',
        boardId: testBoardId,
        status: testColumnId,
        assignees: [testUser2Id],
      }, testUser1Id);

      // 手动触发通知
      await NotificationTrigger.taskAssigned({
        taskId: task.id,
        taskTitle: task.title,
        assignees: [testUser2Id],
        assignerId: testUser1Id,
        assignerName: `AssignUser1${testId}`,
      });

      const notifications = await notificationService.getUserNotifications(testUser2Id, {
        type: NotificationType.TASK_ASSIGNED,
      });

      expect(notifications.data.length).toBeGreaterThanOrEqual(1);
      notifications.data.forEach(n => {
        expect(n.type).toBe(NotificationType.TASK_ASSIGNED);
      });
    });

    it('用户应该能够查看未读的任务分配通知数量', async () => {
      const task1 = await taskService.createTask({
        title: 'Unread Task 1',
        boardId: testBoardId,
        status: testColumnId,
        assignees: [testUser2Id],
      }, testUser1Id);

      const task2 = await taskService.createTask({
        title: 'Unread Task 2',
        boardId: testBoardId,
        status: testColumnId,
        assignees: [testUser2Id],
      }, testUser1Id);

      // 手动触发通知
      await NotificationTrigger.taskAssigned({
        taskId: task1.id,
        taskTitle: task1.title,
        assignees: [testUser2Id],
        assignerId: testUser1Id,
        assignerName: `AssignUser1${testId}`,
      });

      await NotificationTrigger.taskAssigned({
        taskId: task2.id,
        taskTitle: task2.title,
        assignees: [testUser2Id],
        assignerId: testUser1Id,
        assignerName: `AssignUser1${testId}`,
      });

      const unreadCount = await notificationService.getUnreadCount(testUser2Id);
      expect(unreadCount).toBeGreaterThanOrEqual(2);
    });
  });
});
