import { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  rectIntersection,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  CollisionDetection,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import Layout from './components/Layout';
import Button from './components/Button';
import Modal from './components/Modal';
import TaskDetailModal from './components/TaskDetailModal';
import DraggableTaskCard from './components/DraggableTaskCard';
import TaskDragOverlay from './components/TaskDragOverlay';
import AddColumnButton from './components/AddColumnButton';
import DraggableColumn from './components/DraggableColumn';
import ColumnDragOverlay from './components/ColumnDragOverlay';
import { BoardColorPicker } from './components';

import useMcpConnection from './hooks/useMcpConnection';
import useTaskStore from './store/taskStore';
import mcpService from './services/mcpService';
import columnService from './services/columnService';
import { Task as TaskType, PartialTask } from './types/Task';
import { testAxios } from './utils/testAxios';

function App() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<PartialTask>({
    title: '',
    description: '',
    status: 'todo',
  });



  // 拖拽开始时的原始状态（仅用于错误恢复）
  const [dragStartState, setDragStartState] = useState<{
    tasks: TaskType[];
    activeTaskId: string | null;
  } | null>(null);




  
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
  // const reorderTasksInColumn = useTaskStore(state => state.reorderTasksInColumn); // 暂时不使用乐观更新
  const addColumn = useTaskStore(state => state.addColumn);
  const updateColumn = useTaskStore(state => state.updateColumn);
  const deleteColumn = useTaskStore(state => state.deleteColumn);
  const setColumns = useTaskStore(state => state.setColumns);
  const reorderColumns = useTaskStore(state => state.reorderColumns);
  const setTasks = useTaskStore(state => state.setTasks);
  const setColumnSort = useTaskStore(state => state.setColumnSort);
  const clearColumnSort = useTaskStore(state => state.clearColumnSort);
  const moveTask = useTaskStore(state => state.moveTask);
  const reorderTasksInColumn = useTaskStore(state => state.reorderTasksInColumn);

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

  // 自定义碰撞检测算法 - 基于@dnd-kit官方多容器示例
  const customCollisionDetection: CollisionDetection = (args) => {
    const { active, droppableContainers } = args;

    // 如果拖拽的是列，使用标准的closestCenter检测
    if (active.data.current?.type === 'column') {
      return closestCenter({
        ...args,
        droppableContainers: Array.from(droppableContainers.values()).filter(
          container => container.data.current?.type === 'column'
        )
      });
    }

    // 如果拖拽的是任务，使用官方多容器碰撞检测策略
    if (active.data.current?.type === 'task') {
      // 首先找到指针相交的容器
      const pointerIntersections = pointerWithin(args);
      const intersections = pointerIntersections.length > 0
        ? pointerIntersections
        : rectIntersection(args);

      let overId = intersections[0]?.id;

      if (overId != null) {
        // 如果相交的是列容器
        const overColumn = columns.find(col => col.id === overId);
        if (overColumn) {
          const columnTasks = tasksByColumn[overId] || [];

          // 如果列有任务，找到最近的任务
          if (columnTasks.length > 0) {
            const taskIds = columnTasks.map(task => task.id);
            const taskCollisions = closestCenter({
              ...args,
              droppableContainers: Array.from(droppableContainers.values()).filter(
                container => taskIds.includes(container.id as string)
              )
            });

            if (taskCollisions.length > 0) {
              overId = taskCollisions[0].id;
            }
          }
          // 如果列为空，直接返回列ID
        }

        return [{ id: overId }];
      }
    }

    // 默认使用最近中心算法
    return closestCenter(args);
  };

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
      const activeTaskId = active.id as string;
      setActiveTaskId(activeTaskId);
      setActiveColumnId(null);

      // 保存拖拽开始时的原始状态（仅用于错误恢复）
      setDragStartState({
        tasks: [...tasks],
        activeTaskId,
      });

      // 当用户开始拖拽任务时，清除所有列的排序状态，回到手动排序
      const activeTask = tasks.find(task => task.id === activeTaskId);
      if (activeTask) {
        clearColumnSort(activeTask.status);
        console.log(`任务拖拽开始，清除列 ${activeTask.status} 的排序状态`);
      }
    } else if (activeData?.type === 'column') {
      setActiveColumnId(active.id as string);
      setActiveTaskId(null);
      setDragStartState(null);
    }
  };

  // 拖拽结束事件
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    // 清除拖拽状态
    setActiveTaskId(null);
    setActiveColumnId(null);

    if (!over) {
      console.log('拖拽结束：没有有效的放置目标');
      // 恢复到拖拽开始时的状态
      if (dragStartState) {
        setTasks(dragStartState.tasks);
      }
      setDragStartState(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeData = active.data.current;
    const overData = over.data.current;



    // 处理列拖拽 - 使用标准sortable逻辑
    if (activeData?.type === 'column' && overData?.type === 'column') {
      const activeColumn = columns.find(col => col.id === activeId);
      const overColumn = columns.find(col => col.id === overId);

      if (activeColumn && overColumn && activeId !== overId) {
        const oldIndex = columns.findIndex(col => col.id === activeId);
        const newIndex = columns.findIndex(col => col.id === overId);

        if (oldIndex !== newIndex) {
          // 使用@dnd-kit的arrayMove进行重新排序
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

    // 处理任务拖拽 - 多容器逻辑
    const activeTask = tasks.find(task => task.id === activeId);
    if (!activeTask || !dragStartState) {
      // 如果找不到任务或没有原始状态，恢复到拖拽开始时的状态
      if (dragStartState) {
        setTasks(dragStartState.tasks);
      }
      setDragStartState(null);
      return;
    }

    // 获取原始状态（拖拽开始时的状态）
    const originalTask = dragStartState.tasks.find(task => task.id === activeId);
    const originalStatus = originalTask?.status || activeTask.status;

    // 确定最终目标列
    let finalColumn: string;
    if (overData?.type === 'column') {
      finalColumn = overData.columnId || overId;
    } else if (overData?.type === 'task') {
      const overTask = tasks.find(task => task.id === overId);
      if (!overTask) {
        // 恢复到拖拽开始时的状态
        setTasks(dragStartState.tasks);
        setDragStartState(null);
        return;
      }
      finalColumn = overTask.status;
    } else {
      // 无效目标，恢复到拖拽开始时的状态
      setTasks(dragStartState.tasks);
      setDragStartState(null);
      return;
    }

    try {
      // 立即更新本地状态，确保UI响应

      // 统一使用后端排序API处理所有拖拽操作
      let targetTaskId = overId;
      let insertPosition = 'before';

      if (overData?.type === 'column') {
        // 拖拽到列上（空白区域）
        const targetColumnTasks = dragStartState.tasks
          .filter(task => task.status === finalColumn && task.id !== activeId)
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

        if (targetColumnTasks.length > 0) {
          targetTaskId = targetColumnTasks[targetColumnTasks.length - 1].id;
          insertPosition = 'after';
        } else {
          // 空列，立即更新本地状态
          moveTask(activeId, finalColumn);
          // 后台持久化
          mcpService.updateTask(activeId, { status: finalColumn })
            .catch((error) => {
              console.error('空列移动持久化失败:', error);
              setError('任务保存失败，但界面已更新');
            });
          return;
        }
      } else if (overData?.type === 'task') {
        // 拖拽到具体任务上
        if (originalStatus === finalColumn) {
          // 同列拖拽，计算插入位置
          const columnTasks = dragStartState.tasks
            .filter(task => task.status === finalColumn)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

          const activeIndex = columnTasks.findIndex(task => task.id === activeId);
          const overIndex = columnTasks.findIndex(task => task.id === overId);

          insertPosition = activeIndex < overIndex ? 'after' : 'before';
        }
        targetTaskId = overId;
      }

      // 立即更新本地状态
      if (originalStatus === finalColumn) {
        // 同列拖拽：重新排序
        const columnTasks = dragStartState.tasks
          .filter(task => task.status === finalColumn)
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

        const activeIndex = columnTasks.findIndex(task => task.id === activeId);
        const overIndex = columnTasks.findIndex(task => task.id === overId);

        if (activeIndex !== -1 && overIndex !== -1) {
          // 计算新的任务顺序
          const reorderedTasks = [...columnTasks];
          const [movedTask] = reorderedTasks.splice(activeIndex, 1);

          let newIndex = overIndex;
          if (insertPosition === 'after') {
            newIndex = activeIndex < overIndex ? overIndex : overIndex + 1;
          } else {
            newIndex = activeIndex < overIndex ? overIndex - 1 : overIndex;
          }

          reorderedTasks.splice(newIndex, 0, movedTask);
          const newTaskIds = reorderedTasks.map(task => task.id);

          // 立即更新本地状态
          reorderTasksInColumn(finalColumn, newTaskIds);
          console.log(`同列拖拽本地状态已更新: ${activeId} 在列 ${finalColumn} 中重排序`);
        }
      } else {
        // 跨列拖拽：移动任务
        moveTask(activeId, finalColumn);
        console.log(`跨列拖拽本地状态已更新: ${activeId} 移动到列 ${finalColumn}`);
      }

      // 后台调用API进行数据持久化（不阻塞UI）
      console.log(`拖拽操作: ${activeId} -> ${finalColumn} (${insertPosition} ${targetTaskId})`);
      mcpService.sortTask(activeId, targetTaskId, finalColumn, insertPosition)
        .then(() => {
          console.log(`任务拖拽持久化成功: ${activeId}`);
        })
        .catch((error) => {
          console.error('任务拖拽持久化失败:', error);
          // 持久化失败时，可以选择显示警告但不回滚UI
          setError('任务保存失败，但界面已更新');
        });

    } catch (error) {
      console.error('任务拖拽失败:', error);
      setError('任务移动失败');
      // 失败时恢复到拖拽开始时的状态
      if (dragStartState) {
        setTasks(dragStartState.tasks);
      }
    }

    // 清除拖拽开始时的状态
    setDragStartState(null);
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
    console.log('开始更新任务颜色:', { taskId: taskId?.substring(0, 8) || taskId, color });
    try {
      const result = await mcpService.updateTaskColor(taskId, color);
      console.log('任务颜色更新API响应:', result);

      // 不需要手动更新状态，Socket.IO会自动广播更新事件
      // WebSocket监听器会自动处理task_updated事件并更新本地状态
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

  const handleColumnSort = async (columnId: string, sortOption: string) => {
    try {
      console.log(`开始对列 ${columnId} 进行 ${sortOption} 排序`);

      // 更新本地状态
      setColumnSort(columnId, sortOption as any);

      // 调用后端排序API
      const result = await mcpService.sortColumnTasks(columnId, sortOption);

      console.log(`列排序完成:`, result);

      // 重新加载任务列表以确保一致性
      const updatedTasks = await mcpService.listTasks();
      setTasks(updatedTasks);

    } catch (error) {
      console.error('列排序失败:', error);
      setError('列排序失败，请重试');
    }
  };
  
  // 按列组织任务 - 支持多容器拖拽
  const tasksByColumn = useMemo(() => {
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

      acc[column.id] = columnTasks;
      return acc;
    }, {} as Record<string, TaskType[]>);

    return result;
  }, [columns, tasks]);





  // 获取当前拖拽的任务和列
  const activeTask = activeTaskId ? tasks.find(task => task.id === activeTaskId) : null;
  const activeColumn = activeColumnId ? columns.find(col => col.id === activeColumnId) : null;





  // 拖拽悬停事件 - 基于@dnd-kit官方多容器示例
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;

    // 处理列拖拽 - 简化逻辑，让@dnd-kit处理挤压动画
    if (activeData?.type === 'column') {
      // 让sortable自己处理动画
      return;
    }

    // 处理任务拖拽 - 关键：实时移动任务以显示正确预览
    if (activeData?.type === 'task') {
      const activeId = active.id as string;
      const overId = over.id as string;

      // 找到活动任务
      const activeTask = tasks.find(task => task.id === activeId);
      if (!activeTask) return;

      // 确定目标容器
      let overContainer: string | null = null;
      if (overData?.type === 'column') {
        overContainer = overData.columnId || overId;
      } else if (overData?.type === 'task') {
        const overTask = tasks.find(task => task.id === overId);
        overContainer = overTask?.status || null;
      }

      // 如果是跨列拖拽，实时移动任务
      if (overContainer && activeTask.status !== overContainer) {
        const activeIndex = tasks.findIndex(task => task.id === activeId);
        const overIndex = tasks.findIndex(task => task.id === overId);

        // 创建新的任务列表
        const newTasks = [...tasks];

        // 移除活动任务
        const [movedTask] = newTasks.splice(activeIndex, 1);

        // 更新任务状态
        movedTask.status = overContainer;

        // 计算插入位置
        let insertIndex = newTasks.length;
        if (overData?.type === 'task' && overIndex !== -1) {
          // 调整索引（因为我们已经移除了一个任务）
          const adjustedOverIndex = overIndex > activeIndex ? overIndex - 1 : overIndex;
          insertIndex = adjustedOverIndex + 1;
        } else {
          // 如果拖拽到列上，插入到该列的末尾
          const targetColumnTasks = newTasks.filter(task => task.status === overContainer);
          insertIndex = newTasks.findIndex(task => task.status === overContainer) + targetColumnTasks.length;
        }

        // 插入任务到新位置
        newTasks.splice(insertIndex, 0, movedTask);

        setTasks(newTasks);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Layout>
        <div className="flex flex-col h-full">
          {/* 顶部操作栏 */}
          <header className="modern-container mx-4 mt-4 px-6 py-4 flex items-center justify-between">
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

              <BoardColorPicker />
            </div>
          </header>
        
        {/* 错误提示 */}
        {error && (
          <div className="modern-card mx-4 mt-4 bg-red-50 border border-red-500 text-red-700 px-4 py-2 flex justify-between items-center">
            <p>{error}</p>
          <button
              className="text-sm underline hover:text-red-900"
              onClick={() => setError(null)}
          >
              关闭
          </button>
          </div>
        )}

        {/* 连接状态提示 */}
        {!isConnected && !error && (
          <div className="modern-card mx-4 mt-4 bg-warning/10 border border-warning text-warning px-4 py-2">
            <p>未连接到MCP服务，部分功能可能不可用</p>
          </div>
        )}
        
        {/* 主要内容区 */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="ml-2 text-text-secondary">加载中...</p>
          </div>
        ) : (
          /* 看板内容区 */
          <div className="flex-1 p-4">
            <div className="modern-container h-full board-content">
              <div className="h-full overflow-auto p-6">
            {columns.length > 0 ? (
              <div className="flex min-w-max gap-1">
                <SortableContext
                  items={columns.map(col => col.id)}
                  strategy={horizontalListSortingStrategy}
                >
                  {columns.map((column) => {
                    const columnTasks = tasksByColumn[column.id] || [];
                    const taskIds = columnTasks.map(task => task.id);

                    // 直接使用taskIds，空列时为空数组
                    const sortableItems = taskIds;

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
                        onSort={(sortOption) => handleColumnSort(column.id, sortOption)}
                        isDeletable={true}
                        isEditable={true}
                        isDragging={activeColumnId === column.id}
                        isDraggingTask={!!activeTaskId}
                        isColumnDragging={!!activeColumnId}
                      >
                        {/* 为每个列创建独立的SortableContext - 即使是空列也需要 */}
                        <SortableContext
                          items={sortableItems}
                          strategy={verticalListSortingStrategy}
                        >
                          {columnTasks.map(task => (
                            <div key={task.id} className="mb-1.5">
                              <DraggableTaskCard
                                task={task}
                                onClick={handleTaskClick}
                                isDragging={activeTaskId === task.id}
                                onColorChange={(color) => handleTaskColorChange(task.id, color)}
                                onDelete={() => handleTaskDelete(task.id)}
                              />
                            </div>
                          ))}
                        </SortableContext>
                      </DraggableColumn>
                    );
                  })}
                </SortableContext>

                {/* 添加新列按钮 */}
                <div className="ml-1">
                  <AddColumnButton onAdd={handleAddColumn} />
                </div>
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
            </div>
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