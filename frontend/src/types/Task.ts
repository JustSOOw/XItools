/**
 * 任务对象类型定义
 * 基于MCP服务设计文档中的Task JSON Schema
 */

// 负责人详情类型
export interface AssigneeDetail {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
}

export interface Task {
  // 必填字段
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;

  // 可选字段
  description?: string;
  priority?: 'High' | 'Medium' | 'Low' | null;
  dueDate?: string | null;
  assignee?: string | null;
  assignees?: string[]; // 多人协作：负责人ID列表
  assigneeDetails?: AssigneeDetail[]; // 负责人详细信息（后端自动填充）
  color?: string | null; // 任务卡片颜色
  tags?: string[] | Array<{ id: string; name: string; createdAt: string; updatedAt: string }>;
  parentId?: string | null;
  subTasks?: Task[];
  acceptanceCriteria?: string;
  estimatedEffort?: number | null;
  loggedTime?: number | null;
  sortOrder?: number; // 用于列内排序
  boardId?: string; // 所属看板ID（多级导航系统）
}

/**
 * 创建新任务时的部分任务对象
 * id, createdAt, updatedAt由服务端生成
 */
export type PartialTask = Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * 更新任务时的部分任务对象
 */
export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: string;
  priority?: 'High' | 'Medium' | 'Low' | null;
  dueDate?: string | null;
  assignee?: string | null;
  assignees?: string[];
  color?: string | null;
  tags?: string[] | any[]; // Simplify tags for update
  parentId?: string | null;
  acceptanceCriteria?: string;
  estimatedEffort?: number | null;
  loggedTime?: number | null;
  sortOrder?: number;
  boardId?: string;
}
