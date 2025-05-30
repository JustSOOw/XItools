import { create } from 'zustand';
import { Task } from '../types/Task';

// 定义看板列类型
export interface BoardColumn {
  id: string;
  name: string;
  order: number;
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
  
  // 操作方法
  setTasks: (tasks: Task[]) => void;
  addTasks: (tasks: Task[]) => void;
  updateTask: (updatedTask: Task) => void;
  deleteTask: (taskId: string) => void;
  setColumns: (columns: BoardColumn[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

// 创建状态存储
const useTaskStore = create<TaskState>((set) => ({
  // 初始状态
  tasks: [],
  columns: [
    { id: 'todo', name: '待办', order: 0 },
    { id: 'in-progress', name: '进行中', order: 1 },
    { id: 'done', name: '已完成', order: 2 },
  ],
  isLoading: false,
  error: null,
  
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
}));

export default useTaskStore; 