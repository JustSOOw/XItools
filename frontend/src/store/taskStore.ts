/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-05-30 18:27:46
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-06-08 12:00:11
 * @FilePath: \XItools\frontend\src\store\taskStore.ts
 * @Description: 
 * 
 * Copyright (c) 2025 by Furdow, All Rights Reserved. 
 */
import { create } from 'zustand';
import { Task } from '../types/Task';

// 定义排序选项类型
export type SortOption = 'manual' | 'priority' | 'created_asc' | 'created_desc' | 'title_asc' | 'title_desc' | 'due_date';

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
}

// 创建状态存储
const useTaskStore = create<TaskState>((set) => ({
  // 初始状态
  tasks: [],
  columns: [], // 改为空数组，从后端动态加载
  isLoading: false,
  error: null,
  activeTaskId: null,
  activeColumnId: null,

  // 操作方法实现
  setTasks: (tasks) => set({ tasks }),
  
  addTasks: (newTasks) => set((state) => {
    // 过滤掉已存在的任务（基于ID）
    const uniqueNewTasks = newTasks.filter(
      (newTask) => !state.tasks.some((task) => task.id === newTask.id)
    );
    
    return { tasks: [...state.tasks, ...uniqueNewTasks] };
  }),
  
  updateTask: (updatedTask) => set((state) => ({
    tasks: state.tasks.map((task) => 
      task.id === updatedTask.id ? updatedTask : task
    ),
  })),
  
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
}));

export default useTaskStore; 