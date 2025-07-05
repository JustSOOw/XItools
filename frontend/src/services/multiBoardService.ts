/**
 * 多看板系统API服务
 * 处理工作区、项目、看板的API调用
 */

import { Workspace, Project, BoardInfo } from '../store/navigationStore';
import { apiService, ApiError, ApiResponse } from '../utils/apiClient';
import { log } from '../utils/env';

class MultiBoardService {
  // 工作区相关API
  async getAllWorkspaces(): Promise<Workspace[]> {
    try {
      return await apiService.get<Workspace[]>('/workspaces');
    } catch (error) {
      log.error('获取工作区列表失败:', error);
      throw error;
    }
  }

  async getDefaultWorkspace(): Promise<Workspace | null> {
    try {
      return await apiService.get<Workspace>('/workspaces/default');
    } catch (error) {
      log.error('获取默认工作区失败:', error);
      // 如果是404错误，返回null而不是抛出错误
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      return null;
    }
  }

  async createWorkspace(data: Omit<Workspace, 'id' | 'type'>): Promise<Workspace> {
    try {
      return await apiService.post<Workspace>('/workspaces', data);
    } catch (error) {
      log.error('创建工作区失败:', error);
      throw error;
    }
  }

  async updateWorkspace(id: string, data: Partial<Workspace>): Promise<Workspace> {
    try {
      return await apiService.put<Workspace>(`/workspaces/${id}`, data);
    } catch (error) {
      log.error('更新工作区失败:', error);
      throw error;
    }
  }

  async deleteWorkspace(id: string): Promise<void> {
    try {
      await apiService.delete(`/workspaces/${id}`);
    } catch (error) {
      log.error('删除工作区失败:', error);
      throw error;
    }
  }

  // 项目相关API
  async getProjectsByWorkspace(workspaceId: string): Promise<Project[]> {
    try {
      return await apiService.get<Project[]>(`/workspaces/${workspaceId}/projects`);
    } catch (error) {
      log.error('获取项目列表失败:', error);
      throw error;
    }
  }

  async createProject(data: Omit<Project, 'id' | 'type'>): Promise<Project> {
    try {
      return await apiService.post<Project>('/projects', data);
    } catch (error) {
      log.error('创建项目失败:', error);
      throw error;
    }
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    try {
      return await apiService.put<Project>(`/projects/${id}`, data);
    } catch (error) {
      log.error('更新项目失败:', error);
      throw error;
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      await apiService.delete(`/projects/${id}`);
    } catch (error) {
      log.error('删除项目失败:', error);
      throw error;
    }
  }

  // 看板相关API
  async getBoardsByWorkspace(workspaceId: string): Promise<BoardInfo[]> {
    try {
      return await apiService.get<BoardInfo[]>(`/workspaces/${workspaceId}/boards`);
    } catch (error) {
      log.error('获取工作区看板列表失败:', error);
      throw error;
    }
  }

  async getBoardsByProject(projectId: string): Promise<BoardInfo[]> {
    try {
      return await apiService.get<BoardInfo[]>(`/projects/${projectId}/boards`);
    } catch (error) {
      log.error('获取项目看板列表失败:', error);
      throw error;
    }
  }

  async createBoard(data: Omit<BoardInfo, 'id' | 'type'>): Promise<BoardInfo> {
    try {
      return await apiService.post<BoardInfo>('/boards', data);
    } catch (error) {
      log.error('创建看板失败:', error);
      throw error;
    }
  }

  async updateBoard(id: string, data: Partial<BoardInfo>): Promise<BoardInfo> {
    try {
      return await apiService.put<BoardInfo>(`/boards/${id}`, data);
    } catch (error) {
      log.error('更新看板失败:', error);
      throw error;
    }
  }

  async deleteBoard(id: string): Promise<void> {
    try {
      await apiService.delete(`/boards/${id}`);
    } catch (error) {
      log.error('删除看板失败:', error);
      throw error;
    }
  }

  // 兼容性API - 获取当前看板（用于单看板模式）
  async getCurrentBoard(): Promise<BoardInfo | null> {
    try {
      return await apiService.get<BoardInfo>('/board/current');
    } catch (error) {
      log.error('获取当前看板失败:', error);
      // 如果是404错误，返回null而不是抛出错误
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
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
      return await apiService.get<any[]>(`/boards/${boardId}/tasks`);
    } catch (error) {
      log.error('获取看板任务失败:', error);
      throw error;
    }
  }
}

export const multiBoardService = new MultiBoardService();
export default multiBoardService;
