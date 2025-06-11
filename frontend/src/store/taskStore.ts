/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-05-30 18:27:46
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-06-11 17:48:55
 * @FilePath: \XItools\frontend\src\store\taskStore.ts
 * @Description: 
 * 
 * Copyright (c) 2025 by Furdow, All Rights Reserved. 
 */
import { create } from 'zustand';
import { Task } from '../types/Task';

// 定义排序选项类型
export type SortOption = 'manual' | 'priority' | 'created_asc' | 'created_desc' | 'title_asc' | 'title_desc' | 'due_date';

// 定义筛选选项类型
export interface FilterOptions {
  status?: string;
  priority?: string;
  assignee?: string;
  tags?: string[];
  searchText?: string; // 搜索文本
}

// 定义看板列类型
export interface BoardColumn {
  id: string;
  name: string;
  order: number;
  color?: string; // 列的背景颜色（可选）
  isDefault?: boolean; // 是否为默认列（可选）
  createdAt?: string; // 创建时间（可选）
  updatedAt?: string; // 更新时间（可选）
  sortOption?: SortOption; // 列的排序方式（可选）
}

// 定义任务状态的类型
interface TaskState {
  // 所有任务
  tasks: Task[];
  // 看板列
  columns: BoardColumn[];
  // 加载状态
  isLoading: boolean;
  // 错误信息
  error: string | null;
  // 拖拽状态
  activeTaskId: string | null;
  activeColumnId: string | null;

  // 筛选和搜索状态
  filterOptions: FilterOptions;
  filteredTasks: Task[]; // 筛选后的任务列表

  // 操作方法
  setTasks: (tasks: Task[]) => void;
  addTasks: (tasks: Task[]) => void;
  updateTask: (updatedTask: Task) => void;
  deleteTask: (taskId: string) => void;
  setColumns: (columns: BoardColumn[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  // 拖拽相关方法
  setActiveTaskId: (taskId: string | null) => void;
  setActiveColumnId: (columnId: string | null) => void;
  moveTask: (taskId: string, newStatus: string, newSortOrder?: number) => void;
  reorderTasksInColumn: (columnId: string, taskIds: string[]) => void;
  // 列管理方法
  addColumn: (column: BoardColumn) => void;
  updateColumn: (columnId: string, updates: Partial<BoardColumn>) => void;
  deleteColumn: (columnId: string) => void;
  reorderColumns: (columnIds: string[]) => void;
  // 列排序方法
  setColumnSort: (columnId: string, sortOption: SortOption) => void;
  clearColumnSort: (columnId: string) => void;

  // 筛选和搜索方法
  setFilterOptions: (options: Partial<FilterOptions>) => void;
  clearFilters: () => void;
  applyFilters: () => void;
}

// 筛选任务的辅助函数
const filterTasks = (tasks: Task[], filterOptions: FilterOptions): Task[] => {
  return tasks.filter(task => {
    // 按状态筛选
    if (filterOptions.status && task.status !== filterOptions.status) {
      return false;
    }

    // 按优先级筛选
    if (filterOptions.priority && task.priority !== filterOptions.priority) {
      return false;
    }

    // 按负责人筛选
    if (filterOptions.assignee && task.assignee !== filterOptions.assignee) {
      return false;
    }

    // 按标签筛选
    if (filterOptions.tags && filterOptions.tags.length > 0) {
      const taskTags = task.tags || [];
      const taskTagNames = taskTags.map(tag =>
        typeof tag === 'string' ? tag : tag.name
      );
      const hasMatchingTag = filterOptions.tags.some(filterTag =>
        taskTagNames.includes(filterTag)
      );
      if (!hasMatchingTag) {
        return false;
      }
    }

    // 按搜索文本筛选
    if (filterOptions.searchText && filterOptions.searchText.trim()) {
      const searchText = filterOptions.searchText.toLowerCase().trim();
      const titleMatch = task.title.toLowerCase().includes(searchText);
      const descriptionMatch = task.description?.toLowerCase().includes(searchText) || false;
      if (!titleMatch && !descriptionMatch) {
        return false;
      }
    }

    return true;
  });
};

// 创建状态存储
const useTaskStore = create<TaskState>((set, get) => ({
  // 初始状态
  tasks: [],
  columns: [], // 改为空数组，从后端动态加载
  isLoading: false,
  error: null,
  activeTaskId: null,
  activeColumnId: null,

  // 筛选和搜索初始状态
  filterOptions: {},
  filteredTasks: [],

  // 操作方法实现
  setTasks: (tasks) => set((state) => {
    const filteredTasks = filterTasks(tasks, state.filterOptions);
    return { tasks, filteredTasks };
  }),

  addTasks: (newTasks) => set((state) => {
    // 过滤掉已存在的任务（基于ID）
    const uniqueNewTasks = newTasks.filter(
      (newTask) => !state.tasks.some((task) => task.id === newTask.id)
    );

    const updatedTasks = [...state.tasks, ...uniqueNewTasks];
    const filteredTasks = filterTasks(updatedTasks, state.filterOptions);

    return { tasks: updatedTasks, filteredTasks };
  }),

  updateTask: (updatedTask) => set((state) => {
    const updatedTasks = state.tasks.map((task) =>
      task.id === updatedTask.id ? updatedTask : task
    );
    const filteredTasks = filterTasks(updatedTasks, state.filterOptions);

    return { tasks: updatedTasks, filteredTasks };
  }),
  
  deleteTask: (taskId) => set((state) => ({
    tasks: state.tasks.filter((task) => task.id !== taskId),
  })),
  
  setColumns: (columns) => set({ columns }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),

  // 拖拽相关方法实现
  setActiveTaskId: (taskId) => set({ activeTaskId: taskId }),
  setActiveColumnId: (columnId) => set({ activeColumnId: columnId }),

  moveTask: (taskId, newStatus, newSortOrder) => set((state) => {
    // 找到并更新任务
    const updatedTasks = state.tasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          status: newStatus,
          sortOrder: newSortOrder ?? task.sortOrder,
          updatedAt: new Date().toISOString()
        };
      }
      return task;
    });

    return { tasks: updatedTasks };
  }),

