import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { commentService } from '../services/commentService';

const prisma = new PrismaClient();

// 生成唯一测试标识
const testId = Date.now().toString();

describe('评论功能测试', () => {
  let testUser1Id: string;
  let testUser2Id: string;
  let testTeamId: string;
  let testMember1Id: string;
  let testMember2Id: string;
  let testWorkspaceId: string;
  let testBoardId: string;
  let testTaskId: string;

  beforeAll(async () => {
    // 创建测试用户1 (团队管理员)
    const user1 = await prisma.user.create({
      data: {
        email: `comment-admin-${testId}@test.com`,
        passwordHash: 'test123',
        username: `CommentAdmin${testId}`,
      },
    });
    testUser1Id = user1.id;

    // 创建测试用户2 (团队成员)
    const user2 = await prisma.user.create({
      data: {
        email: `comment-member-${testId}@test.com`,
        passwordHash: 'test123',
        username: `CommentMember${testId}`,
      },
    });
    testUser2Id = user2.id;

    // 创建测试团队
    const team = await prisma.team.create({
      data: {
        name: 'Test Comment Team',
        ownerId: testUser1Id,
      },
    });
    testTeamId = team.id;

    // 创建团队成员1 (管理员)
    const member1 = await prisma.teamMember.create({
      data: {
        teamId: testTeamId,
        userId: testUser1Id,
        role: 'admin',
      },
    });
    testMember1Id = member1.id;

    // 创建团队成员2 (普通成员)
    const member2 = await prisma.teamMember.create({
      data: {
        teamId: testTeamId,
        userId: testUser2Id,
        role: 'member',
      },
    });
    testMember2Id = member2.id;

    // 创建测试工作区
    const workspace = await prisma.workspace.create({
      data: {
        name: 'Test Comment Workspace',
        ownerId: testUser1Id,
        teamId: testTeamId,
      },
    });
    testWorkspaceId = workspace.id;

    // 创建测试看板
    const board = await prisma.board.create({
      data: {
        name: 'Test Comment Board',
        ownerId: testUser1Id,
        workspaceId: testWorkspaceId,
      },
    });
    testBoardId = board.id;

    // 创建测试任务
    const task = await prisma.task.create({
      data: {
        title: 'Test Task for Comments',
        boardId: testBoardId,
        status: testBoardId,
        ownerId: testUser1Id,
      },
    });
    testTaskId = task.id;
  });

  afterAll(async () => {
    // 清理测试数据
    await prisma.taskComment.deleteMany({
      where: { taskId: testTaskId },
    });

    await prisma.task.deleteMany({
      where: { ownerId: testUser1Id },
    });

    await prisma.board.deleteMany({
      where: { ownerId: testUser1Id },
    });

    await prisma.workspace.deleteMany({
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
    // 清理评论数据
    await prisma.taskComment.deleteMany({
      where: { taskId: testTaskId },
    });
  });

  describe('CommentService', () => {
    describe('createComment - 评论创建', () => {
      it('应该成功创建评论', async () => {
        const comment = await commentService.createComment({
          taskId: testTaskId,
          userId: testUser1Id,
          content: '这是一条测试评论',
        });

        expect(comment).toBeDefined();
        expect(comment.taskId).toBe(testTaskId);
        expect(comment.userId).toBe(testUser1Id);
        expect(comment.content).toBe('这是一条测试评论');
      });

      it('应该拒绝空内容的评论', async () => {
        await expect(
          commentService.createComment({
            taskId: testTaskId,
            userId: testUser1Id,
            content: '',
          })
        ).rejects.toThrow('评论内容不能为空');
      });

      it('应该拒绝超长内容的评论', async () => {
        const longContent = 'a'.repeat(10001);

        await expect(
          commentService.createComment({
            taskId: testTaskId,
            userId: testUser1Id,
            content: longContent,
          })
        ).rejects.toThrow('评论内容不能超过10000个字符');
      });

      it('应该拒绝对不存在的任务评论', async () => {
        await expect(
          commentService.createComment({
            taskId: 'non-existent-task',
            userId: testUser1Id,
            content: '测试评论',
          })
        ).rejects.toThrow();
      });
    });

    describe('getTaskComments - 评论列表查询', () => {
      beforeEach(async () => {
        // 创建多条评论 - 顺序创建以确保时间顺序
        await commentService.createComment({
          taskId: testTaskId,
          userId: testUser1Id,
          content: '第一条评论',
        });
        await commentService.createComment({
          taskId: testTaskId,
          userId: testUser2Id,
          content: '第二条评论',
        });
        await commentService.createComment({
          taskId: testTaskId,
          userId: testUser1Id,
          content: '第三条评论',
        });
      });

      it('应该返回任务的所有评论', async () => {
        const result = await commentService.getTaskComments(testTaskId);

        expect(result.comments).toHaveLength(3);
        expect(result.comments[0].content).toBe('第一条评论');
      });

      it('应该包含评论者的用户信息', async () => {
        const result = await commentService.getTaskComments(testTaskId);

        expect(result.comments[0].user).toBeDefined();
        expect(result.comments[0].user.username).toBe(`CommentAdmin${testId}`);
      });

      it('应该按创建时间正序排列', async () => {
        const result = await commentService.getTaskComments(testTaskId);

        expect(result.comments.length).toBeGreaterThan(1);
        expect(result.comments[0].createdAt.getTime()).toBeLessThanOrEqual(
          result.comments[1].createdAt.getTime()
        );
      });

      it('不存在的任务应返回空数组', async () => {
        const result = await commentService.getTaskComments('non-existent-task');

        expect(result.comments).toHaveLength(0);
      });
    });

    describe('deleteComment - 评论删除权限', () => {
      let comment1Id: string;
      let comment2Id: string;

      beforeEach(async () => {
        // 用户1创建评论
        const comment1 = await commentService.createComment({
          taskId: testTaskId,
          userId: testUser1Id,
          content: '用户1的评论',
        });
        comment1Id = comment1.id;

        // 用户2创建评论
        const comment2 = await commentService.createComment({
          taskId: testTaskId,
          userId: testUser2Id,
          content: '用户2的评论',
        });
        comment2Id = comment2.id;
      });

      it('用户可以删除自己的评论', async () => {
        await commentService.deleteComment(comment1Id, testUser1Id);

        const result = await commentService.getTaskComments(testTaskId);
        expect(result.comments.find(c => c.id === comment1Id)).toBeUndefined();
      });

      it('团队管理员可以删除任何评论', async () => {
        await commentService.deleteComment(comment2Id, testUser1Id);

        const result = await commentService.getTaskComments(testTaskId);
        expect(result.comments.find(c => c.id === comment2Id)).toBeUndefined();
      });

      it('普通成员不能删除他人的评论', async () => {
        await expect(
          commentService.deleteComment(comment1Id, testUser2Id)
        ).rejects.toThrow('只有评论作者或团队管理员可以删除评论');
      });

      it('应该拒绝删除不存在的评论', async () => {
        await expect(
          commentService.deleteComment('non-existent-comment', testUser1Id)
        ).rejects.toThrow('评论不存在');
      });
    });

    describe('checkCanDeleteComment - 删除权限检查', () => {
      let commentId: string;

      beforeEach(async () => {
        const comment = await commentService.createComment({
          taskId: testTaskId,
          userId: testUser2Id,
          content: '测试评论',
        });
        commentId = comment.id;
      });

      it('评论作者应该有删除权限', async () => {
        const result = await commentService.checkCanDeleteComment(
          commentId,
          testUser2Id
        );

        expect(result.canDelete).toBe(true);
      });

      it('团队管理员应该有删除权限', async () => {
        const result = await commentService.checkCanDeleteComment(
          commentId,
          testUser1Id
        );

        expect(result.canDelete).toBe(true);
      });

      it('其他用户不应该有删除权限', async () => {
        // 创建第三个用户
        const user3 = await prisma.user.create({
          data: {
            email: `comment-other-${testId}@test.com`,
            passwordHash: 'test123',
            username: `OtherUser${testId}`,
          },
        });

        const result = await commentService.checkCanDeleteComment(
          commentId,
          user3.id
        );

        expect(result.canDelete).toBe(false);

        // 清理
        await prisma.user.delete({
          where: { id: user3.id },
        });
      });
    });

    describe('评论计数', () => {
      it('应该正确统计任务的评论数量', async () => {
        await Promise.all([
          commentService.createComment({
            taskId: testTaskId,
            userId: testUser1Id,
            content: '评论1',
          }),
          commentService.createComment({
            taskId: testTaskId,
            userId: testUser2Id,
            content: '评论2',
          }),
        ]);

        const count = await prisma.taskComment.count({
          where: { taskId: testTaskId },
        });

        expect(count).toBe(2);
      });
    });

    describe('评论更新时间', () => {
      it('创建评论后应该更新任务的updatedAt时间', async () => {
        const taskBefore = await prisma.task.findUnique({
          where: { id: testTaskId },
        });

        // 等待一小段时间确保时间戳不同
        await new Promise(resolve => setTimeout(resolve, 10));

        await commentService.createComment({
          taskId: testTaskId,
          userId: testUser1Id,
          content: '新评论',
        });

        const taskAfter = await prisma.task.findUnique({
          where: { id: testTaskId },
        });

        expect(taskAfter?.updatedAt.getTime()).toBeGreaterThan(
          taskBefore?.updatedAt.getTime() || 0
        );
      });
    });

    describe('评论内容处理', () => {
      it('应该正确处理特殊字符', async () => {
        const specialContent = '特殊字符：<script>alert("xss")</script> & \' " \n \t';

        const comment = await commentService.createComment({
          taskId: testTaskId,
          userId: testUser1Id,
          content: specialContent,
        });

        expect(comment.content).toBe(specialContent);
      });

      it('应该保留评论中的换行符', async () => {
        const multilineContent = '第一行\n第二行\n第三行';

        const comment = await commentService.createComment({
          taskId: testTaskId,
          userId: testUser1Id,
          content: multilineContent,
        });

        expect(comment.content).toBe(multilineContent);
        expect(comment.content.split('\n')).toHaveLength(3);
      });
    });
  });
});
