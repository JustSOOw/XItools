import { z } from 'zod';

// 任务Schema定义
export const taskSchema = z.object({
  id: z.string().uuid().describe('任务的唯一标识符'),
  title: z.string().describe('任务的标题'),
  description: z.string().optional().describe('任务的详细描述（可使用Markdown）'),
  status: z.string().describe('任务的当前状态，对应看板列名'),
  priority: z.enum(['High', 'Medium', 'Low']).nullable().describe('任务的优先级'),
  dueDate: z.string().datetime().nullable().describe('任务的截止日期'),
  assignee: z.string().nullable().describe('任务的负责人'),
  tags: z.array(z.string()).describe('与任务相关的标签列表'),
  parentId: z.string().nullable().describe('父任务的ID，如果这是一个子任务'),
  subTasks: z.array(z.lazy(() => taskSchema)).describe('子任务列表'),
  acceptanceCriteria: z.string().describe('任务验收的标准'),
  estimatedEffort: z.number().nullable().describe('估计完成任务所需的工时'),
  loggedTime: z.number().nullable().describe('实际记录的工时'),
  createdAt: z.string().datetime().describe('任务创建的时间'),
  updatedAt: z.string().datetime().describe('任务最后更新的时间')
});

// 任务更新Schema - 不允许更新id和创建时间
export const taskUpdateSchema = taskSchema.omit({ 
  id: true, 
  createdAt: true,
  subTasks: true // 子任务通过专门的接口管理
}).partial(); 