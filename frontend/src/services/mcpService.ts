import { Task, PartialTask, TaskUpdate } from '../types/Task';
import { apiService, mcpApiService, ApiError } from '../utils/apiClient';
import { getBackendUrl, getApiTimeout, log } from '../utils/env';
import { BaseApiService } from './BaseApiService';
import axios from 'axios';

/**
 * MCP服务客户端
 * 提供调用MCP工具的方法，与后端MCP服务交互
 */
class McpService extends BaseApiService {
  private baseUrl: string;
  private requestTimeout: number;

  constructor(baseUrl?: string, timeout?: number) {
    super(mcpApiService);
    this.baseUrl = baseUrl || `${getBackendUrl()}/mcp`;
    this.requestTimeout = timeout || getApiTimeout();
  }

  /**
   * 获取任务Schema
   * 对应MCP工具: get_task_schema
   */
  async getTaskSchema() {
    try {
      const response = await mcpApiService.post(
        '',
        {
          jsonrpc: '2.0',
          method: 'get_task_schema',
          params: {},
          id: this.generateRequestId(),
        },
        { skipErrorHandling: true },
      );

      if (response.error) {
        log.error('MCP工具调用错误:', response.error);
        throw new Error(response.error.message);
      }

      return response.result?.content?.[0]?.text
        ? JSON.parse(response.result.content[0].text)
        : response.result;
    } catch (error) {
      log.error('获取任务Schema失败:', error);
      throw error;
    }
  }

