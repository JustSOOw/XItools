/**
 * 任务对象类型定义
 * 基于MCP服务设计文档中的Task JSON Schema
 */
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
  tags?: string[];
  parentId?: string | null;
  subTasks?: Task[];
  acceptanceCriteria?: string;
  estimatedEffort?: number | null;
  loggedTime?: number | null;
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
export type TaskUpdate = Partial<Omit<Task, 'id' | 'createdAt'>>; 