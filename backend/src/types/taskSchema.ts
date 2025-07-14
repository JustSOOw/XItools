import { z } from 'zod';

// Tag Schema定义
export const tagSchema = z.object({
  id: z.string().uuid().optional().describe('标签的唯一标识符'),
  name: z.string().describe('标签名称'),
});

// 基础任务Schema定义（不包含递归引用）
const baseTaskSchema = z.object({
  id: z.string().uuid().optional().describe('任务的唯一标识符'),
  title: z.string().describe('任务的标题'),
  description: z.string().optional().default('').describe('任务的详细描述（可使用Markdown）'),
  status: z.string().describe('任务的当前状态，对应看板列名'),
  priority: z.enum(['High', 'Medium', 'Low']).nullable().optional().describe('任务的优先级'),
  dueDate: z.string().datetime().nullable().optional().describe('任务的截止日期'),
  assignee: z.string().nullable().optional().describe('任务的负责人'),
  tags: z
    .union([
      z.array(z.string()).describe('与任务相关的标签名称列表'),
      z.array(tagSchema).describe('与任务相关的标签对象列表'),
    ])
    .optional(),
  parentId: z.string().nullable().optional().describe('父任务的ID，如果这是一个子任务'),
  acceptanceCriteria: z.string().default('').optional().describe('任务验收的标准'),
  estimatedEffort: z.number().nullable().optional().describe('估计完成任务所需的工时'),
  loggedTime: z.number().nullable().optional().describe('实际记录的工时'),
  createdAt: z.string().datetime().optional().describe('任务创建的时间'),
  updatedAt: z.string().datetime().optional().describe('任务最后更新的时间'),
});

// 任务Schema定义（包含递归引用）
export const taskSchema: z.ZodType<any> = baseTaskSchema.extend({
  subTasks: z
    .array(z.lazy((): z.ZodType<any> => taskSchema))
    .optional()
    .describe('子任务列表'),
});

// 任务更新Schema - 不允许更新id和创建时间
export const taskUpdateSchema = baseTaskSchema
  .omit({
    id: true,
    createdAt: true,
  })
  .partial();