  /**
   * 提交任务数据集
   * 对应MCP工具: submit_task_dataset
   * @param tasks 要提交的任务列表
   */
  async submitTaskDataset(tasks: PartialTask[]): Promise<Task[]> {
    try {
      const response = await mcpApiService.post(
        '',
        {
          jsonrpc: '2.0',
          method: 'submit_task_dataset',
          params: { tasks },
          id: this.generateRequestId(),
        },
        { skipErrorHandling: true },
      );

      if (response.error) {
        log.error('MCP工具调用错误:', response.error);
        return [];
      }

      return response.result?.content?.[0]?.text
        ? JSON.parse(response.result.content[0].text)
        : response.result || [];
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
   * 对应MCP工具: list_tasks
   * @param boardId 看板ID
   * @param filterOptions 过滤选项
   */
  async listTasks(boardId?: string, filterOptions?: Record<string, any>): Promise<Task[]> {
    try {
      console.log('开始获取任务列表，过滤选项:', filterOptions);

      // 首先尝试使用直接API端点
      try {
        console.log('尝试使用直接API端点获取任务列表');
        const apiUrl = this.baseUrl.replace('/mcp', '/api/tasks/list');
        const directApiResponse = await axios.post(
          apiUrl,
          {
            boardId: boardId,
            filter_options: filterOptions || {},
          },
          {
            timeout: this.requestTimeout,
            headers: this.headers,
          },
        );

        if (directApiResponse.data && directApiResponse.data.success) {
          console.log('使用直接API端点获取任务列表成功');
          return directApiResponse.data.data;
        }
      } catch (directApiError) {
        console.error('直接API端点获取任务列表失败，尝试MCP方法:', directApiError);
      }

      // 如果直接API失败，回退到MCP方法
      console.log('尝试使用MCP方法获取任务列表');
      const response = await axios.post(
        this.baseUrl,
        {
          jsonrpc: '2.0',
          method: 'list_tasks',
          params: {
            boardId: boardId,
            filter_options: filterOptions || {},
          },
          id: this.generateRequestId(),
        },
        {
          timeout: this.requestTimeout,
          headers: this.headers,
        },
      );

      if (response.data.error) {
        console.error('MCP工具调用错误:', response.data.error);
        return [];
      }

      return response.data.result?.content?.[0]?.text
        ? JSON.parse(response.data.result.content[0].text)
        : response.data.result || [];
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
   * 对应MCP工具: get_task_details
   * @param taskId 任务ID
   */
  async getTaskDetails(taskId: string): Promise<Task | null> {
    try {
      const response = await axios.post(
        this.baseUrl,
        {
          jsonrpc: '2.0',
          method: 'get_task_details',
          params: { task_id: taskId },
          id: this.generateRequestId(),
        },
        {
          timeout: this.requestTimeout,
          headers: this.headers,
        },
      );

      if (response.data.error) {
        console.error('MCP工具调用错误:', response.data.error);
        return null;
      }

      return response.data.result?.content?.[0]?.text
        ? JSON.parse(response.data.result.content[0].text)
        : response.data.result;
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
   * 对应MCP工具: update_task
   * @param taskId 任务ID
   * @param updates 要更新的字段
   */
  async updateTask(taskId: string, updates: TaskUpdate): Promise<Task | null> {
    try {
      const response = await axios.post(
        this.baseUrl,
        {
          jsonrpc: '2.0',
          method: 'update_task',
          params: { task_id: taskId, updates },
          id: this.generateRequestId(),
        },
        {
          timeout: this.requestTimeout,
          headers: this.headers,
        },
      );

      if (response.data.error) {
        console.error('MCP工具调用错误:', response.data.error);
        return null;
      }

      return response.data.result?.content?.[0]?.text
        ? JSON.parse(response.data.result.content[0].text)
        : response.data.result;
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
   * 对应MCP工具: delete_task
   * @param taskId 任务ID
   */
  async deleteTask(taskId: string): Promise<boolean> {
    try {
      const response = await axios.post(
        this.baseUrl,
        {
          jsonrpc: '2.0',
          method: 'delete_task',
          params: { task_id: taskId },
          id: this.generateRequestId(),
        },
        {
          timeout: this.requestTimeout,
          headers: this.headers,
        },
      );

      return response.data.result;
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
   * 迁移任务状态数据
   * 对应MCP工具: migrate_task_status
   */
  async migrateTaskStatus(): Promise<any> {
    try {
      const response = await axios.post(
        this.baseUrl,
        {
          jsonrpc: '2.0',
          method: 'migrate_task_status',
          params: {},
          id: this.generateRequestId(),
        },
        {
          timeout: this.requestTimeout,
          headers: this.headers,
        },
      );

      console.log('数据迁移成功:', response.data.result);
      return response.data.result;
    } catch (error) {
      console.error('数据迁移失败:', error);
      throw error;
    }
  }

  /**
   * 更新任务颜色
   * 对应MCP工具: update_task_color
   */
  async updateTaskColor(taskId: string, color: string): Promise<any> {
    try {
      const response = await axios.post(
        this.baseUrl,
        {
          jsonrpc: '2.0',
          method: 'update_task_color',
          params: {
            task_id: taskId,
            color: color,
          },
          id: this.generateRequestId(),
        },
        {
          timeout: this.requestTimeout,
          headers: this.headers,
        },
      );

      console.log('任务颜色更新成功:', response.data.result);
      return response.data.result;
    } catch (error) {
      console.error('任务颜色更新失败:', error);
      throw error;
    }
  }

  /**
   * 清空所有任务
   * 对应MCP工具: clear_all_tasks
   * ⚠️ 注意：此操作不可逆，会删除所有任务数据
   */
  async clearAllTasks(): Promise<any> {
    try {
      const response = await axios.post(
        this.baseUrl,
        {
          jsonrpc: '2.0',
          method: 'clear_all_tasks',
          params: {},
          id: this.generateRequestId(),
        },
        {
          timeout: this.requestTimeout,
          headers: this.headers,
        },
      );

      console.log('清空所有任务成功:', response.data.result);
      return response.data.result;
    } catch (error) {
      console.error('清空所有任务失败:', error);
      throw error;
    }
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
const mcpService = new McpService();
export default mcpService;
