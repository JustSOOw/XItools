import { io, Socket } from 'socket.io-client';
import useTaskStore from '../store/taskStore';
import { Task } from '../types/Task';
import { getBackendUrl, log } from '../utils/env';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  /**
   * 初始化Socket.IO连接
   * @param url 后端MCP服务WebSocket URL
   */
  connect(url?: string): void {
    const backendUrl = url || getBackendUrl();
    if (this.isConnected && this.socket) return;

    try {
      log.info('连接到后端服务:', backendUrl);
      this.socket = io(backendUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 5000,
      });

      this.setupEventListeners();
    } catch (error) {
      log.error('创建Socket连接失败:', error);
    }
  }

  /**
   * 设置WebSocket事件监听器
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // 连接事件
    this.socket.on('connect', () => {
      log.info('已连接到MCP服务');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      log.info('已断开与MCP服务的连接');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('连接MCP服务失败:', error);
      this.isConnected = false;
    });

    // MCP服务事件监听
    this.setupTaskEventListeners();
  }

  /**
   * 设置任务相关的事件监听器
   * 根据MCP服务设计文档，监听tasks_added, task_updated, task_deleted事件
   */
  private setupTaskEventListeners(): void {
    if (!this.socket) return;

    // 添加任务事件（MCP 工具创建）
    this.socket.on('tasks_added', (tasks: Task[]) => {
      console.log('收到新增任务 (MCP):', tasks);
      useTaskStore.getState().addTasks(tasks);
    });

    // 批量添加任务事件（前端用户创建）
    this.socket.on('tasks_batch_created', (tasks: Task[]) => {
      console.log('收到批量新增任务 (前端):', tasks);
      useTaskStore.getState().addTasks(tasks);
    });

    // 单个任务创建事件（前端用户创建）
    this.socket.on('task_created', (task: Task) => {
      console.log('收到任务创建 (前端):', task);
      useTaskStore.getState().addTasks([task]);
    });

    // 更新任务事件 - 只更新拖拽无关的属性，避免覆盖乐观更新
    this.socket.on('task_updated', (task: Task) => {
      console.log('收到任务更新:', task.id);
      const localTask = useTaskStore.getState().tasks.find(t => t.id === task.id);

      if (localTask) {
        // 只更新拖拽无关的属性，保留本地的 sortOrder 和 status
        // 这样可以避免 WebSocket 事件覆盖前端的乐观更新导致位置跳变
        const updatedTask = {
          ...task,
          sortOrder: localTask.sortOrder,  // 保留本地排序
          status: localTask.status,        // 保留本地状态（列）
        };
        useTaskStore.getState().updateTask(updatedTask);
        console.log('任务更新（保留本地排序和状态）:', task.id);
      } else {
        // 如果本地没有该任务，直接添加
        useTaskStore.getState().updateTask(task);
        console.log('任务更新（新任务）:', task.id);
      }
    });

    // 删除任务事件
    this.socket.on('task_deleted', ({ taskId }: { taskId: string }) => {
      console.log('收到任务删除:', taskId);
      useTaskStore.getState().deleteTask(taskId);
    });

    // 清空所有任务事件
    this.socket.on(
      'tasks_cleared',
      ({ deletedTaskIds, deletedCount }: { deletedTaskIds: string[]; deletedCount: number }) => {
        console.log('收到任务清空事件:', {
          deletedCount,
          deletedTaskIds: deletedTaskIds.slice(0, 3),
        });
        // 清空所有任务
        useTaskStore.getState().setTasks([]);
      },
    );

    // 列任务重排序事件 - 完全禁用，避免干扰乐观更新
    this.socket.on(
      'column_tasks_reordered',
      ({ columnId, taskIds }: { columnId: string; taskIds: string[] }) => {
        console.log('收到列任务重排序（已忽略）:', { columnId, taskCount: taskIds.length });
        // 完全禁用，让乐观更新生效
      },
    );

    // 列任务排序事件
    this.socket.on(
      'column_tasks_sorted',
      ({ columnId, sortOption, tasks }: { columnId: string; sortOption: string; tasks: any[] }) => {
        console.log('收到列任务排序:', { columnId, sortOption, tasksCount: tasks.length });
        // 延迟刷新，避免与其他操作冲突
        setTimeout(() => {
          this.refreshTasks();
        }, 100);
      },
    );

    // 列管理事件
    this.socket.on('column_created', (column: any) => {
      console.log('收到列创建事件:', column.id);
      useTaskStore.getState().addColumn(column);
    });

    this.socket.on('column_updated', (column: any) => {
      console.log('收到列更新事件:', column.id);
      useTaskStore.getState().updateColumn(column.id, column);
    });

    this.socket.on('column_deleted', ({ columnId }: { columnId: string }) => {
      console.log('收到列删除事件:', columnId);
      useTaskStore.getState().deleteColumn(columnId);
    });
  }

  /**
   * 添加连接成功事件监听
   */
  onConnect(callback: () => void): void {
    if (this.socket) {
      this.socket.on('connect', callback);
    }
  }

  /**
   * 刷新任务列表
   */
  private async refreshTasks(): Promise<void> {
    try {
      // 获取当前选中的看板ID
      const { useNavigationStore } = await import('../store/navigationStore');
      const currentBoardId = useNavigationStore.getState().currentBoardId;

      if (!currentBoardId) {
        console.log('没有选中的看板，跳过任务刷新');
        return;
      }

      // 动态导入taskService以避免循环依赖
      const { default: taskService } = await import('./taskService');
      const tasks = await taskService.getTasksByBoard(currentBoardId);
      useTaskStore.getState().setTasks(tasks);
      console.log('当前看板任务列表已刷新:', currentBoardId);
    } catch (error) {
      console.error('刷新任务列表失败:', error);
    }
  }

  /**
   * 移除连接成功事件监听
   */
  offConnect(callback: () => void): void {
    if (this.socket) {
      this.socket.off('connect', callback);
    }
  }

  /**
   * 添加断开连接事件监听
   */
  onDisconnect(callback: () => void): void {
    if (this.socket) {
      this.socket.on('disconnect', callback);
    }
  }

  /**
   * 移除断开连接事件监听
   */
  offDisconnect(callback: () => void): void {
    if (this.socket) {
      this.socket.off('disconnect', callback);
    }
  }

  /**
   * 添加连接错误事件监听
   */
  onError(callback: (error: Error) => void): void {
    if (this.socket) {
      this.socket.on('connect_error', callback);
    }
  }

  /**
   * 移除连接错误事件监听
   */
  offError(callback: (error: Error) => void): void {
    if (this.socket) {
      this.socket.off('connect_error', callback);
    }
  }

  /**
   * 断开WebSocket连接
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * 检查连接状态
   */
  isConnectedToServer(): boolean {
    return this.isConnected;
  }

  /**
   * 获取Socket实例
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// 创建单例实例
const socketService = new SocketService();
export default socketService;
