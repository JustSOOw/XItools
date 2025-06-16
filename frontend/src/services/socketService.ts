import { io, Socket } from 'socket.io-client';
import useTaskStore from '../store/taskStore';
import { Task } from '../types/Task';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  
  /**
   * 初始化Socket.IO连接
   * @param url 后端MCP服务WebSocket URL
   */
  connect(url: string = 'http://localhost:3000'): void {
    if (this.isConnected && this.socket) return;
    
    try {
      this.socket = io(url, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 5000,
      });
      
      this.setupEventListeners();
    } catch (error) {
      console.error('创建Socket连接失败:', error);
    }
  }
  
  /**
   * 设置WebSocket事件监听器
   */
  private setupEventListeners(): void {
    if (!this.socket) return;
    
    // 连接事件
    this.socket.on('connect', () => {
      console.log('已连接到MCP服务');
      this.isConnected = true;
    });
    
    this.socket.on('disconnect', () => {
      console.log('已断开与MCP服务的连接');
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
    
    // 添加任务事件
    this.socket.on('tasks_added', (tasks: Task[]) => {
      console.log('收到新增任务:', tasks);
      useTaskStore.getState().addTasks(tasks);
    });
    
    // 更新任务事件 - 暂时禁用自动更新，避免干扰乐观更新
    this.socket.on('task_updated', (task: Task) => {
      console.log('收到任务更新（已忽略）:', task.id);
      // 完全禁用WebSocket自动更新，让乐观更新生效
      // useTaskStore.getState().updateTask(task);
    });
    
    // 删除任务事件
    this.socket.on('task_deleted', ({ taskId }: { taskId: string }) => {
      console.log('收到任务删除:', taskId);
      useTaskStore.getState().deleteTask(taskId);
    });

    // 清空所有任务事件
    this.socket.on('tasks_cleared', ({ deletedTaskIds, deletedCount }: { deletedTaskIds: string[]; deletedCount: number }) => {
      console.log('收到任务清空事件:', { deletedCount, deletedTaskIds: deletedTaskIds.slice(0, 3) });
      // 清空所有任务
      useTaskStore.getState().setTasks([]);
    });

    // 列任务重排序事件 - 完全禁用，避免干扰乐观更新
    this.socket.on('column_tasks_reordered', ({ columnId, taskIds }: { columnId: string; taskIds: string[] }) => {
      console.log('收到列任务重排序（已忽略）:', { columnId, taskCount: taskIds.length });
      // 完全禁用，让乐观更新生效
    });

    // 列任务排序事件
    this.socket.on('column_tasks_sorted', ({ columnId, sortOption, tasks }: { columnId: string; sortOption: string; tasks: any[] }) => {
      console.log('收到列任务排序:', { columnId, sortOption, tasksCount: tasks.length });
      // 延迟刷新，避免与其他操作冲突
      setTimeout(() => {
        this.refreshTasks();
      }, 100);
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
      // 动态导入mcpService以避免循环依赖
      const { default: mcpService } = await import('./mcpService');
      const tasks = await mcpService.listTasks();
      useTaskStore.getState().setTasks(tasks);
      console.log('任务列表已刷新');
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