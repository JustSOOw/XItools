import { Task, PartialTask, TaskUpdate } from '../types/Task';
import { apiService, mcpApiService, ApiError } from '../utils/apiClient';
import { getBackendUrl, getApiTimeout, log } from '../utils/env';
import { BaseApiService } from './BaseApiService';
import axios from 'axios';

/**
 * TaskService - 任务管理服务
 *
 * 重要说明：
 * - 这个服务用于前端用户操作，使用 REST API + JWT 认证
 * - MCP 协议仅供外部 AI 工具使用（如 Cursor, Claude Desktop）
 * - AI 工具通过 MCP 修改数据后，会通过 WebSocket 通知前端更新
 */
class TaskService extends BaseApiService {
  private baseUrl: string;
  private requestTimeout: number;

  constructor(baseUrl?: string, timeout?: number) {
    super(mcpApiService);
    this.baseUrl = baseUrl || `${getBackendUrl()}/mcp`;
    this.requestTimeout = timeout || getApiTimeout();
  }

  /**
   * @deprecated 此方法仅供 AI 工具使用，前端不应调用
   * 获取任务Schema (MCP工具专用)
   */
  async getTaskSchema() {
    throw new Error('此方法仅供 AI 工具使用，前端不应调用。请使用标准 REST API。');
  }

  /**
   * 提交任务数据集（批量创建任务）
   * 前端直接使用 /api/tasks/batch 端点，而不是 MCP 协议
   * MCP 端点是为外部 AI 工具设计的，需要 API Key 认证
   * @param tasks 要提交的任务列表
   */
  async submitTaskDataset(tasks: PartialTask[]): Promise<Task[]> {
    try {
      // 直接使用 RESTful API，而不是 MCP 协议
      const response = await apiService.post<Task[]>('/tasks/batch', { tasks });
      return response;
    } catch (error) {
      log.error('提交任务数据集失败:', error);
      // 如果后端服务不可用，返回空数组，不抛出错误
      if (this.isServerUnavailableError(error)) {
        return [];
      }
      throw error;
    }
  }

  /**
   * 获取指定看板的任务列表
   * @param boardId 看板ID
   * @param filterOptions 过滤选项
   */
  async getTasksByBoard(boardId: string, filterOptions?: Record<string, any>): Promise<Task[]> {
    try {
      log.debug('开始获取看板任务列表:', { boardId, filterOptions });

      const tasks = await apiService.get<Task[]>(`/boards/${boardId}/tasks`, {
        params: filterOptions || {},
      });

      log.debug('获取看板任务列表成功:', tasks.length);
      return tasks;
    } catch (error) {
      log.error('获取看板任务列表失败:', error);
      // 如果后端服务不可用，返回空数组，不抛出错误
      if (this.isServerUnavailableError(error)) {
        return [];
      }
      throw error;
    }
  }

  /**
   * 获取任务列表
   * 使用 REST API: POST /api/tasks/list
   * @param boardId 看板ID
   * @param filterOptions 过滤选项
   */
  async listTasks(boardId?: string, filterOptions?: Record<string, any>): Promise<Task[]> {
    try {
      console.log('开始获取任务列表，过滤选项:', filterOptions);

      const response = await apiService.post<Task[]>('/tasks/list', {
        boardId: boardId,
        filter_options: filterOptions || {},
      });

      console.log('获取任务列表成功');
      return response;
    } catch (error) {
      console.error('获取任务列表失败:', error);
      // 如果后端服务不可用，返回空数组，不抛出错误
      if (this.isServerUnavailableError(error)) {
        return [];
      }
      throw error;
    }
  }

  /**
   * 获取任务详情
   * 使用 REST API: GET /api/tasks/:id
   * @param taskId 任务ID
   */
  async getTaskDetails(taskId: string): Promise<Task | null> {
    try {
      const task = await apiService.get<Task>(`/tasks/${taskId}`);
      return task;
    } catch (error) {
      console.error('获取任务详情失败:', error);
      // 如果后端服务不可用，返回null
      if (this.isServerUnavailableError(error)) {
        return null;
      }
      throw error;
    }
  }

  /**
   * 更新任务
   * 使用 REST API: PUT /api/tasks/:id
   * @param taskId 任务ID
   * @param updates 要更新的字段
   */
  async updateTask(taskId: string, updates: TaskUpdate): Promise<Task | null> {
    try {
      const task = await apiService.put<Task>(`/tasks/${taskId}`, updates);
      return task;
    } catch (error) {
      console.error('更新任务失败:', error);
      // 如果后端服务不可用，返回null
      if (this.isServerUnavailableError(error)) {
        return null;
      }
      throw error;
    }
  }

  /**
   * 删除任务
   * 使用 REST API: DELETE /api/tasks/:id
   * @param taskId 任务ID
   */
  async deleteTask(taskId: string): Promise<boolean> {
    try {
      await apiService.delete(`/tasks/${taskId}`);
      return true;
    } catch (error) {
      console.error('删除任务失败:', error);
      // 如果后端服务不可用，返回false
      if (this.isServerUnavailableError(error)) {
        return false;
      }
      throw error;
    }
  }

  /**
   * @deprecated 此方法已废弃，仅供开发调试使用
   * 迁移任务状态数据
   */
  async migrateTaskStatus(): Promise<any> {
    throw new Error('此方法已废弃，仅供开发调试使用，前端不应调用');
  }

  /**
   * @deprecated 此方法已废弃，仅供开发调试使用
   * 清空所有任务
   * ⚠️ 注意：此操作不可逆，会删除所有任务数据
   */
  async clearAllTasks(): Promise<any> {
    throw new Error('此方法已废弃，仅供开发调试使用，前端不应调用');
  }

  /**
   * 任务排序（跨列拖拽）
   * 直接调用后端API而不是MCP工具
   */
  async sortTask(
    taskId: string,
    targetId: string,
    columnId: string,
    insertPosition: string = 'before',
  ): Promise<any> {
    try {
      const apiUrl = this.baseUrl.replace('/mcp', '/api/tasks/sort');
      const response = await axios.post(
        apiUrl,
        {
          taskId,
          targetId,
          columnId,
          insertPosition,
        },
        {
          timeout: this.requestTimeout,
          headers: this.headers,
        },
      );

      if (!response.data.success) {
        throw new Error(response.data.error || '任务排序失败');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('任务排序失败:', error);
      // 正确提取axios错误响应中的错误信息
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.message || '任务排序失败');
    }
  }

  /**
   * 列任务排序
   * 对指定列的任务按照指定方式排序
   */
  async sortColumnTasks(columnId: string, sortOption: string): Promise<any> {
    try {
      const apiUrl = this.baseUrl.replace('/mcp', `/api/columns/${columnId}/sort`);
      const response = await axios.post(
        apiUrl,
        {
          sortOption,
        },
        {
          timeout: this.requestTimeout,
          headers: this.headers,
        },
      );

      if (!response.data.success) {
        throw new Error(response.data.error || '列任务排序失败');
      }

      return response.data;
    } catch (error: any) {
      console.error('列任务排序失败:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.message || '列任务排序失败');
    }
  }

  /**
   * 生成随机请求ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * 判断是否为服务器不可用错误
   */
  private isServerUnavailableError(error: any): boolean {
    return (
      !error.response || // 服务器未响应
      error.code === 'ECONNABORTED' || // 请求超时
      error.message.includes('Network Error') // 网络错误
    );
  }
}

// 导出单例实例，使用统一的环境配置
const taskService = new TaskService();
export default taskService;
