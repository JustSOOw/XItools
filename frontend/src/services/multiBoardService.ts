/**
 * 多看板系统API服务
 * 处理工作区、项目、看板的API调用
 */

import { Workspace, Project, BoardInfo } from '../store/navigationStore';
import { getBackendUrl } from '../utils/env';

const API_BASE = `${getBackendUrl()}/api`;

// API响应类型
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class MultiBoardService {
  // 工作区相关API
  async getAllWorkspaces(): Promise<Workspace[]> {
    try {
      const response = await fetch(`${API_BASE}/workspaces`);
      const result: ApiResponse<Workspace[]> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || '获取工作区列表失败');
      }
      
      return result.data;
    } catch (error) {
      console.error('获取工作区列表失败:', error);
      throw error;
    }
  }

  async getDefaultWorkspace(): Promise<Workspace | null> {
    try {
      const response = await fetch(`${API_BASE}/workspaces/default`);
      const result: ApiResponse<Workspace> = await response.json();
      
      if (!result.success) {
        return null;
      }
      
      return result.data || null;
    } catch (error) {
      console.error('获取默认工作区失败:', error);
      return null;
    }
  }

  async createWorkspace(data: Omit<Workspace, 'id' | 'type'>): Promise<Workspace> {
    try {
      const response = await fetch(`${API_BASE}/workspaces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result: ApiResponse<Workspace> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || '创建工作区失败');
      }
      
      return result.data;
    } catch (error) {
      console.error('创建工作区失败:', error);
      throw error;
    }
  }

  async updateWorkspace(id: string, data: Partial<Workspace>): Promise<Workspace> {
    try {
      const response = await fetch(`${API_BASE}/workspaces/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result: ApiResponse<Workspace> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || '更新工作区失败');
      }
      
      return result.data;
    } catch (error) {
      console.error('更新工作区失败:', error);
      throw error;
    }
  }

  async deleteWorkspace(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/workspaces/${id}`, {
        method: 'DELETE',
      });
      
      const result: ApiResponse<void> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '删除工作区失败');
      }
    } catch (error) {
      console.error('删除工作区失败:', error);
      throw error;
    }
  }

  // 项目相关API
  async getProjectsByWorkspace(workspaceId: string): Promise<Project[]> {
    try {
      const response = await fetch(`${API_BASE}/workspaces/${workspaceId}/projects`);
      const result: ApiResponse<Project[]> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || '获取项目列表失败');
      }
      
      return result.data;
    } catch (error) {
      console.error('获取项目列表失败:', error);
      throw error;
    }
  }

  async createProject(data: Omit<Project, 'id' | 'type'>): Promise<Project> {
    try {
      const response = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result: ApiResponse<Project> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || '创建项目失败');
      }
      
      return result.data;
    } catch (error) {
      console.error('创建项目失败:', error);
      throw error;
    }
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    try {
      const response = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result: ApiResponse<Project> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || '更新项目失败');
      }
      
      return result.data;
    } catch (error) {
      console.error('更新项目失败:', error);
      throw error;
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'DELETE',
      });
      
      const result: ApiResponse<void> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '删除项目失败');
      }
    } catch (error) {
      console.error('删除项目失败:', error);
      throw error;
    }
  }

  // 看板相关API
  async getBoardsByWorkspace(workspaceId: string): Promise<BoardInfo[]> {
    try {
      const response = await fetch(`${API_BASE}/workspaces/${workspaceId}/boards`);
      const result: ApiResponse<BoardInfo[]> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || '获取工作区看板列表失败');
      }
      
      return result.data;
    } catch (error) {
      console.error('获取工作区看板列表失败:', error);
      throw error;
    }
  }

  async getBoardsByProject(projectId: string): Promise<BoardInfo[]> {
    try {
      const response = await fetch(`${API_BASE}/projects/${projectId}/boards`);
      const result: ApiResponse<BoardInfo[]> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || '获取项目看板列表失败');
      }
      
      return result.data;
    } catch (error) {
      console.error('获取项目看板列表失败:', error);
      throw error;
    }
  }

  async createBoard(data: Omit<BoardInfo, 'id' | 'type'>): Promise<BoardInfo> {
    try {
      const response = await fetch(`${API_BASE}/boards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result: ApiResponse<BoardInfo> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || '创建看板失败');
      }
      
      return result.data;
    } catch (error) {
      console.error('创建看板失败:', error);
      throw error;
    }
  }

  async updateBoard(id: string, data: Partial<BoardInfo>): Promise<BoardInfo> {
    try {
      const response = await fetch(`${API_BASE}/boards/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result: ApiResponse<BoardInfo> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || '更新看板失败');
      }
      
      return result.data;
    } catch (error) {
      console.error('更新看板失败:', error);
      throw error;
    }
  }

  async deleteBoard(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/boards/${id}`, {
        method: 'DELETE',
      });
      
      const result: ApiResponse<void> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '删除看板失败');
      }
    } catch (error) {
      console.error('删除看板失败:', error);
      throw error;
    }
  }

  // 兼容性API - 获取当前看板（用于单看板模式）
  async getCurrentBoard(): Promise<BoardInfo | null> {
    try {
      const response = await fetch(`${API_BASE}/board/current`);
      const result: ApiResponse<BoardInfo> = await response.json();
      
      if (!result.success) {
        return null;
      }
      
      return result.data || null;
    } catch (error) {
      console.error('获取当前看板失败:', error);
      return null;
    }
  }

  // 初始化多看板数据
  async initializeMultiBoardData(): Promise<{
    workspaces: Workspace[];
    projects: Project[];
    boards: BoardInfo[];
  }> {
    try {
      // 并行获取所有数据
      const [workspaces] = await Promise.all([
        this.getAllWorkspaces()
      ]);

      // 获取所有项目和看板
      const allProjects: Project[] = [];
      const allBoards: BoardInfo[] = [];

      for (const workspace of workspaces) {
        const [projects, workspaceBoards] = await Promise.all([
          this.getProjectsByWorkspace(workspace.id),
          this.getBoardsByWorkspace(workspace.id)
        ]);

        allProjects.push(...projects);
        allBoards.push(...workspaceBoards);

        // 获取每个项目下的看板
        for (const project of projects) {
          const projectBoards = await this.getBoardsByProject(project.id);
          allBoards.push(...projectBoards);
        }
      }

      return {
        workspaces,
        projects: allProjects,
        boards: allBoards
      };
    } catch (error) {
      console.error('初始化多看板数据失败:', error);
      throw error;
    }
  }

  // 任务相关API
  async getTasksByBoard(boardId: string): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE}/boards/${boardId}/tasks`);
      const result: ApiResponse<any[]> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || '获取看板任务失败');
      }

      return result.data;
    } catch (error) {
      console.error('获取看板任务失败:', error);
      throw error;
    }
  }
}

export const multiBoardService = new MultiBoardService();
export default multiBoardService;
