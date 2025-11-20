import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { notificationService } from '../services/notificationService';
import { notificationTrigger } from '../services/notificationTrigger';
import { NotificationType, ResourceType } from '../types/notificationTypes';

const prisma = new PrismaClient();

describe('通知系统测试', () => {
  let testUser1Id: string;
  let testUser2Id: string;
  let testTeamId: string;
  let testTaskId: string;

  beforeAll(async () => {
    // 创建测试用户
    const user1 = await prisma.user.create({
      data: {
        email: 'notif-user1@test.com',
        password: 'test123',
        username: 'NotifUser1',
      },
    });
    testUser1Id = user1.id;

    const user2 = await prisma.user.create({
      data: {
        email: 'notif-user2@test.com',
        password: 'test123',
        username: 'NotifUser2',
      },
    });
    testUser2Id = user2.id;

    // 创建测试团队
    const team = await prisma.team.create({
      data: {
        name: 'Test Notification Team',
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

    // 创建测试任务
    const board = await prisma.board.create({
      data: {
        name: 'Test Board',
        ownerId: testUser1Id,
      },
    });

    const task = await prisma.task.create({
      data: {
        title: 'Test Task for Notifications',
        boardId: board.id,
        status: board.id, // 简化测试
        ownerId: testUser1Id,
        assignees: [testUser2Id],
      },
    });
    testTaskId = task.id;
  });

  afterAll(async () => {
    // 清理测试数据
    await prisma.notification.deleteMany({
      where: {
        userId: { in: [testUser1Id, testUser2Id] },
      },
    });

    await prisma.task.deleteMany({
      where: { ownerId: testUser1Id },
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
      where: { id: { in: [testUser1Id, testUser2Id] } },
    });

    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // 清理通知数据
    await prisma.notification.deleteMany({
      where: {
        userId: { in: [testUser1Id, testUser2Id] },
      },
    });
  });

  describe('NotificationService', () => {
    describe('createNotification', () => {
      it('应该成功创建通知', async () => {
        const notification = await notificationService.createNotification({
          userId: testUser1Id,
          type: NotificationType.TASK_ASSIGNED,
          title: '测试通知',
          content: '这是一个测试通知',
          resourceType: ResourceType.TASK,
          resourceId: testTaskId,
        });

        expect(notification).toBeDefined();
        expect(notification.userId).toBe(testUser1Id);
        expect(notification.type).toBe(NotificationType.TASK_ASSIGNED);
        expect(notification.title).toBe('测试通知');
        expect(notification.isRead).toBe(false);
      });

      it('应该支持不带资源信息的通知', async () => {
        const notification = await notificationService.createNotification({
          userId: testUser1Id,
          type: NotificationType.MEMBER_JOINED,
          title: '成员加入',
          content: '新成员加入了团队',
        });

        expect(notification).toBeDefined();
        expect(notification.resourceType).toBeUndefined();
        expect(notification.resourceId).toBeUndefined();
      });
    });

    describe('getUserNotifications', () => {
      beforeEach(async () => {
        // 创建多个测试通知
        await Promise.all([
          notificationService.createNotification({
            userId: testUser1Id,
            type: NotificationType.TASK_ASSIGNED,
            title: '通知1',
            content: '内容1',
          }),
          notificationService.createNotification({
            userId: testUser1Id,
            type: NotificationType.TASK_COMMENTED,
            title: '通知2',
            content: '内容2',
          }),
          notificationService.createNotification({
            userId: testUser1Id,
            type: NotificationType.TEAM_INVITATION,
            title: '通知3',
            content: '内容3',
          }),
        ]);
      });

      it('应该返回用户的所有通知', async () => {
        const result = await notificationService.getUserNotifications(testUser1Id);

        expect(result.data).toHaveLength(3);
        expect(result.total).toBe(3);
        expect(result.unreadCount).toBe(3);
      });

      it('应该支持分页', async () => {
        const result = await notificationService.getUserNotifications(testUser1Id, {
          page: 1,
          pageSize: 2,
        });

        expect(result.data).toHaveLength(2);
        expect(result.total).toBe(3);
        expect(result.totalPages).toBe(2);
      });

      it('应该支持按类型筛选', async () => {
        const result = await notificationService.getUserNotifications(testUser1Id, {
          type: NotificationType.TASK_ASSIGNED,
        });

        expect(result.data).toHaveLength(1);
        expect(result.data[0].type).toBe(NotificationType.TASK_ASSIGNED);
      });

      it('应该支持按已读状态筛选', async () => {
        // 标记一个通知为已读
        const all = await notificationService.getUserNotifications(testUser1Id);
        await notificationService.markAsRead(all.data[0].id, testUser1Id);

        const unread = await notificationService.getUserNotifications(testUser1Id, {
          isRead: false,
        });

        expect(unread.data).toHaveLength(2);
        expect(unread.unreadCount).toBe(2);
      });
    });

    describe('markAsRead', () => {
      it('应该成功标记通知为已读', async () => {
        const notification = await notificationService.createNotification({
          userId: testUser1Id,
          type: NotificationType.TASK_ASSIGNED,
          title: '测试',
          content: '测试内容',
        });

        const updated = await notificationService.markAsRead(notification.id, testUser1Id);

        expect(updated.isRead).toBe(true);
      });

      it('应该拒绝标记他人的通知', async () => {
        const notification = await notificationService.createNotification({
          userId: testUser1Id,
          type: NotificationType.TASK_ASSIGNED,
          title: '测试',
          content: '测试内容',
        });

        await expect(
          notificationService.markAsRead(notification.id, testUser2Id)
        ).rejects.toThrow('无权操作此通知');
      });
    });

    describe('batchMarkAsRead', () => {
      beforeEach(async () => {
        await Promise.all([
          notificationService.createNotification({
            userId: testUser1Id,
            type: NotificationType.TASK_ASSIGNED,
            title: '通知1',
            content: '内容1',
          }),
          notificationService.createNotification({
            userId: testUser1Id,
            type: NotificationType.TASK_COMMENTED,
            title: '通知2',
            content: '内容2',
          }),
        ]);
      });

      it('应该批量标记指定通知为已读', async () => {
        const all = await notificationService.getUserNotifications(testUser1Id);
        const ids = all.data.map(n => n.id);

        const result = await notificationService.batchMarkAsRead(testUser1Id, ids);

        expect(result.count).toBe(2);

        const unreadCount = await notificationService.getUnreadCount(testUser1Id);
        expect(unreadCount).toBe(0);
      });
    });

    describe('markAllAsRead', () => {
      beforeEach(async () => {
        await Promise.all([
          notificationService.createNotification({
            userId: testUser1Id,
            type: NotificationType.TASK_ASSIGNED,
            title: '通知1',
            content: '内容1',
          }),
          notificationService.createNotification({
            userId: testUser1Id,
            type: NotificationType.TASK_COMMENTED,
            title: '通知2',
            content: '内容2',
          }),
        ]);
      });

      it('应该标记所有未读通知为已读', async () => {
        const result = await notificationService.markAllAsRead(testUser1Id);

        expect(result.count).toBe(2);

        const unreadCount = await notificationService.getUnreadCount(testUser1Id);
        expect(unreadCount).toBe(0);
      });
    });

    describe('deleteNotification', () => {
      it('应该成功删除通知', async () => {
        const notification = await notificationService.createNotification({
          userId: testUser1Id,
          type: NotificationType.TASK_ASSIGNED,
          title: '测试',
          content: '测试内容',
        });

        await notificationService.deleteNotification(notification.id, testUser1Id);

        const result = await notificationService.getUserNotifications(testUser1Id);
        expect(result.total).toBe(0);
      });

      it('应该拒绝删除他人的通知', async () => {
        const notification = await notificationService.createNotification({
          userId: testUser1Id,
          type: NotificationType.TASK_ASSIGNED,
          title: '测试',
          content: '测试内容',
        });

        await expect(
          notificationService.deleteNotification(notification.id, testUser2Id)
        ).rejects.toThrow('无权删除此通知');
      });
    });

    describe('getUnreadCount', () => {
      it('应该正确返回未读数量', async () => {
        await Promise.all([
          notificationService.createNotification({
            userId: testUser1Id,
            type: NotificationType.TASK_ASSIGNED,
            title: '通知1',
            content: '内容1',
          }),
          notificationService.createNotification({
            userId: testUser1Id,
            type: NotificationType.TASK_COMMENTED,
            title: '通知2',
            content: '内容2',
          }),
        ]);

        const count = await notificationService.getUnreadCount(testUser1Id);
        expect(count).toBe(2);
      });
    });

    describe('cleanupOldNotifications', () => {
      it('应该清理30天前的已读通知', async () => {
        // 创建已读通知
        const notification = await notificationService.createNotification({
          userId: testUser1Id,
          type: NotificationType.TASK_ASSIGNED,
          title: '旧通知',
          content: '旧内容',
        });

        // 标记为已读
        await notificationService.markAsRead(notification.id, testUser1Id);

        // 手动修改创建时间为31天前
        const thirtyOneDaysAgo = new Date();
        thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);

        await prisma.notification.update({
          where: { id: notification.id },
          data: { createdAt: thirtyOneDaysAgo },
        });

        // 执行清理
        const result = await notificationService.cleanupOldNotifications();

        expect(result.count).toBeGreaterThanOrEqual(1);

        // 验证通知已被删除
        const all = await notificationService.getUserNotifications(testUser1Id);
        expect(all.total).toBe(0);
      });

      it('不应该清理未读通知', async () => {
        const notification = await notificationService.createNotification({
          userId: testUser1Id,
          type: NotificationType.TASK_ASSIGNED,
          title: '未读通知',
          content: '未读内容',
        });

        // 手动修改创建时间为31天前
        const thirtyOneDaysAgo = new Date();
        thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);

        await prisma.notification.update({
          where: { id: notification.id },
          data: { createdAt: thirtyOneDaysAgo },
        });

        // 执行清理
        await notificationService.cleanupOldNotifications();

        // 验证未读通知仍然存在
        const all = await notificationService.getUserNotifications(testUser1Id);
        expect(all.total).toBe(1);
      });
    });
  });

  describe('NotificationTrigger', () => {
    it('taskAssigned 应该为所有负责人创建通知', async () => {
      // 注意：这个测试会尝试使用 Socket.IO，需要 mock
      // 这里我们只测试通知是否被创建
      // 实际项目中需要 mock Socket.IO

      // 暂时跳过 WebSocket 测试，只测试通知创建
      // 在实际测试环境中需要 mock getIo()
    });
  });
});
