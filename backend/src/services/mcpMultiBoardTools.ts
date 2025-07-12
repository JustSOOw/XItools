/**
 * MCP多看板工具扩展
 * 为现有MCP服务添加工作区和项目管理功能
 *
 * 重要原则：
 * - 每个看板都是独立的"列+任务"系统
 * - 任务只能在同一看板内的列之间移动
 * - 工作区和项目只是看板的容器，不干预看板内部逻辑
 * - 保持单看板系统的完整性和独立性
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { workspaceService } from './workspaceService';
import { projectService } from './projectService';
import { boardService } from './boardService';
import { columnService } from './columnService';

/**
 * 注册多看板相关的MCP工具
 * 注意：这些工具只管理工作区、项目和看板的创建，不涉及跨看板操作
 */
export function registerMultiBoardMCPTools(mcpServer: McpServer) {
  /**
   * 工具: get_workspace_structure
   * 获取完整的工作区结构，包括项目、看板和任务
   */
  mcpServer.tool(
    'get_workspace_structure',
    '获取完整的工作区结构，包括项目、看板和任务的层级关系',
    {
      workspaceId: z.string().optional().describe('工作区ID，不提供则返回默认工作区'),
      includeTaskCounts: z.boolean().optional().default(false).describe('是否包含任务统计信息'),
    },
    async (args) => {
      try {
        const { workspaceId, includeTaskCounts } = args;

        let workspace;
        if (workspaceId) {
          workspace = await workspaceService.getWorkspaceById(workspaceId);
        } else {
          workspace = await workspaceService.getDefaultWorkspace();
        }

        if (!workspace) {
          throw new Error('工作区不存在');
        }

        // 如果需要统计信息，添加任务计数
        if (includeTaskCounts) {
          const stats = await workspaceService.getWorkspaceStats(workspace.id);
          (workspace as any).stats = stats;

          // 为每个项目添加统计信息
          for (const project of workspace.projects) {
            const projectStats = await projectService.getProjectStats(project.id);
            (project as any).stats = projectStats;

            // 为每个看板添加统计信息
            for (const board of project.boards) {
              const boardStats = await boardService.getBoardStats(board.id);
              (board as any).stats = boardStats;
            }
          }

          // 为工作区直属看板添加统计信息
          for (const board of workspace.boards) {
            const boardStats = await boardService.getBoardStats(board.id);
            (board as any).stats = boardStats;
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(workspace, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error('获取工作区结构失败:', error);
        throw new Error(
          `获取工作区结构失败: ${error instanceof Error ? error.message : '未知错误'}`,
        );
      }
    },
  );

  /**
   * 工具: create_project_with_boards
   * 创建项目并同时创建多个独立看板
   */
  mcpServer.tool(
    'create_project_with_boards',
    "创建项目并同时创建多个独立看板，每个看板都是完整的'列+任务'系统，适用于快速搭建项目结构",
    {
      projectName: z.string().describe('项目名称'),
      projectDescription: z.string().optional().describe('项目描述'),
      workspaceId: z.string().optional().describe('工作区ID，不提供则使用默认工作区'),
      boards: z
        .array(
          z.object({
            name: z.string().describe('看板名称'),
            description: z.string().optional().describe('看板描述'),
          }),
        )
        .describe('要创建的看板列表，每个看板都使用标准的默认列结构'),
    },
    async (args) => {
      try {
        const { projectName, projectDescription, workspaceId, boards } = args;

        // 确定工作区
        let targetWorkspaceId = workspaceId;
        if (!targetWorkspaceId) {
          const defaultWorkspace = await workspaceService.getDefaultWorkspace();
          if (!defaultWorkspace) {
            const newWorkspace = await workspaceService.ensureDefaultWorkspace();
            targetWorkspaceId = newWorkspace.id;
          } else {
            targetWorkspaceId = defaultWorkspace.id;
          }
        }

        // 创建项目
        const project = await projectService.createProject({
          name: projectName,
          description: projectDescription,
          workspaceId: targetWorkspaceId,
          order: 0,
        }, 'default-user'); // TODO: 需要从上下文获取实际用户ID

        // 创建看板 - 每个看板都使用标准的默认列结构
        const createdBoards = [];
        for (let i = 0; i < boards.length; i++) {
          const boardData = boards[i];
          const board = await boardService.createBoard({
            name: boardData.name,
            description: boardData.description,
            projectId: project.id,
            order: i,
          }, 'default-user'); // TODO: 需要从上下文获取实际用户ID

          // 使用标准的默认列结构（待办、进行中、已完成）
          // boardService.createBoard 已经自动创建了默认列

          createdBoards.push(board);
        }

        // 获取完整的项目信息
        const fullProject = await projectService.getProjectById(project.id);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  project: fullProject,
                  message: `成功创建项目 "${projectName}" 和 ${boards.length} 个看板`,
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        console.error('创建项目和看板失败:', error);
        throw new Error(
          `创建项目和看板失败: ${error instanceof Error ? error.message : '未知错误'}`,
        );
      }
    },
  );

  // 移除危险的跨看板移动功能 - 看板应该保持独立性

  // 移除模板创建功能 - 保持看板创建的简洁性，使用标准的看板创建流程

  console.log('✅ 工作区和项目管理MCP工具注册完成（保持看板独立性）');
}
