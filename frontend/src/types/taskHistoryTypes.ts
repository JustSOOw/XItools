/**
 * 任务历史类型定义
 */

/**
 * 任务历史操作类型
 */
export enum TaskHistoryAction {
    CREATED = 'created',
    UPDATED = 'updated',
    DELETED = 'deleted',
    STATUS_CHANGED = 'status_changed',
    ASSIGNED = 'assigned',
    UNASSIGNED = 'unassigned',
    PRIORITY_CHANGED = 'priority_changed',
    DUE_DATE_CHANGED = 'due_date_changed',
    MOVED = 'moved',
}

/**
 * 任务历史记录
 */
export interface TaskHistory {
    id: string;
    taskId: string;
    userId: string;
    userName?: string;
    action: TaskHistoryAction;
    field?: string;
    oldValue?: string;
    newValue?: string;
    changes?: Record<string, any>;
    createdAt: string;
}

/**
 * 任务历史响应
 */
export interface TaskHistoryResponse {
    success: boolean;
    data: TaskHistory[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

/**
 * 任务字段标签
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
