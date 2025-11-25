/**
 * 导航状态管理
 * 管理工作区、项目、看板的导航状态
 */

import { create } from 'zustand';

// 导航项类型
export interface NavigationItem {
  id: string;
  name: string;
  type: 'workspace' | 'project' | 'board';
  parentId?: string;
  order?: number;
  color?: string;
  icon?: string;
}

// 工作区类型
export interface Workspace extends NavigationItem {
  type: 'workspace';
  isDefault: boolean;
  description?: string;
  teamId?: string; // 所属团队ID
}

// 项目类型
export interface Project extends NavigationItem {
  type: 'project';
  workspaceId: string;
  description?: string;
}

// 看板类型
export interface BoardInfo extends NavigationItem {
  type: 'board';
  workspaceId?: string;
  projectId?: string;
  description?: string;
}

// 导航状态接口
interface NavigationState {
  // 数据
  workspaces: Workspace[];
  projects: Project[];
  boards: BoardInfo[];

  // 当前选中状态
  currentWorkspaceId: string | null;
  currentProjectId: string | null;
  currentBoardId: string | null;

  // UI状态
  isSidebarCollapsed: boolean;
  expandedProjects: Set<string>;
  expandedWorkspaces: Set<string>;

  // 加载状态
  isLoading: boolean;

  // Actions - 数据管理
  setWorkspaces: (workspaces: Workspace[]) => void;
  setProjects: (projects: Project[]) => void;
  setBoards: (boards: BoardInfo[]) => void;

  addWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;

  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  addBoard: (board: BoardInfo) => void;
  updateBoard: (id: string, updates: Partial<BoardInfo>) => void;
  deleteBoard: (id: string) => void;

  // Actions - 导航控制
  selectWorkspace: (workspaceId: string) => void;
  selectProject: (projectId: string) => void;
  selectBoard: (boardId: string) => void;

  // Actions - UI控制
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleProjectExpanded: (projectId: string) => void;
  toggleWorkspaceExpanded: (workspaceId: string) => void;

  // Actions - 工具方法
  getCurrentWorkspace: () => Workspace | null;
  getCurrentProject: () => Project | null;
  getCurrentBoard: () => BoardInfo | null;
  getProjectsByWorkspace: (workspaceId: string) => Project[];
  getBoardsByProject: (projectId: string) => BoardInfo[];
  getBoardsByWorkspace: (workspaceId: string) => BoardInfo[];

  // 初始化
  initialize: () => Promise<void>;

  // API操作方法
  createWorkspace: (data: { name: string; description?: string; teamId?: string }) => Promise<void>;
  renameWorkspace: (id: string, name: string) => Promise<void>;
  removeWorkspace: (id: string) => Promise<void>;

  createProject: (
    workspaceId: string,
    data: { name: string; description?: string },
  ) => Promise<void>;
  renameProject: (id: string, name: string) => Promise<void>;
  removeProject: (id: string) => Promise<void>;

  createBoard: (data: {
    name: string;
    description?: string;
    workspaceId?: string;
    projectId?: string;
  }) => Promise<void>;
  renameBoard: (id: string, name: string) => Promise<void>;
  removeBoard: (id: string) => Promise<void>;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  // 初始状态
  workspaces: [],
  projects: [],
  boards: [],

  currentWorkspaceId: null,
  currentProjectId: null,
  currentBoardId: null,

  isSidebarCollapsed: false,
  expandedProjects: new Set(),
  expandedWorkspaces: new Set(),

  isLoading: false,

  // 数据管理 Actions
  setWorkspaces: (workspaces) => set({ workspaces }),
  setProjects: (projects) => set({ projects }),
  setBoards: (boards) => set({ boards }),

  addWorkspace: (workspace) =>
    set((state) => ({
      workspaces: [...state.workspaces, workspace],
    })),

  updateWorkspace: (id, updates) =>
    set((state) => ({
      workspaces: state.workspaces.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    })),

