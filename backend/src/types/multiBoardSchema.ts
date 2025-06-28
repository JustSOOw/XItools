/**
 * 多看板系统的数据类型定义和验证Schema
 */

import { z } from 'zod';

// 工作区Schema
export const workspaceSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, '工作区名称不能为空').max(100, '工作区名称不能超过100个字符'),
  description: z.string().max(500, '工作区描述不能超过500个字符').optional(),
  isDefault: z.boolean().optional().default(false),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional()
});

export const workspaceUpdateSchema = workspaceSchema.partial().omit({ id: true });

// 项目Schema
export const projectSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, '项目名称不能为空').max(100, '项目名称不能超过100个字符'),
  description: z.string().max(500, '项目描述不能超过500个字符').optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  workspaceId: z.string().uuid('无效的工作区ID'),
  order: z.number().int().min(0, '排序值不能为负数').optional().default(0),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional()
});

export const projectUpdateSchema = projectSchema.partial().omit({ id: true, workspaceId: true });

// 看板基础Schema（不包含验证）
const baseBoardSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, '看板名称不能为空').max(100, '看板名称不能超过100个字符'),
  description: z.string().max(500, '看板描述不能超过500个字符').optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  workspaceId: z.string().uuid('无效的工作区ID').optional(),
  projectId: z.string().uuid('无效的项目ID').optional(),
  order: z.number().int().min(0, '排序值不能为负数').optional().default(0),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional()
});

// 看板Schema（包含验证）
export const boardSchema = baseBoardSchema.refine(
  (data) => {
    // 看板必须属于工作区或项目，但不能同时属于两者
    return (data.workspaceId && !data.projectId) || (!data.workspaceId && data.projectId);
  },
  {
    message: '看板必须属于工作区或项目，但不能同时属于两者',
    path: ['workspaceId', 'projectId']
  }
);

// 看板更新Schema（基于基础Schema，不包含验证）
export const boardUpdateSchema = baseBoardSchema.partial().omit({ id: true });

// 扩展的看板列Schema（添加boardId）
export const extendedBoardColumnSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, '列名不能为空').max(50, '列名不能超过50个字符'),
  order: z.number().int().min(0, '排序值不能为负数'),
  color: z.string().optional(),
  sortOption: z.string().optional().default('manual'),
  isDefault: z.boolean().optional().default(false),
  boardId: z.string().uuid('无效的看板ID'),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional()
});

export const extendedBoardColumnUpdateSchema = extendedBoardColumnSchema.partial().omit({ id: true, boardId: true });

// 扩展的任务Schema（添加boardId）
export const extendedTaskSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, '任务标题不能为空').max(200, '任务标题不能超过200个字符'),
  description: z.string().optional().default(''),
  status: z.string().uuid('无效的状态ID'),
  priority: z.enum(['High', 'Medium', 'Low']).nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  assignee: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  parentId: z.string().uuid().nullable().optional(),
  acceptanceCriteria: z.string().optional().default(''),
  estimatedEffort: z.number().nullable().optional(),
  loggedTime: z.number().nullable().optional(),
  sortOrder: z.number().int().optional().default(0),
  boardId: z.string().uuid('无效的看板ID'),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional()
});

export const extendedTaskUpdateSchema = extendedTaskSchema.partial().omit({ id: true, createdAt: true });

// 层级结构查询Schema
export const hierarchyQuerySchema = z.object({
  workspaceId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  includeBoards: z.boolean().optional().default(true),
  includeTasks: z.boolean().optional().default(false),
  includeColumns: z.boolean().optional().default(false)
});

// 批量操作Schema
export const batchMoveSchema = z.object({
  itemIds: z.array(z.string().uuid()),
  targetWorkspaceId: z.string().uuid().optional(),
  targetProjectId: z.string().uuid().optional(),
  targetBoardId: z.string().uuid().optional()
}).refine(
  (data) => {
    // 至少指定一个目标
    return data.targetWorkspaceId || data.targetProjectId || data.targetBoardId;
  },
  {
    message: '必须指定至少一个目标位置',
    path: ['targetWorkspaceId', 'targetProjectId', 'targetBoardId']
  }
);

// 排序Schema
export const reorderSchema = z.object({
  itemIds: z.array(z.string().uuid()),
  containerId: z.string().uuid() // 容器ID（工作区、项目或看板）
});

// TypeScript类型导出
export type WorkspaceInput = z.infer<typeof workspaceSchema>;
export type WorkspaceUpdate = z.infer<typeof workspaceUpdateSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type ProjectUpdate = z.infer<typeof projectUpdateSchema>;
export type BoardInput = z.infer<typeof boardSchema>;
export type BoardUpdate = z.infer<typeof boardUpdateSchema>;
export type ExtendedBoardColumnInput = z.infer<typeof extendedBoardColumnSchema>;
export type ExtendedBoardColumnUpdate = z.infer<typeof extendedBoardColumnUpdateSchema>;
export type ExtendedTaskInput = z.infer<typeof extendedTaskSchema>;
export type ExtendedTaskUpdate = z.infer<typeof extendedTaskUpdateSchema>;
export type HierarchyQuery = z.infer<typeof hierarchyQuerySchema>;
export type BatchMove = z.infer<typeof batchMoveSchema>;
export type Reorder = z.infer<typeof reorderSchema>;
