/**
 * 时间线组件
 * 显示任务的操作历史和状态变更
 */
import React from 'react';
import classNames from 'classnames';

export interface TimelineEvent {
  id: string;
  type: 'created' | 'updated' | 'status_changed' | 'assigned' | 'commented' | 'completed';
  title: string;
  description?: string;
  timestamp: string;
  user?: string;
  metadata?: Record<string, any>;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
  showUserAvatars?: boolean;
  maxHeight?: string;
}

const Timeline: React.FC<TimelineProps> = ({
  events,
  className = '',
  showUserAvatars = false,
  maxHeight = '300px',
}) => {
  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'created':
        return (
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
      case 'updated':
        return (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        );
      case 'status_changed':
        return (
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
        );
      case 'assigned':
        return (
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case 'commented':
        return (
          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        );
      case 'completed':
        return (
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getEventTypeText = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'created': return '创建任务';
      case 'updated': return '更新任务';
      case 'status_changed': return '状态变更';
      case 'assigned': return '分配任务';
      case 'commented': return '添加评论';
      case 'completed': return '完成任务';
      default: return '未知操作';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (events.length === 0) {
    return (
      <div className={classNames('text-center py-8 text-text-secondary', className)}>
        <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>暂无操作历史</p>
      </div>
    );
  }

  return (
    <div className={classNames('relative', className)}>
      <div 
        className="overflow-y-auto"
        style={{ maxHeight }}
      >
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={event.id} className="relative flex items-start space-x-3">
              {/* 时间线连接线 */}
              {index < events.length - 1 && (
                <div className="absolute left-4 top-8 w-0.5 h-full bg-border -translate-x-0.5"></div>
              )}

              {/* 事件图标 */}
              <div className="flex-shrink-0">
                {getEventIcon(event.type)}
              </div>

              {/* 事件内容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-text-primary">
                      {event.title || getEventTypeText(event.type)}
                    </h4>
                    {event.user && (
                      <span className="text-xs text-text-secondary">
                        by {event.user}
                      </span>
                    )}
                  </div>
                  <time className="text-xs text-text-secondary flex-shrink-0">
                    {formatTimestamp(event.timestamp)}
                  </time>
                </div>

                {event.description && (
                  <p className="mt-1 text-sm text-text-secondary">
                    {event.description}
                  </p>
                )}

                {/* 元数据显示 */}
                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <div className="mt-2 space-y-1">
                    {Object.entries(event.metadata).map(([key, value]) => (
                      <div key={key} className="text-xs text-text-secondary">
                        <span className="font-medium">{key}:</span>{' '}
                        <span className="font-mono bg-accent/10 px-1 rounded">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 生成示例时间线事件的工具函数
export const generateTimelineEvents = (task: any): TimelineEvent[] => {
  const events: TimelineEvent[] = [];

  // 创建事件
  events.push({
    id: `created-${task.id}`,
    type: 'created',
    title: '任务创建',
    description: `创建了任务 "${task.title}"`,
    timestamp: task.createdAt,
    user: task.assignee || '系统',
  });

  // 如果有更新时间且不同于创建时间，添加更新事件
  if (task.updatedAt && task.updatedAt !== task.createdAt) {
    events.push({
      id: `updated-${task.id}`,
      type: 'updated',
      title: '任务更新',
      description: '任务信息已更新',
      timestamp: task.updatedAt,
      user: task.assignee || '系统',
    });
  }

  // 根据状态添加状态变更事件
  if (task.status === 'completed' || task.status === '已完成') {
    events.push({
      id: `completed-${task.id}`,
      type: 'completed',
      title: '任务完成',
      description: '任务已标记为完成',
      timestamp: task.updatedAt || task.createdAt,
      user: task.assignee || '系统',
    });
  }

  // 按时间排序（最新的在前）
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export default Timeline;
