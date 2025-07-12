/**
 * 看板容器组件
 * 封装单个看板的完整功能，包括三个视图模式
 */

import React, { useEffect } from 'react';
import { useNavigationStore } from '../../store/navigationStore';
import useTaskStore from '../../store/taskStore';
import { useI18n } from '../../hooks/useI18n';

interface BoardContainerProps {
  boardId: string;
  className?: string;
}

const BoardContainer: React.FC<BoardContainerProps> = ({ boardId, className }) => {
  const { t } = useI18n();

  // 导航状态
  const { getCurrentBoard } = useNavigationStore();

  // 任务状态
  const { tasks, columns, isLoading, setTasks, setColumns } = useTaskStore();

  // 当前看板信息
  const currentBoard = getCurrentBoard();

  // 注意：看板数据加载逻辑已移至App.tsx中的useEffect，
  // 通过监听currentBoardId变化来触发数据加载
  // 这里不再需要重复的数据加载逻辑

  // 如果没有选中看板，显示选择提示
  if (!boardId || !currentBoard) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            {t('board.selectBoard', { defaultValue: '请选择一个看板' })}
          </h2>
          <p className="text-text-secondary">
            {t('board.selectBoardDescription', {
              defaultValue: '从左侧导航栏选择一个看板开始管理任务',
            })}
          </p>
        </div>
      </div>
    );
  }

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-text-secondary">
            {t('common.loading', { defaultValue: '加载中...' })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`board-container ${className || ''}`}>
      {/* 看板标题区域 */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-text-primary">{currentBoard.name}</h1>
        {currentBoard.description && (
          <p className="text-text-secondary mt-1">{currentBoard.description}</p>
        )}
      </div>

      {/* 这里将包含原有的看板内容 */}
      {/* 包括三个视图：board、list、calendar */}
      {/* 以及所有的拖拽、筛选、搜索功能 */}

      <div className="flex-1">
        {/* TODO: 将App.tsx中的看板内容移到这里 */}
        <div className="text-center text-text-secondary">
          看板内容区域 - 待实现
          <br />
          当前看板: {currentBoard.name}
          <br />
          任务数量: {tasks.length}
          <br />
          列数量: {columns.length}
        </div>
      </div>
    </div>
  );
};

export default BoardContainer;
