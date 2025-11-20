import { z } from 'zod';

/**
 * 任务历史操作类型
 */
export enum TaskHistoryAction {
  CREATED = 'created',           // 任务创建
  UPDATED = 'updated',           // 任务更新
  DELETED = 'deleted',           // 任务删除
  STATUS_CHANGED = 'status_changed', // 状态变更
  ASSIGNED = 'assigned',         // 分配负责人
  UNASSIGNED = 'unassigned',     // 取消分配
  PRIORITY_CHANGED = 'priority_changed', // 优先级变更
  DUE_DATE_CHANGED = 'due_date_changed', // 截止日期变更
  MOVED = 'moved',               // 移动到其他看板
}

/**
 * 任务历史记录 DTO
 */
export interface TaskHistoryDTO {
  id: string;
  taskId: string;
  userId: string;
  userName?: string; // 操作者名称（关联查询）
  action: TaskHistoryAction;
  field?: string;
  oldValue?: string;
  newValue?: string;
  changes?: Record<string, any>;
  createdAt: Date;
}

/**
 * 记录任务变更的输入数据
 */
export interface RecordTaskChangeInput {
  taskId: string;
  userId: string;
  action: TaskHistoryAction;
  field?: string;
  oldValue?: any;
  newValue?: any;
  changes?: Record<string, any>;
}

/**
 * 查询任务历史的选项
 */
export interface GetTaskHistoryOptions {
  page?: number;
  pageSize?: number;
  action?: TaskHistoryAction;
}

/**
 * 任务历史列表响应
 */
export interface TaskHistoryResponse {
  data: TaskHistoryDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Zod Schemas
 */

// 记录任务变更的验证 schema
export const recordTaskChangeSchema = z.object({
  taskId: z.string().uuid('任务ID必须是有效的UUID'),
  userId: z.string().uuid('用户ID必须是有效的UUID'),
  action: z.nativeEnum(TaskHistoryAction, {
    errorMap: () => ({ message: '无效的操作类型' })
  }),
  field: z.string().optional(),
  oldValue: z.any().optional(),
  newValue: z.any().optional(),
  changes: z.record(z.any()).optional(),
});

// 查询任务历史的验证 schema
export const getTaskHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1, '页码必须大于等于1').optional().default(1),
  pageSize: z.coerce.number().int().min(1, '每页数量必须大于等于1').max(100, '每页数量不能超过100').optional().default(20),
  action: z.nativeEnum(TaskHistoryAction, {
    errorMap: () => ({ message: '无效的操作类型' })
  }).optional(),
});

/**
 * 任务字段变更描述模板
 */
export const TASK_FIELD_LABELS: Record<string, string> = {
  title: '标题',
  description: '描述',
  status: '状态',
  priority: '优先级',
  dueDate: '截止日期',
  assignees: '负责人',
  color: '颜色',
  parentId: '父任务',
  acceptanceCriteria: '验收标准',
  estimatedEffort: '预估工时',
  loggedTime: '已记录工时',
  sortOrder: '排序',
  boardId: '所属看板',
};

/**
 * 格式化历史记录描述
 */
export function formatHistoryDescription(history: TaskHistoryDTO): string {
  const fieldLabel = history.field ? TASK_FIELD_LABELS[history.field] || history.field : '';

  switch (history.action) {
    case TaskHistoryAction.CREATED:
      return '创建了任务';

    case TaskHistoryAction.DELETED:
      return '删除了任务';

    case TaskHistoryAction.STATUS_CHANGED:
      return `将状态从"${history.oldValue}"更改为"${history.newValue}"`;

    case TaskHistoryAction.ASSIGNED:
      return `分配了负责人`;

    case TaskHistoryAction.UNASSIGNED:
      return `取消分配负责人`;

    case TaskHistoryAction.PRIORITY_CHANGED:
      return `将优先级从"${history.oldValue}"更改为"${history.newValue}"`;

    case TaskHistoryAction.DUE_DATE_CHANGED:
      return `将截止日期从"${history.oldValue}"更改为"${history.newValue}"`;

    case TaskHistoryAction.MOVED:
      return `将任务移动到其他看板`;

    case TaskHistoryAction.UPDATED:
      if (fieldLabel && history.oldValue !== undefined && history.newValue !== undefined) {
        return `将${fieldLabel}从"${history.oldValue}"更改为"${history.newValue}"`;
      }
      return `更新了任务`;

    default:
      return `执行了${history.action}操作`;
  }
}
