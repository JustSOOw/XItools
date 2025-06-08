/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-06-08 14:39:09
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-06-08 15:13:48
 * @FilePath: \XItools\frontend\src\components\ColumnDragOverlay.tsx
 * @Description: 
 * 
 * Copyright (c) 2025 by Furdow, All Rights Reserved. 
 */
import React from 'react';
import { BoardColumn } from '../store/taskStore';
import { Task } from '../types/Task';

interface ColumnDragOverlayProps {
  column: BoardColumn;
  tasks: Task[];
}

const ColumnDragOverlay: React.FC<ColumnDragOverlayProps> = ({
  column,
  tasks
}) => {
  return (
    <div className="transform rotate-2 scale-105 shadow-2xl opacity-95">
      <div className="flex flex-col w-72 rounded-lg shadow bg-surface border border-border max-h-96 overflow-hidden">
        {/* 列标题 */}
        <div className="p-3 border-b border-border bg-surface">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* 拖拽手柄图标 */}
              <div className="mr-2 p-1 text-text-secondary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>

              <h3 className="font-medium text-text-primary flex items-center">
                <span>{column.name}</span>
                <span className="ml-2 px-2 py-0.5 bg-accent/10 text-accent rounded-full text-xs">
                  {tasks.length}
                </span>
              </h3>
            </div>

            <div className="flex items-center space-x-1">
              <div className="p-1 rounded-md text-text-secondary opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 列内容 - 显示实际的任务卡片 */}
        <div className="flex-1 p-2 overflow-y-auto">
          {tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-border shadow-sm opacity-90"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-text-primary line-clamp-2">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-text-secondary mt-1 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </div>

                    {task.priority && (
                      <span className={`
                        ml-2 px-1.5 py-0.5 text-xs rounded-full font-medium
                        ${task.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : ''}
                        ${task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' : ''}
                        ${task.priority === 'Low' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : ''}
                      `}>
                        {task.priority === 'High' ? '高' : task.priority === 'Medium' ? '中' : '低'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center text-text-secondary text-sm">
              暂无任务
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColumnDragOverlay;
