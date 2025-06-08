import { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
  SortableContext,
  horizontalListSortingStrategy
} from '@dnd-kit/sortable';
import Layout from './components/Layout';
import Button from './components/Button';
import Modal from './components/Modal';
import TaskDetailModal from './components/TaskDetailModal';
import DraggableTaskCard from './components/DraggableTaskCard';
import DroppableColumn from './components/DroppableColumn';
import TaskDragOverlay from './components/TaskDragOverlay';
import AddColumnButton from './components/AddColumnButton';
import DraggableColumn from './components/DraggableColumn';
import ColumnDragOverlay from './components/ColumnDragOverlay';
import useTheme from './hooks/useTheme';
import useMcpConnection from './hooks/useMcpConnection';
import useTaskStore from './store/taskStore';
import mcpService from './services/mcpService';
import columnService from './services/columnService';
import { Task as TaskType, PartialTask } from './types/Task';
import { testAxios } from './utils/testAxios';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<PartialTask>({
    title: '',
    description: '',
    status: 'todo',
  });
  
  // 测试axios是否工作正常
  useEffect(() => {
    testAxios().then(result => {
      console.log('Axios测试结果:', result);
    });
  }, []);

  // 加载列数据
  const loadColumns = async () => {
    try {
      const columns = await columnService.getAllColumns();
      setColumns(columns);
    } catch (error) {
      console.error('加载列失败:', error);
      // 如果加载失败，尝试初始化默认列
      try {
        const defaultColumns = await columnService.initializeDefaultColumns();
        setColumns(defaultColumns);
      } catch (initError) {
        console.error('初始化默认列失败:', initError);
        setError('加载看板列失败，请刷新页面重试');
      }
    }
  };

  // 初始化时加载列数据
  useEffect(() => {
    loadColumns();
  }, []);
  
  // 使用MCP连接
  const { isConnected, reconnect } = useMcpConnection();
  
  // 从store获取状态 - 使用selector函数避免不必要的重渲染
  const tasks = useTaskStore(state => state.tasks);
  const columns = useTaskStore(state => state.columns);
  const isLoading = useTaskStore(state => state.isLoading);
  const error = useTaskStore(state => state.error);
  const activeTaskId = useTaskStore(state => state.activeTaskId);
  const activeColumnId = useTaskStore(state => state.activeColumnId);
  const setError = useTaskStore(state => state.setError);
  const setActiveTaskId = useTaskStore(state => state.setActiveTaskId);
  const setActiveColumnId = useTaskStore(state => state.setActiveColumnId);
  const moveTask = useTaskStore(state => state.moveTask);
  const reorderTasksInColumn = useTaskStore(state => state.reorderTasksInColumn);
  const addColumn = useTaskStore(state => state.addColumn);
  const updateColumn = useTaskStore(state => state.updateColumn);
  const deleteColumn = useTaskStore(state => state.deleteColumn);
  const setColumns = useTaskStore(state => state.setColumns);
  const reorderColumns = useTaskStore(state => state.reorderColumns);

  // 配置拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 需要拖拽8px才激活
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // 打开任务详情
  const handleTaskClick = (taskId: string) => {
    console.log('点击任务:', taskId);
    setSelectedTaskId(taskId);
    setIsTaskDetailModalOpen(true);
  };
  
  // 关闭任务详情
  const handleCloseTaskDetail = () => {
    setIsTaskDetailModalOpen(false);
    setSelectedTaskId(null);
  };
  
  // 创建任务
  const handleCreateTask = async () => {
    if (!newTask.title) {
      setError('任务标题不能为空');
      return;
    }

    try {
      await mcpService.submitTaskDataset([newTask]);
      setIsCreateModalOpen(false);
      setNewTask({
        title: '',
        description: '',
        status: 'todo',
      });
    } catch (error) {
      console.error('创建任务失败:', error);
      setError('创建任务失败，请稍后重试');
    }
  };

  // 拖拽开始事件
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;

    if (activeData?.type === 'task') {
      setActiveTaskId(active.id as string);
      setActiveColumnId(null);
    } else if (activeData?.type === 'column') {
      setActiveColumnId(active.id as string);
      setActiveTaskId(null);
    }
  };

  // 拖拽结束事件
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTaskId(null);
    setActiveColumnId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeData = active.data.current;
    const overData = over.data.current;

    // 处理列拖拽
    if (activeData?.type === 'column') {
      const activeColumn = columns.find(col => col.id === activeId);
      const overColumn = columns.find(col => col.id === overId);

      if (activeColumn && overColumn && activeId !== overId) {
        const oldIndex = columns.findIndex(col => col.id === activeId);
        const newIndex = columns.findIndex(col => col.id === overId);

        if (oldIndex !== newIndex) {
          // 重新排序列
          const reorderedColumns = arrayMove(columns, oldIndex, newIndex);
          const columnIds = reorderedColumns.map(col => col.id);

          // 更新本地状态
          reorderColumns(columnIds);

          // 同步到后端
          try {
            await columnService.reorderColumns(columnIds);
          } catch (error) {
            console.error('重新排序列失败:', error);
            setError('重新排序列失败');
            // 回滚本地状态
            setColumns(columns);
          }
        }
      }
      return;
    }

    // 处理任务拖拽（原有逻辑）
    const activeTask = tasks.find(task => task.id === activeId);
    if (!activeTask) return;

    // 判断是否跨列拖拽（使用已声明的overData变量）
    if (overData?.type === 'column') {
      // 拖拽到列上
      const newStatus = overData.columnId;
      if (activeTask.status !== newStatus) {
        // 跨列移动
        moveTask(activeId, newStatus);

        // 同步到后端
        try {
          await mcpService.updateTask(activeId, { status: newStatus });
        } catch (error) {
          console.error('更新任务状态失败:', error);
          setError('更新任务状态失败');
        }
      }
    } else if (overData?.type === 'task') {
      // 拖拽到任务上，需要重新排序
      const overTask = tasks.find(task => task.id === overId);
      if (!overTask) return;

      if (activeTask.status === overTask.status) {
        // 同列内排序
        const columnTasks = tasks
          .filter(task => task.status === activeTask.status)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

        const oldIndex = columnTasks.findIndex(task => task.id === activeId);
        const newIndex = columnTasks.findIndex(task => task.id === overId);

        if (oldIndex !== newIndex) {
          const reorderedTasks = arrayMove(columnTasks, oldIndex, newIndex);
          const taskIds = reorderedTasks.map(task => task.id);
          reorderTasksInColumn(activeTask.status, taskIds);
        }
      } else {
        // 跨列移动到特定位置
        moveTask(activeId, overTask.status);

        try {
          await mcpService.updateTask(activeId, { status: overTask.status });
        } catch (error) {
          console.error('更新任务状态失败:', error);
          setError('更新任务状态失败');
        }
      }
    }
  };

  // 列管理事件处理函数
  const handleAddColumn = async (name: string) => {
    try {
      const newOrder = Math.max(...columns.map(col => col.order), -1) + 1;
      const newColumn = await columnService.createColumn({
        name,
        order: newOrder,
      });
      addColumn(newColumn);
    } catch (error) {
      console.error('添加列失败:', error);
      setError('添加列失败，请重试');
    }
  };

  const handleUpdateColumnTitle = async (columnId: string, newTitle: string) => {
    try {
      const updatedColumn = await columnService.updateColumn(columnId, {
        name: newTitle,
      });
      updateColumn(columnId, updatedColumn);
    } catch (error) {
      console.error('更新列标题失败:', error);
      setError('更新列标题失败，请重试');
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    try {
      await columnService.deleteColumn(columnId);
      deleteColumn(columnId);
    } catch (error) {
      console.error('删除列失败:', error);
      setError(error instanceof Error ? error.message : '删除列失败，请重试');
    }
  };

  const handleColumnColorChange = async (columnId: string, color: string) => {
    try {
      const updatedColumn = await columnService.updateColumn(columnId, { color });
      updateColumn(columnId, updatedColumn);
    } catch (error) {
      console.error('更新列颜色失败:', error);
      setError('更新列颜色失败，请重试');
    }
  };

  const handleTaskColorChange = async (taskId: string, color: string) => {
    try {
      await mcpService.updateTaskColor(taskId, color);
      // 重新加载任务列表以获取最新数据
      const updatedTasks = await mcpService.listTasks();
      setTasks(updatedTasks);
    } catch (error) {
      console.error('更新任务颜色失败:', error);
      setError('更新任务颜色失败，请重试');
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await mcpService.deleteTask(taskId);
      // 重新加载任务列表
      const updatedTasks = await mcpService.listTasks();
      setTasks(updatedTasks);
    } catch (error) {
      console.error('删除任务失败:', error);
      setError('删除任务失败，请重试');
    }
  };
  
  // 按列组织任务 - 使用useMemo避免不必要的重计算
  const tasksByColumn = useMemo(() => {
    console.log('重新计算任务分组，总任务数:', tasks.length);

    const result = columns.reduce((acc, column) => {
      // 仅筛选当前列的任务，按sortOrder排序
      const columnTasks = tasks
        .filter(task => task.status === column.id)
        .sort((a, b) => {
          // 优先按sortOrder排序，然后按创建时间倒序
          const aSortOrder = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
          const bSortOrder = b.sortOrder ?? Number.MAX_SAFE_INTEGER;

          // 使用明确的比较，确保排序正确
          return aSortOrder - bSortOrder; // 升序排列
        });

      // 打印列中所有任务的ID和排序信息
      console.log(`渲染列 ${column.id} 中的 ${columnTasks.length} 个任务, 排序值详情:`);
      if (columnTasks.length > 0) {
        columnTasks.forEach((task, index) => {
          console.log(`  任务[${index}]: ID=${task.id.substring(0, 8)}, 标题=${task.title}, sortOrder=${task.sortOrder ?? '未设置'}`);
        });
      }

      acc[column.id] = columnTasks;
      return acc;
    }, {} as Record<string, TaskType[]>);

    return result;
  }, [columns, tasks]);

  // 获取当前拖拽的任务和列
  const activeTask = activeTaskId ? tasks.find(task => task.id === activeTaskId) : null;
  const activeColumn = activeColumnId ? columns.find(col => col.id === activeColumnId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Layout>
        <div className="flex flex-col h-full">
          {/* 顶部操作栏 */}
          <header className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-text-primary">智能任务看板</h1>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-xs text-text-secondary">
                  {isConnected ? '已连接' : '未连接'}
                </span>
              </div>

              {!isConnected && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={reconnect}
                >
                  重新连接MCP服务
                </Button>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
              >
                新建任务
              </Button>

              <Button
                variant="ghost"
                size="sm"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    {theme === 'dark' ? (
                      <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fillRule="evenodd" clipRule="evenodd" />
                    ) : (
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    )}
                  </svg>
                }
                onClick={toggleTheme}
              >
                {theme === 'light' ? '深色模式' : theme === 'dark' ? '柔和模式' : theme === 'soft' ? '艺术模式' : '浅色模式'}
              </Button>
            </div>
          </header>
        
        {/* 错误提示 */}
        {error && (
          <div className="bg-danger/10 border border-danger text-danger px-4 py-2 m-4 rounded-md flex justify-between items-center">
            <p>{error}</p>
          <button
              className="text-sm underline"
              onClick={() => setError(null)}
          >
              关闭
          </button>
          </div>
        )}
        
        {/* 连接状态提示 */}
        {!isConnected && !error && (
          <div className="bg-warning/10 border border-warning text-warning px-4 py-2 m-4 rounded-md">
            <p>未连接到MCP服务，部分功能可能不可用</p>
          </div>
        )}
        
        {/* 加载状态 */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="ml-2 text-text-secondary">加载中...</p>
          </div>
        ) : (
          /* 看板内容区 */
          <div className="flex-1 overflow-auto p-6">
            {columns.length > 0 ? (
              <div className="flex space-x-4">
                <SortableContext
                  items={columns.map(col => col.id)}
                  strategy={horizontalListSortingStrategy}
                >
                  {columns.map(column => {
                    const columnTasks = tasksByColumn[column.id] || [];
                    const taskIds = columnTasks.map(task => task.id);

                    return (
                      <DraggableColumn
                        key={column.id}
                        column={column}
                        taskIds={taskIds}
                        onAddCard={() => {
                          setNewTask({...newTask, status: column.id});
                          setIsCreateModalOpen(true);
                        }}
                        onTitleEdit={(newTitle) => handleUpdateColumnTitle(column.id, newTitle)}
                        onDelete={() => handleDeleteColumn(column.id)}
                        onColorChange={(color) => handleColumnColorChange(column.id, color)}
                        isDeletable={!column.isDefault}
                        isEditable={true}
                        isDragging={activeColumnId === column.id}
                        isDraggingTask={!!activeTaskId}
                      >
                        {columnTasks.map(task => (
                          <div key={task.id} className="mb-2">
                            <DraggableTaskCard
                              task={task}
                              onClick={handleTaskClick}
                              isDragging={activeTaskId === task.id}
                              onColorChange={(color) => handleTaskColorChange(task.id, color)}
                              onDelete={() => handleTaskDelete(task.id)}
                            />
                          </div>
                        ))}
                      </DraggableColumn>
                    );
                  })}
                </SortableContext>

                {/* 添加新列按钮 */}
                <AddColumnButton onAdd={handleAddColumn} />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-text-secondary mb-4">暂无看板列</p>
                  <AddColumnButton onAdd={handleAddColumn} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 新建任务模态框 */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="新建任务"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              取消
            </Button>
            <Button 
              variant="primary" 
              onClick={handleCreateTask}
              disabled={!isConnected}
            >
              创建
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {!isConnected && (
            <div className="bg-warning/10 border border-warning text-warning px-4 py-2 rounded-md text-sm">
              未连接到MCP服务，无法创建任务
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              标题
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="输入任务标题"
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              disabled={!isConnected}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              描述
            </label>
            <textarea
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
              placeholder="输入任务描述"
              value={newTask.description || ''}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              disabled={!isConnected}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              状态
            </label>
            <select
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={newTask.status}
              onChange={(e) => setNewTask({...newTask, status: e.target.value})}
              disabled={!isConnected}
            >
              {columns.map(column => (
                <option key={column.id} value={column.id}>{column.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              优先级
            </label>
            <select
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={newTask.priority || ''}
              onChange={(e) => setNewTask({...newTask, priority: (e.target.value || null) as any})}
              disabled={!isConnected}
            >
              <option value="">未设置</option>
              <option value="High">高</option>
              <option value="Medium">中</option>
              <option value="Low">低</option>
            </select>
          </div>
        </div>
      </Modal>
      
      {/* 任务详情模态框 */}
      <TaskDetailModal
        isOpen={isTaskDetailModalOpen}
        taskId={selectedTaskId}
        onClose={handleCloseTaskDetail}
      />

      {/* 拖拽预览层 */}
      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}
      >
        {activeTask ? (
          <TaskDragOverlay task={activeTask} />
        ) : activeColumn ? (
          <ColumnDragOverlay
            column={activeColumn}
            tasks={tasksByColumn[activeColumn.id] || []}
          />
        ) : null}
      </DragOverlay>
    </Layout>
  </DndContext>
  );
}

export default App; 