  // 重新排序列内的任务
  reorderTasksInColumn: (columnId, taskIds) => set((state) => {
    const updatedTasks = state.tasks.map(task => {
      if (task.status === columnId) {
        const newIndex = taskIds.indexOf(task.id);
        if (newIndex !== -1) {
          return {
            ...task,
            sortOrder: newIndex,
            updatedAt: new Date().toISOString()
          };
        }
      }
      return task;
    });
    return { tasks: updatedTasks };
  }),

  // 列管理方法实现
  addColumn: (column) => set((state) => ({
    columns: [...state.columns, column].sort((a, b) => a.order - b.order)
  })),

  updateColumn: (columnId, updates) => set((state) => ({
    columns: state.columns.map(column =>
      column.id === columnId ? { ...column, ...updates } : column
    ).sort((a, b) => a.order - b.order)
  })),

  deleteColumn: (columnId) => set((state) => ({
    columns: state.columns.filter(column => column.id !== columnId)
  })),

  reorderColumns: (columnIds) => set((state) => {
    const reorderedColumns = columnIds.map((id, index) => {
      const column = state.columns.find(col => col.id === id);
      return column ? { ...column, order: index } : null;
    }).filter(Boolean) as BoardColumn[];

    return { columns: reorderedColumns };
  }),

  // 列排序方法实现
  setColumnSort: (columnId, sortOption) => set((state) => ({
    columns: state.columns.map(column =>
      column.id === columnId ? { ...column, sortOption } : column
    )
  })),

  clearColumnSort: (columnId) => set((state) => ({
    columns: state.columns.map(column =>
      column.id === columnId ? { ...column, sortOption: 'manual' } : column
    )
  })),

  // 筛选和搜索方法实现
  setFilterOptions: (options) => set((state) => {
    const newFilterOptions = { ...state.filterOptions, ...options };
    const newFilteredTasks = filterTasks(state.tasks, newFilterOptions);
    return {
      filterOptions: newFilterOptions,
      filteredTasks: newFilteredTasks
    };
  }),

  clearFilters: () => set((state) => ({
    filterOptions: {},
    filteredTasks: state.tasks
  })),

  applyFilters: () => set((state) => ({
    filteredTasks: filterTasks(state.tasks, state.filterOptions)
  })),
}));

export default useTaskStore; 