  deleteWorkspace: (id) =>
    set((state) => ({
      workspaces: state.workspaces.filter((w) => w.id !== id),
      projects: state.projects.filter((p) => p.workspaceId !== id),
      boards: state.boards.filter((b) => b.workspaceId !== id),
      currentWorkspaceId: state.currentWorkspaceId === id ? null : state.currentWorkspaceId,
    })),

  addProject: (project) =>
    set((state) => ({
      projects: [...state.projects, project],
    })),

  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      boards: state.boards.filter((b) => b.projectId !== id),
      currentProjectId: state.currentProjectId === id ? null : state.currentProjectId,
    })),

  addBoard: (board) =>
    set((state) => ({
      boards: [...state.boards, board],
    })),

  updateBoard: (id, updates) =>
    set((state) => ({
      boards: state.boards.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    })),

  deleteBoard: (id) =>
    set((state) => ({
      boards: state.boards.filter((b) => b.id !== id),
      currentBoardId: state.currentBoardId === id ? null : state.currentBoardId,
    })),

  // 导航控制 Actions
  selectWorkspace: (workspaceId) =>
    set((state) => ({
      currentWorkspaceId: workspaceId,
      currentProjectId: null,
      currentBoardId: null,
      expandedWorkspaces: new Set([...state.expandedWorkspaces, workspaceId]),
    })),

  selectProject: (projectId) => {
    const project = get().projects.find((p) => p.id === projectId);
    if (project) {
      set((state) => ({
        currentWorkspaceId: project.workspaceId,
        currentProjectId: projectId,
        currentBoardId: null,
        expandedWorkspaces: new Set([...state.expandedWorkspaces, project.workspaceId]),
        expandedProjects: new Set([...state.expandedProjects, projectId]),
      }));
    }
  },

  selectBoard: (boardId) => {
    const board = get().boards.find((b) => b.id === boardId);
    if (board) {
      set((state) => {
        const updates: any = {
          currentBoardId: boardId,
          expandedWorkspaces: new Set(state.expandedWorkspaces),
          expandedProjects: new Set(state.expandedProjects),
        };

        if (board.workspaceId) {
          updates.currentWorkspaceId = board.workspaceId;
          updates.expandedWorkspaces.add(board.workspaceId);
        }

        if (board.projectId) {
          updates.currentProjectId = board.projectId;
          updates.expandedProjects.add(board.projectId);
        } else {
          updates.currentProjectId = null;
        }

        return updates;
      });
    }
  },

  // UI控制 Actions
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),

  toggleProjectExpanded: (projectId) =>
    set((state) => {
      const newExpanded = new Set(state.expandedProjects);
      if (newExpanded.has(projectId)) {
        newExpanded.delete(projectId);
      } else {
        newExpanded.add(projectId);
      }
      return { expandedProjects: newExpanded };
    }),

  toggleWorkspaceExpanded: (workspaceId) =>
    set((state) => {
      const newExpanded = new Set(state.expandedWorkspaces);
      if (newExpanded.has(workspaceId)) {
        newExpanded.delete(workspaceId);
      } else {
        newExpanded.add(workspaceId);
      }
      return { expandedWorkspaces: newExpanded };
    }),

  // 工具方法
  getCurrentWorkspace: () => {
    const { workspaces, currentWorkspaceId } = get();
    return workspaces.find((w) => w.id === currentWorkspaceId) || null;
  },

  getCurrentProject: () => {
    const { projects, currentProjectId } = get();
    return projects.find((p) => p.id === currentProjectId) || null;
  },

  getCurrentBoard: () => {
    const { boards, currentBoardId } = get();
    return boards.find((b) => b.id === currentBoardId) || null;
  },

  getProjectsByWorkspace: (workspaceId) => {
    const { projects } = get();
    return projects
      .filter((p) => p.workspaceId === workspaceId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  getBoardsByProject: (projectId) => {
    const { boards } = get();
    return boards
      .filter((b) => b.projectId === projectId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  getBoardsByWorkspace: (workspaceId) => {
    const { boards } = get();
    return boards
      .filter((b) => b.workspaceId === workspaceId && !b.projectId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  // 初始化
  initialize: async () => {
    set({ isLoading: true });
    try {
      // 从后端加载数据
      const { multiBoardService } = await import('../services/multiBoardService');

      // 获取所有工作区（包含项目和看板）
      const workspaces = await multiBoardService.getAllWorkspaces();

      // 提取项目和看板数据
      const projects: Project[] = [];
      const boards: BoardInfo[] = [];

      workspaces.forEach((workspace) => {
        // 添加工作区直属看板
        if (workspace.boards) {
          workspace.boards.forEach((board) => {
            boards.push({
              id: board.id,
              name: board.name,
              type: 'board',
              workspaceId: workspace.id,
              projectId: undefined,
              description: board.description,
              color: board.color,
              icon: board.icon,
              order: board.order,
            });
          });
        }

        // 添加项目和项目下的看板
        if (workspace.projects) {
          workspace.projects.forEach((project) => {
            projects.push({
              id: project.id,
              name: project.name,
              type: 'project',
              workspaceId: workspace.id,
              description: project.description,
              color: project.color,
              icon: project.icon,
              order: project.order,
            });

            // 添加项目下的看板
            if (project.boards) {
              project.boards.forEach((board) => {
                boards.push({
                  id: board.id,
                  name: board.name,
                  type: 'board',
                  workspaceId: workspace.id,
                  projectId: project.id,
                  description: board.description,
                  color: board.color,
                  icon: board.icon,
                  order: board.order,
                });
              });
            }
          });
        }
      });

      // 转换工作区数据格式
      const formattedWorkspaces: Workspace[] = workspaces.map((ws) => ({
        id: ws.id,
        name: ws.name,
        type: 'workspace',
        isDefault: ws.isDefault,
        description: ws.description,
        teamId: ws.teamId, // 保留团队关联
      }));

      // 设置默认展开状态
      const defaultWorkspace = formattedWorkspaces.find((w) => w.isDefault);
      const expandedWorkspaces = new Set(defaultWorkspace ? [defaultWorkspace.id] : []);
      const expandedProjects = new Set<string>();

      // 自动选择默认看板
      let currentWorkspaceId = null;
      let currentBoardId = null;

      if (defaultWorkspace) {
        currentWorkspaceId = defaultWorkspace.id;
        // 查找默认工作区的第一个看板
        const defaultWorkspaceBoards = boards.filter(
          (b) => b.workspaceId === defaultWorkspace.id && !b.projectId,
        );
        if (defaultWorkspaceBoards.length > 0) {
          currentBoardId = defaultWorkspaceBoards[0].id;
        }
      }

      set({
        workspaces: formattedWorkspaces,
        projects,
        boards,
        expandedWorkspaces,
        expandedProjects,
        currentWorkspaceId,
        currentBoardId,
      });

      console.log('导航状态初始化完成', {
        workspaces: formattedWorkspaces.length,
        projects: projects.length,
        boards: boards.length,
        currentWorkspaceId,
        currentBoardId,
      });
    } catch (error) {
      console.error('导航状态初始化失败:', error);

      // 如果后端不可用，创建默认数据
      const defaultWorkspace: Workspace = {
        id: 'default-workspace',
        name: '默认工作区',
        type: 'workspace',
        isDefault: true,
        description: '系统默认工作区',
      };

      set({
        workspaces: [defaultWorkspace],
        projects: [],
        boards: [],
        expandedWorkspaces: new Set(['default-workspace']),
        expandedProjects: new Set(),
        currentWorkspaceId: 'default-workspace',
        currentBoardId: null, // 将在实际数据加载后设置
      });

      console.log('使用默认数据初始化导航状态');
    } finally {
      set({ isLoading: false });
    }
  },

  // API操作方法实现
  createWorkspace: async (data) => {
    try {
      const { multiBoardService } = await import('../services/multiBoardService');
      const workspace = await multiBoardService.createWorkspace(data);

      const formattedWorkspace: Workspace = {
        id: workspace.id,
        name: workspace.name,
        type: 'workspace',
        isDefault: workspace.isDefault || false,
        description: workspace.description,
        teamId: workspace.teamId, // 保留团队关联
      };

      get().addWorkspace(formattedWorkspace);
      console.log('工作区创建成功:', workspace.name);
    } catch (error) {
      console.error('创建工作区失败:', error);
      throw error;
    }
  },

  renameWorkspace: async (id, name) => {
    try {
      const { multiBoardService } = await import('../services/multiBoardService');
      await multiBoardService.updateWorkspace(id, { name });
      get().updateWorkspace(id, { name });
      console.log('工作区重命名成功:', name);
    } catch (error) {
      console.error('重命名工作区失败:', error);
      throw error;
    }
  },

  removeWorkspace: async (id) => {
    try {
      const { multiBoardService } = await import('../services/multiBoardService');
      await multiBoardService.deleteWorkspace(id);
      get().deleteWorkspace(id);
      console.log('工作区删除成功');
    } catch (error) {
      console.error('删除工作区失败:', error);
      throw error;
    }
  },

  createProject: async (workspaceId, data) => {
    try {
      const { multiBoardService } = await import('../services/multiBoardService');
      const project = await multiBoardService.createProject({
        ...data,
        workspaceId,
      });

      const formattedProject: Project = {
        id: project.id,
        name: project.name,
        type: 'project',
        workspaceId: project.workspaceId,
        description: project.description,
        color: project.color,
        icon: project.icon,
        order: project.order,
      };

      get().addProject(formattedProject);
      console.log('项目创建成功:', project.name);
    } catch (error) {
      console.error('创建项目失败:', error);
      throw error;
    }
  },

  renameProject: async (id, name) => {
    try {
      const { multiBoardService } = await import('../services/multiBoardService');
      await multiBoardService.updateProject(id, { name });
      get().updateProject(id, { name });
      console.log('项目重命名成功:', name);
    } catch (error) {
      console.error('重命名项目失败:', error);
      throw error;
    }
  },

  removeProject: async (id) => {
    try {
      const { multiBoardService } = await import('../services/multiBoardService');
      await multiBoardService.deleteProject(id);
      get().deleteProject(id);
      console.log('项目删除成功');
    } catch (error) {
      console.error('删除项目失败:', error);
      throw error;
    }
  },

  createBoard: async (data) => {
    try {
      const { multiBoardService } = await import('../services/multiBoardService');
      const board = await multiBoardService.createBoard(data);

      const formattedBoard: BoardInfo = {
        id: board.id,
        name: board.name,
        type: 'board',
        workspaceId: board.workspaceId,
        projectId: board.projectId,
        description: board.description,
        color: board.color,
        icon: board.icon,
        order: board.order,
      };

      get().addBoard(formattedBoard);
      console.log('看板创建成功:', board.name);
    } catch (error) {
      console.error('创建看板失败:', error);
      throw error;
    }
  },

  renameBoard: async (id, name) => {
    try {
      const { multiBoardService } = await import('../services/multiBoardService');
      await multiBoardService.updateBoard(id, { name });
      get().updateBoard(id, { name });
      console.log('看板重命名成功:', name);
    } catch (error) {
      console.error('重命名看板失败:', error);
      throw error;
    }
  },

  removeBoard: async (id) => {
    try {
      const { multiBoardService } = await import('../services/multiBoardService');
      await multiBoardService.deleteBoard(id);
      get().deleteBoard(id);
      console.log('看板删除成功');
    } catch (error) {
      console.error('删除看板失败:', error);
      throw error;
    }
  },
}));
