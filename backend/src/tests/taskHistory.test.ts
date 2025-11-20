import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { taskHistoryService } from '../services/taskHistoryService';
import { TaskHistoryAction } from '../types/taskHistoryTypes';

const prisma = new PrismaClient();

describe('任务历史系统测试', () => {
  let testUserId: string;
  let testBoardId: string;
  let testTaskId: string;

  beforeAll(async () => {
    // 创建测试用户
    const user = await prisma.user.create({
      data: {
        email: 'taskhistory-user@test.com',
        password: 'test123',
        username: 'TaskHistoryUser',
      },
    });
    testUserId = user.id;

    // 创建测试看板
    const board = await prisma.board.create({
      data: {
        name: 'Test Board for History',
        ownerId: testUserId,
      },
    });
    testBoardId = board.id;

    // 创建测试任务
    const task = await prisma.task.create({
      data: {
        title: 'Test Task for History',
        boardId: testBoardId,
        status: testBoardId,
        ownerId: testUserId,
      },
    });
    testTaskId = task.id;
  });

  afterAll(async () => {
    // 清理测试数据
    await prisma.taskHistory.deleteMany({
      where: { taskId: testTaskId },
    });

    await prisma.task.deleteMany({
      where: { ownerId: testUserId },
    });

    await prisma.board.deleteMany({
      where: { ownerId: testUserId },
    });

    await prisma.user.delete({
      where: { id: testUserId },
    });

    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // 清理历史记录
    await prisma.taskHistory.deleteMany({
      where: { taskId: testTaskId },
    });
  });

  describe('TaskHistoryService', () => {
    describe('recordTaskChange', () => {
      it('应该成功记录任务创建历史', async () => {
        const history = await taskHistoryService.recordTaskChange({
          taskId: testTaskId,
          userId: testUserId,
          action: TaskHistoryAction.CREATED,
          changes: {
            title: 'Test Task',
            status: 'todo',
          },
        });

        expect(history).toBeDefined();
        expect(history.taskId).toBe(testTaskId);
        expect(history.userId).toBe(testUserId);
        expect(history.action).toBe(TaskHistoryAction.CREATED);
      });

      it('应该成功记录字段变更历史', async () => {
        const history = await taskHistoryService.recordTaskChange({
          taskId: testTaskId,
          userId: testUserId,
          action: TaskHistoryAction.STATUS_CHANGED,
          field: 'status',
          oldValue: 'todo',
          newValue: 'doing',
        });

        expect(history).toBeDefined();
        expect(history.field).toBe('status');
        expect(history.oldValue).toBe('todo');
        expect(history.newValue).toBe('doing');
      });

      it('应该正确处理复杂对象值', async () => {
        const history = await taskHistoryService.recordTaskChange({
          taskId: testTaskId,
          userId: testUserId,
          action: TaskHistoryAction.ASSIGNED,
          field: 'assignees',
          oldValue: ['user1'],
          newValue: ['user1', 'user2'],
        });

        expect(history).toBeDefined();
        expect(history.oldValue).toBe(JSON.stringify(['user1']));
        expect(history.newValue).toBe(JSON.stringify(['user1', 'user2']));
      });
    });

    describe('getTaskHistory', () => {
      beforeEach(async () => {
        // 创建多条历史记录
        await Promise.all([
          taskHistoryService.recordTaskChange({
            taskId: testTaskId,
            userId: testUserId,
            action: TaskHistoryAction.CREATED,
          }),
          taskHistoryService.recordTaskChange({
            taskId: testTaskId,
            userId: testUserId,
            action: TaskHistoryAction.STATUS_CHANGED,
            field: 'status',
            oldValue: 'todo',
            newValue: 'doing',
          }),
          taskHistoryService.recordTaskChange({
            taskId: testTaskId,
            userId: testUserId,
            action: TaskHistoryAction.PRIORITY_CHANGED,
            field: 'priority',
            oldValue: 'Low',
            newValue: 'High',
          }),
        ]);
      });

      it('应该返回任务的所有历史记录', async () => {
        const result = await taskHistoryService.getTaskHistory(testTaskId);

        expect(result.data).toHaveLength(3);
        expect(result.total).toBe(3);
      });

      it('应该支持分页', async () => {
        const result = await taskHistoryService.getTaskHistory(testTaskId, {
          page: 1,
          pageSize: 2,
        });

        expect(result.data).toHaveLength(2);
        expect(result.total).toBe(3);
        expect(result.totalPages).toBe(2);
      });

      it('应该支持按操作类型筛选', async () => {
        const result = await taskHistoryService.getTaskHistory(testTaskId, {
          action: TaskHistoryAction.STATUS_CHANGED,
        });

        expect(result.data).toHaveLength(1);
        expect(result.data[0].action).toBe(TaskHistoryAction.STATUS_CHANGED);
      });

      it('应该按时间倒序返回', async () => {
        const result = await taskHistoryService.getTaskHistory(testTaskId);

        expect(result.data.length).toBeGreaterThan(1);
        // 最新的记录在前面
        expect(result.data[0].createdAt.getTime()).toBeGreaterThanOrEqual(
          result.data[1].createdAt.getTime()
        );
      });
    });

    describe('detectChanges', () => {
      it('应该正确检测字段变更', () => {
        const oldTask = {
          title: 'Old Title',
          description: 'Old Description',
          status: 'todo',
          priority: 'Low',
          assignees: ['user1'],
        };

        const newTask = {
          title: 'New Title',
          description: 'Old Description',
          status: 'doing',
          priority: 'Low',
          assignees: ['user1', 'user2'],
        };

        const changes = taskHistoryService.detectChanges(oldTask, newTask);

        expect(changes).toHaveLength(3);

        const titleChange = changes.find(c => c.field === 'title');
        expect(titleChange).toBeDefined();
        expect(titleChange?.oldValue).toBe('Old Title');
        expect(titleChange?.newValue).toBe('New Title');

        const statusChange = changes.find(c => c.field === 'status');
        expect(statusChange).toBeDefined();

        const assigneesChange = changes.find(c => c.field === 'assignees');
        expect(assigneesChange).toBeDefined();
      });

      it('应该忽略未变更的字段', () => {
        const oldTask = {
          title: 'Same Title',
          description: 'Same Description',
          status: 'todo',
        };

        const newTask = {
          title: 'Same Title',
          description: 'Same Description',
          status: 'todo',
        };

        const changes = taskHistoryService.detectChanges(oldTask, newTask);

        expect(changes).toHaveLength(0);
      });

      it('应该正确处理日期变更', () => {
        const oldDate = new Date('2025-01-01');
        const newDate = new Date('2025-01-02');

        const oldTask = {
          dueDate: oldDate,
        };

        const newTask = {
          dueDate: newDate,
        };

        const changes = taskHistoryService.detectChanges(oldTask, newTask);

        expect(changes).toHaveLength(1);
        expect(changes[0].field).toBe('dueDate');
      });
    });

    describe('cleanupOldHistory', () => {
      it('应该清理90天前的历史记录', async () => {
        // 创建一条历史记录
        const history = await taskHistoryService.recordTaskChange({
          taskId: testTaskId,
          userId: testUserId,
          action: TaskHistoryAction.CREATED,
        });

        // 手动修改创建时间为91天前
        const ninetyOneDaysAgo = new Date();
        ninetyOneDaysAgo.setDate(ninetyOneDaysAgo.getDate() - 91);

        await prisma.taskHistory.update({
          where: { id: history.id },
          data: { createdAt: ninetyOneDaysAgo },
        });

        // 执行清理
        const result = await taskHistoryService.cleanupOldHistory();

        expect(result.count).toBeGreaterThanOrEqual(1);

        // 验证记录已被删除
        const remaining = await taskHistoryService.getTaskHistory(testTaskId);
        expect(remaining.total).toBe(0);
      });

      it('不应该清理90天内的历史记录', async () => {
        await taskHistoryService.recordTaskChange({
          taskId: testTaskId,
          userId: testUserId,
          action: TaskHistoryAction.CREATED,
        });

        // 执行清理
        await taskHistoryService.cleanupOldHistory();

        // 验证记录仍然存在
        const remaining = await taskHistoryService.getTaskHistory(testTaskId);
        expect(remaining.total).toBe(1);
      });
    });

    describe('getUserTaskHistory', () => {
      beforeEach(async () => {
        // 为当前用户创建历史记录
        await taskHistoryService.recordTaskChange({
          taskId: testTaskId,
          userId: testUserId,
          action: TaskHistoryAction.CREATED,
        });

        await taskHistoryService.recordTaskChange({
          taskId: testTaskId,
          userId: testUserId,
          action: TaskHistoryAction.STATUS_CHANGED,
          field: 'status',
          oldValue: 'todo',
          newValue: 'doing',
        });
      });

      it('应该返回用户的所有操作历史', async () => {
        const result = await taskHistoryService.getUserTaskHistory(testUserId);

        expect(result.data.length).toBeGreaterThanOrEqual(2);
      });

      it('应该支持分页和筛选', async () => {
        const result = await taskHistoryService.getUserTaskHistory(testUserId, {
          page: 1,
          pageSize: 1,
          action: TaskHistoryAction.CREATED,
        });

        expect(result.data).toHaveLength(1);
        expect(result.data[0].action).toBe(TaskHistoryAction.CREATED);
      });
    });
  });
});
