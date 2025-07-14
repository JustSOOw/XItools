/**
 * 时间线组件
 * 显示任务的操作历史和状态变更
 */
import React from 'react';
import classNames from 'classnames';
import { useI18n } from '../../hooks/useI18n';

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
  const { t } = useI18n();
  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'created':
        return (
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
        );
      case 'updated':
        return (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
        );
      case 'status_changed':
        return (
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </div>
        );
      case 'assigned':
        return (
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        );
      case 'commented':
        return (
          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
        );
      case 'completed':
        return (
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
    }
  };

  const getEventTypeText = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'created':
        return t('task:timeline.events.created');
      case 'updated':
        return t('task:timeline.events.updated');
      case 'status_changed':
        return t('task:timeline.events.statusChanged');
      case 'assigned':
        return t('task:timeline.events.assigned');
      case 'commented':
        return t('task:timeline.events.commented');
      case 'completed':
        return t('task:timeline.events.completed');
      default:
        return t('task:timeline.events.unknown');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    // 验证时间戳是否有效
    if (!timestamp) {
      return t('task:timeline.time.unknown');
    }

    const date = new Date(timestamp);

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp:', timestamp);
      return t('task:timeline.time.unknown');
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return t('task:timeline.time.justNow');
    if (diffMins < 60) return t('task:timeline.time.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('task:timeline.time.hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('task:timeline.time.daysAgo', { count: diffDays });

    try {
      return new Intl.DateTimeFormat(t('common:locale'), {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (error) {
      console.warn('Error formatting date:', error);
      return t('task:timeline.time.unknown');
    }
  };

  if (events.length === 0) {
    return (
      <div className={classNames('text-center py-8 text-text-secondary', className)}>
        <svg
          className="w-12 h-12 mx-auto mb-4 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p>{t('task:timeline.noHistory')}</p>
      </div>
    );
  }

  return (
    <div className={classNames('relative', className)}>
      <div className="overflow-y-auto" style={{ maxHeight }}>
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={event.id} className="relative flex items-start space-x-3">
              {/* 时间线连接线 */}
              {index < events.length - 1 && (
                <div className="absolute left-4 top-8 w-0.5 h-full bg-border -translate-x-0.5"></div>
              )}

              {/* 事件图标 */}
              <div className="flex-shrink-0">{getEventIcon(event.type)}</div>

              {/* 事件内容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-text-primary">
                      {event.title && event.title.trim()
                        ? event.title
                        : getEventTypeText(event.type)}
                    </h4>
                    {event.user && (
                      <span className="text-xs text-text-secondary">
                        {t('task:timeline.by')} {event.user}
                      </span>
                    )}
                  </div>
                  <time className="text-xs text-text-secondary flex-shrink-0">
                    {formatTimestamp(event.timestamp)}
                  </time>
                </div>

                {event.description && (
                  <p className="mt-1 text-sm text-text-secondary">{event.description}</p>
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

// 验证时间戳是否有效的辅助函数
const isValidTimestamp = (timestamp: any): boolean => {
  if (!timestamp) return false;
  const date = new Date(timestamp);
  return !isNaN(date.getTime());
};

// 生成示例时间线事件的工具函数
// 注意：这个函数需要在组件内部调用以访问翻译函数
export const generateTimelineEvents = (
  task: any,
  t?: (key: string, options?: any) => string,
): TimelineEvent[] => {
  const events: TimelineEvent[] = [];

  // 获取有效的时间戳，如果无效则使用当前时间
  const getValidTimestamp = (timestamp: any): string => {
    if (isValidTimestamp(timestamp)) {
      return timestamp;
    }
    console.warn('Invalid timestamp detected, using current time:', timestamp);
    return new Date().toISOString();
  };

  // 创建事件
  if (task.createdAt || task.id) {
    events.push({
      id: `created-${task.id}`,
      type: 'created',
      title: '', // 移除硬编码title，让组件使用翻译函数
      description: t
        ? t('task:timeline.descriptions.created', { title: task.title })
        : `创建了任务 "${task.title}"`,
      timestamp: getValidTimestamp(task.createdAt),
      user: task.assignee || (t ? t('task:timeline.system') : '系统'),
    });
  }

  // 如果有更新时间且不同于创建时间，添加更新事件
  if (task.updatedAt && task.updatedAt !== task.createdAt && isValidTimestamp(task.updatedAt)) {
    events.push({
      id: `updated-${task.id}`,
      type: 'updated',
      title: '', // 移除硬编码title
      description: t ? t('task:timeline.descriptions.updated') : '任务信息已更新',
      timestamp: getValidTimestamp(task.updatedAt),
      user: task.assignee || (t ? t('task:timeline.system') : '系统'),
    });
  }

  // 根据状态添加状态变更事件
  if (task.status === 'completed' || task.status === '已完成') {
    events.push({
      id: `completed-${task.id}`,
      type: 'completed',
      title: '', // 移除硬编码title
      description: t ? t('task:timeline.descriptions.completed') : '任务已标记为完成',
      timestamp: getValidTimestamp(task.updatedAt || task.createdAt),
      user: task.assignee || (t ? t('task:timeline.system') : '系统'),
    });
  }

  // 过滤掉无效的事件并按时间排序（最新的在前）
  return events
    .filter((event) => isValidTimestamp(event.timestamp))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export default Timeline;
