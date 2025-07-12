/**
 * 数据迁移服务
 * 用于处理从旧版本到多看板结构的数据迁移
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MigrationService {
  /**
   * 检查是否需要进行数据迁移
   */
  async needsMigration(): Promise<boolean> {
    try {
      // 检查是否存在Workspace表
      const workspaceCount = await prisma.workspace.count();
      return workspaceCount === 0;
    } catch (error) {
      // 如果表不存在，说明需要迁移
      return true;
    }
  }

  /**
   * 执行数据迁移
   */
  async migrate(): Promise<void> {
    console.log('开始执行数据迁移...');

    try {
      // 1. 创建默认工作区（如果不存在）
      let defaultWorkspace = await prisma.workspace.findFirst({
        where: { isDefault: true },
      });

      if (!defaultWorkspace) {
        defaultWorkspace = await prisma.workspace.create({
          data: {
            name: '默认工作区',
            description: '系统默认工作区',
            isDefault: true,
          },
        });
        console.log('✅ 创建默认工作区');
      }

      // 2. 检查是否存在没有boardId的任务或列
      const tasksWithoutBoard = await prisma.task.count({
        where: { boardId: null },
      });

      const columnsWithoutBoard = await prisma.boardColumn.count({
        where: { boardId: null },
      });

      if (tasksWithoutBoard > 0 || columnsWithoutBoard > 0) {
        // 3. 创建默认看板
        const defaultBoard = await prisma.board.create({
          data: {
            name: '默认看板',
            description: '从旧版本迁移的默认看板',
            workspaceId: defaultWorkspace.id,
            order: 0,
          },
        });
        console.log('✅ 创建默认看板');

        // 4. 迁移现有的列到默认看板
        if (columnsWithoutBoard > 0) {
          await prisma.boardColumn.updateMany({
            where: { boardId: null },
            data: { boardId: defaultBoard.id },
          });
          console.log(`✅ 迁移 ${columnsWithoutBoard} 个列到默认看板`);
        }

        // 5. 迁移现有的任务到默认看板
        if (tasksWithoutBoard > 0) {
          await prisma.task.updateMany({
            where: { boardId: null },
            data: { boardId: defaultBoard.id },
          });
          console.log(`✅ 迁移 ${tasksWithoutBoard} 个任务到默认看板`);
        }
      }

      console.log('✅ 数据迁移完成');
    } catch (error) {
      console.error('❌ 数据迁移失败:', error);
      throw error;
    }
  }

  /**
   * 验证迁移结果
   */
  async validateMigration(): Promise<boolean> {
    try {
      // 检查是否存在默认工作区
      const defaultWorkspace = await prisma.workspace.findFirst({
        where: { isDefault: true },
      });

      if (!defaultWorkspace) {
        console.error('❌ 验证失败: 未找到默认工作区');
        return false;
      }

      // 检查是否还有没有boardId的任务或列
      const tasksWithoutBoard = await prisma.task.count({
        where: { boardId: null },
      });

      const columnsWithoutBoard = await prisma.boardColumn.count({
        where: { boardId: null },
      });

      if (tasksWithoutBoard > 0 || columnsWithoutBoard > 0) {
        console.error(
          `❌ 验证失败: 还有 ${tasksWithoutBoard} 个任务和 ${columnsWithoutBoard} 个列没有关联到看板`,
        );
        return false;
      }

      // 检查所有看板是否都有有效的父级关系
      const boardsWithoutParent = await prisma.board.count({
        where: {
          AND: [{ workspaceId: null }, { projectId: null }],
        },
      });

      if (boardsWithoutParent > 0) {
        console.error(`❌ 验证失败: 有 ${boardsWithoutParent} 个看板没有父级关系`);
        return false;
      }

      console.log('✅ 迁移验证通过');
      return true;
    } catch (error) {
      console.error('❌ 迁移验证失败:', error);
      return false;
    }
  }

  /**
   * 获取迁移状态信息
   */
  async getMigrationStatus(): Promise<{
    workspaces: number;
    projects: number;
    boards: number;
    tasks: number;
    columns: number;
  }> {
    const [workspaces, projects, boards, tasks, columns] = await Promise.all([
      prisma.workspace.count(),
      prisma.project.count(),
      prisma.board.count(),
      prisma.task.count(),
      prisma.boardColumn.count(),
    ]);

    return {
      workspaces,
      projects,
      boards,
      tasks,
      columns,
    };
  }
}

export const migrationService = new MigrationService();
