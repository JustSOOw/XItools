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
import SearchBox from './components/SearchBox';
import TaskFilter from './components/TaskFilter';
import ListView from './components/ListView';
import CalendarView from './components/CalendarView';
import { SkeletonCard, SkeletonList, SkeletonCalendar } from './components/ui/Loading';
import { toast } from './components/ui/Toast';
import { ErrorBoundary, SimpleErrorFallback } from './components/ui/ErrorBoundary';
import { EmptyTasks, EmptySearchResults, EmptyFilterResults } from './components/ui/EmptyState';

// 动画组件
import { ViewTransition, CardAnimation, CardListAnimation } from './components/animations';

// 反馈组件
import {
  useConfirmDialog,
  useSuccessAnimation,
  useKeyboardShortcuts,
  ConnectionStatus
} from './components/feedback';

import useMcpConnection from './hooks/useMcpConnection';
import useTaskStore from './store/taskStore';
import mcpService from './services/mcpService';
import columnService from './services/columnService';
import { Task as TaskType, PartialTask } from './types/Task';


function App() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<PartialTask>({
    title: '',
    description: '',
    status: 'todo',
  });

  // 反馈系统Hooks
  const { showConfirm, ConfirmDialog } = useConfirmDialog();
  const { showSuccess, SuccessAnimation } = useSuccessAnimation();
  const {
    addShortcut,
    KeyboardShortcuts,
    KeyboardShortcutsHelp
  } = useKeyboardShortcuts();



  // 拖拽开始时的原始状态（仅用于错误恢复）
  const [dragStartState, setDragStartState] = useState<{
    tasks: TaskType[];
    activeTaskId: string | null;
  } | null>(null);




  


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
        toast.error('加载看板列失败，请刷新页面重试', {
          action: {
            label: '刷新',
            onClick: () => window.location.reload(),
          },
        });
      }
    }
  };

  // 初始化时加载列数据
  useEffect(() => {
    loadColumns();
  }, []);

  // 使用MCP连接
  const { isConnected, reconnect } = useMcpConnection();

  // 配置快捷键 - 移到 reconnect 定义之后
  useEffect(() => {
    // 新建任务快捷键
    addShortcut({
      key: 'n',
      description: '新建任务',
      action: () => setIsCreateModalOpen(true),
      category: '任务管理',
      ctrlKey: true,
    });

    // 搜索快捷键
    addShortcut({
      key: 'f',
      description: '搜索任务',
      action: () => {
        const searchInput = document.querySelector('input[placeholder*="搜索"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
      category: '导航',
      ctrlKey: true,
    });

    // 视图切换快捷键
    addShortcut({
      key: '1',
      description: '切换到看板视图',
      action: () => useTaskStore.getState().setCurrentView('board'),
      category: '视图',
      ctrlKey: true,
    });

    addShortcut({
      key: '2',
      description: '切换到列表视图',
      action: () => useTaskStore.getState().setCurrentView('list'),
      category: '视图',
      ctrlKey: true,
    });

    addShortcut({
      key: '3',
      description: '切换到日历视图',
      action: () => useTaskStore.getState().setCurrentView('calendar'),
      category: '视图',
      ctrlKey: true,
    });

    // 刷新快捷键
    addShortcut({
      key: 'r',
      description: '刷新数据',
      action: () => {
        reconnect();
        toast.success('正在刷新数据...');
      },
      category: '系统',
      ctrlKey: true,
    });
  }, [addShortcut, reconnect]);
  
  // 从store获取状态 - 使用selector函数避免不必要的重渲染
  const tasks = useTaskStore(state => state.tasks);
  const columns = useTaskStore(state => state.columns);
  const isLoading = useTaskStore(state => state.isLoading);

  const activeTaskId = useTaskStore(state => state.activeTaskId);
  const activeColumnId = useTaskStore(state => state.activeColumnId);

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

  // 视图状态
  const currentView = useTaskStore(state => state.currentView);

  // 筛选和搜索状态
  const filterOptions = useTaskStore(state => state.filterOptions);
  const filteredTasks = useTaskStore(state => state.filteredTasks);
  const setFilterOptions = useTaskStore(state => state.setFilterOptions);
  const clearFilters = useTaskStore(state => state.clearFilters);

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
      toast.error('任务标题不能为空');
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

      // 显示成功动画
      showSuccess({
        message: '任务创建成功！',
        variant: 'celebration',
        duration: 2000,
      });

      toast.success('任务创建成功！');
    } catch (error) {
      console.error('创建任务失败:', error);
      toast.error('创建任务失败，请稍后重试', {
        action: {
          label: '重试',
          onClick: handleCreateTask,
        },
      });
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
            toast.error('重新排序列失败');
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
              toast.warning('任务保存失败，但界面已更新');
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
          toast.warning('任务保存失败，但界面已更新');
        });

    } catch (error) {
      console.error('任务拖拽失败:', error);
      toast.error('任务移动失败');
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
      toast.success('列添加成功');
    } catch (error) {
      console.error('添加列失败:', error);
      toast.error('添加列失败，请重试', {
        action: {
          label: '重试',
          onClick: () => handleAddColumn(name),
        },
      });
    }
  };

  const handleUpdateColumnTitle = async (columnId: string, newTitle: string) => {
    try {
      const updatedColumn = await columnService.updateColumn(columnId, {
        name: newTitle,
      });
      updateColumn(columnId, updatedColumn);
      toast.success('列标题更新成功');
    } catch (error) {
      console.error('更新列标题失败:', error);
      toast.error('更新列标题失败，请重试', {
        action: {
          label: '重试',
          onClick: () => handleUpdateColumnTitle(columnId, newTitle),
        },
      });
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    const column = columns.find(c => c.id === columnId);
    const columnName = column?.name || '该列';
    const columnTasks = tasks.filter(task => task.status === columnId);

    showConfirm(
      {
        title: '确认删除列',
        message: `确定要删除列"${columnName}"吗？${columnTasks.length > 0 ? `该列中有 ${columnTasks.length} 个任务，删除后这些任务也会被删除。` : ''}此操作无法撤销。`,
        type: 'danger',
        confirmText: '删除',
        cancelText: '取消',
      },
      async () => {
        try {
          await columnService.deleteColumn(columnId);
          deleteColumn(columnId);

          // 显示成功动画
          showSuccess({
            message: '列删除成功',
            variant: 'simple',
            duration: 1500,
          });

          toast.success('列删除成功');
        } catch (error) {
          console.error('删除列失败:', error);
          toast.error(error instanceof Error ? error.message : '删除列失败，请重试', {
            action: {
              label: '重试',
              onClick: () => handleDeleteColumn(columnId),
            },
          });
        }
      }
    );
  };

  const handleColumnColorChange = async (columnId: string, color: string) => {
    try {
      const updatedColumn = await columnService.updateColumn(columnId, { color });
      updateColumn(columnId, updatedColumn);
      toast.success('列颜色更新成功');
    } catch (error) {
      console.error('更新列颜色失败:', error);
      toast.error('更新列颜色失败，请重试');
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
      toast.error('更新任务颜色失败，请重试');
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    const taskTitle = task?.title || '该任务';

    showConfirm(
      {
        title: '确认删除任务',
        message: `确定要删除任务"${taskTitle}"吗？此操作无法撤销。`,
        type: 'danger',
        confirmText: '删除',
        cancelText: '取消',
      },
      async () => {
        try {
          await mcpService.deleteTask(taskId);
          // 重新加载任务列表
          const updatedTasks = await mcpService.listTasks();
          setTasks(updatedTasks);

          // 显示成功动画
          showSuccess({
            message: '任务删除成功',
            variant: 'simple',
            duration: 1500,
          });

          toast.success('任务删除成功');
        } catch (error) {
          console.error('删除任务失败:', error);
          toast.error('删除任务失败，请重试', {
            action: {
              label: '重试',
              onClick: () => handleTaskDelete(taskId),
            },
          });
        }
      }
    );
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
      toast.error('列排序失败，请重试');
    }
  };

  // 决定使用哪个任务列表：如果有筛选条件，使用筛选后的任务，否则使用全部任务
  const { displayTasks, hasFilters } = useMemo(() => {
    const hasFilters = Object.keys(filterOptions).some(key => {
      const value = filterOptions[key as keyof typeof filterOptions];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== undefined && value !== null && value !== '';
    });

    return {
      displayTasks: hasFilters ? filteredTasks : tasks,
      hasFilters,
    };
  }, [filterOptions, filteredTasks, tasks]);

  // 按列组织任务 - 支持多容器拖拽
  const tasksByColumn = useMemo(() => {
    const result = columns.reduce((acc, column) => {
      // 仅筛选当前列的任务，按sortOrder排序
      const columnTasks = displayTasks
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
  }, [columns, displayTasks]);





  // 获取当前拖拽的任务和列
  const activeTask = activeTaskId ? tasks.find(task => task.id === activeTaskId) : null;
  const activeColumn = activeColumnId ? columns.find(col => col.id === activeColumnId) : null;

  // 渲染视图内容
  const renderViewContent = () => {
    switch (currentView) {
      case 'list':
        return (
          <ListView
            tasks={displayTasks}
            columns={columns}
            onTaskClick={handleTaskClick}
            onTaskUpdate={(taskId, updates) => {
              // 通过MCP服务更新任务
              mcpService.updateTask(taskId, updates).catch(error => {
                console.error('更新任务失败:', error);
                toast.error('更新任务失败，请重试');
              });
            }}
            onTaskDelete={handleTaskDelete}
            onTaskColorChange={handleTaskColorChange}
            onCreateTask={() => setIsCreateModalOpen(true)}
            totalTasks={tasks.length}
            hasFilters={hasFilters}
            searchTerm={filterOptions.searchText}
            onClearFilters={clearFilters}
            onClearSearch={() => setFilterOptions({ searchText: undefined })}
          />
        );

      case 'calendar':
        return (
          <CalendarView
            tasks={displayTasks}
            columns={columns}
            onTaskClick={handleTaskClick}
            onTaskUpdate={(taskId, updates) => {
              // 通过MCP服务更新任务
              mcpService.updateTask(taskId, updates).catch(error => {
                console.error('更新任务失败:', error);
                toast.error('更新任务失败，请重试');
              });
            }}
            onCreateTask={() => setIsCreateModalOpen(true)}
            totalTasks={tasks.length}
            hasFilters={hasFilters}
            searchTerm={filterOptions.searchText}
            onClearFilters={clearFilters}
            onClearSearch={() => setFilterOptions({ searchText: undefined })}
          />
        );

      case 'board':
      default:
        // 看板视图 - 检查是否有列和任务
        if (columns.length === 0) {
          // 没有列的情况
          return (
            <div className="flex-1 flex items-center justify-center">
              <EmptyTasks
                onAction={() => setIsCreateModalOpen(true)}
                secondaryAction={{
                  label: '添加列',
                  onClick: () => {
                    // 可以添加一个添加列的逻辑
                  },
                  variant: 'secondary',
                }}
                size="lg"
              />
            </div>
          );
        }

        // 有列但没有任务的情况
        if (displayTasks.length === 0) {
          return (
            <div className="relative h-full w-full">
              {/* 显示空的列结构 */}
              <div className="flex min-w-max gap-1">
                <SortableContext
                  items={columns.map(col => col.id)}
                  strategy={horizontalListSortingStrategy}
                >
                  {columns.map((column) => {
                    const columnTasks = tasksByColumn[column.id] || [];
                    const taskIds = columnTasks.map(task => task.id);
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

              {/* 空状态蒙版 - 扩大范围，覆盖整个看板区域 */}
              <div className="absolute inset-0 -inset-x-6 -inset-y-6 flex items-center justify-center bg-background/85 backdrop-blur-md rounded-lg">
                <div className="text-center max-w-md mx-auto p-8">
                  {hasFilters ? (
                    <EmptyFilterResults
                      onAction={() => setIsCreateModalOpen(true)}
                      secondaryAction={{
                        label: '清除筛选',
                        onClick: clearFilters,
                        variant: 'secondary',
                      }}
                      size="lg"
                    />
                  ) : filterOptions.searchText ? (
                    <EmptySearchResults
                      onAction={() => setIsCreateModalOpen(true)}
                      secondaryAction={{
                        label: '清除搜索',
                        onClick: () => setFilterOptions({ searchText: undefined }),
                        variant: 'secondary',
                      }}
                      size="lg"
                    />
                  ) : (
                    <EmptyTasks
                      onAction={() => setIsCreateModalOpen(true)}
                      size="lg"
                    />
                  )}
                </div>
              </div>
            </div>
          );
        }

        // 有列也有任务的正常情况
        return (
          <div className="flex min-w-max gap-1">
            <SortableContext
              items={columns.map(col => col.id)}
              strategy={horizontalListSortingStrategy}
            >
              {columns.map((column) => {
                const columnTasks = tasksByColumn[column.id] || [];
                const taskIds = columnTasks.map(task => task.id);
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
        );
    }
  };





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
            {/* 左侧：搜索和筛选 */}
            <div className="flex items-center space-x-4">
              {/* 搜索框 */}
              <div className="w-80">
                <SearchBox
                  value={filterOptions.searchText || ''}
                  placeholder="搜索任务标题或描述..."
                  onSearch={(searchText: string) => setFilterOptions({ searchText: searchText || undefined })}
                  onClear={() => setFilterOptions({ searchText: undefined })}
                />
              </div>

              {/* 筛选器 */}
              <TaskFilter
                filterOptions={filterOptions}
                onFilterChange={setFilterOptions}
                onClearFilters={clearFilters}
                columns={columns}
                tasks={tasks}
                displayTasks={displayTasks}
              />
            </div>

            {/* 右侧：操作按钮 */}
            <div className="flex items-center space-x-4">
              {/* 连接状态指示器 */}
              <ConnectionStatus isConnected={isConnected} />

              {!isConnected && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={reconnect}
                >
                  重新连接MCP服务
                </Button>
              )}

              {/* 开发模式测试按钮 */}
              {process.env.NODE_ENV === 'development' && tasks.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    if (confirm('确定要删除所有任务来测试空状态吗？')) {
                      try {
                        // 删除所有任务
                        for (const task of tasks) {
                          await mcpService.deleteTask(task.id);
                        }
                        // 重新加载任务列表
                        const updatedTasks = await mcpService.listTasks();
                        setTasks(updatedTasks);
                        toast.success('所有任务已删除，现在可以测试空状态了');
                      } catch (error) {
                        console.error('删除任务失败:', error);
                        toast.error('删除任务失败');
                      }
                    }
                  }}
                  className="text-xs"
                  title="删除所有任务以测试空状态"
                >
                  🧪 清空测试
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
        


        {/* 连接状态提示 */}
        {!isConnected && (
          <div className="modern-card mx-4 mt-4 bg-warning/10 border border-warning text-warning px-4 py-2">
            <p>未连接到MCP服务，部分功能可能不可用</p>
          </div>
        )}

        {/* 主要内容区 */}
        <ViewTransition viewKey={currentView} mode="fade" className="flex-1 p-4 flex flex-col min-h-0">
          {isLoading ? (
            <>
              {currentView === 'board' ? (
                <div className="modern-container h-full board-content">
                  <div className="h-full overflow-x-auto overflow-y-hidden p-6">
                    <div className="flex space-x-4 h-full">
                      {/* 渲染3个列的骨架屏 */}
                      {[1, 2, 3].map((index) => (
                        <div key={index} className="flex-shrink-0 w-80">
                          <div className="bg-surface rounded-card p-4 h-full">
                            <div className="h-6 bg-text-secondary/20 rounded-md w-24 mb-4 animate-pulse"></div>
                            <div className="space-y-3">
                              <SkeletonCard />
                              <SkeletonCard />
                              <SkeletonCard />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : currentView === 'list' ? (
                <div className="flex-1 min-h-0">
                  <SkeletonList rows={8} />
                </div>
              ) : (
                <div className="flex-1 min-h-0">
                  <SkeletonCalendar />
                </div>
              )}
            </>
          ) : (
            <>
              {currentView === 'board' ? (
                <div className="modern-container h-full board-content">
                  <div className="h-full overflow-x-auto overflow-y-hidden p-6 custom-scrollbar">
                    <ErrorBoundary fallback={SimpleErrorFallback}>
                      {renderViewContent()}
                    </ErrorBoundary>
                  </div>
                </div>
              ) : (
                <div className="flex-1 min-h-0">
                  <ErrorBoundary fallback={SimpleErrorFallback}>
                    {renderViewContent()}
                  </ErrorBoundary>
                </div>
              )}
            </>
          )}
        </ViewTransition>
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

      {/* 反馈组件 */}
      {KeyboardShortcuts}
      {KeyboardShortcutsHelp}
      {ConfirmDialog}
      {SuccessAnimation}
    </Layout>
  </DndContext>
  );
}

export default App; 