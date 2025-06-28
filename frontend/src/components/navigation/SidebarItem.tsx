/**
 * 侧边栏导航项组件
 */

import React, { useState } from 'react';
import classNames from 'classnames';
import { NavigationItem } from '../../store/navigationStore';

interface SidebarItemProps {
  type: 'workspace' | 'project' | 'board';
  item: NavigationItem;
  level: number;
  isExpanded?: boolean;
  isSelected?: boolean;
  isCollapsed?: boolean;
  canDelete?: boolean;
  onSelect: () => void;
  onToggle?: () => void;
  onAdd?: () => void;
  onDelete?: () => void;
  onRename?: (newName: string) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  type,
  item,
  level,
  isExpanded,
  isSelected,
  isCollapsed,
  canDelete,
  onSelect,
  onToggle,
  onAdd,
  onDelete,
  onRename
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(item.name);

  // 获取图标
  const getIcon = () => {
    if (item.icon) {
      return item.icon;
    }
    
    switch (type) {
      case 'workspace':
        return '🏠';
      case 'project':
        return '📁';
      case 'board':
        return '📋';
      default:
        return '📄';
    }
  };

  // 获取展开/收起图标
  const getExpandIcon = () => {
    if (type === 'board') return null;
    return isExpanded ? '▼' : '▶';
  };

  // 处理点击事件
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  // 处理展开/收起
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggle) {
      onToggle();
    }
  };

  // 处理新建
  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();

    // 直接调用传入的回调，让父组件处理创建逻辑
    if (onAdd) {
      onAdd();
    }
  };

  // 处理删除
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();

    // 只调用父组件传入的删除回调，不在这里执行删除逻辑
    if (onDelete) {
      onDelete();
    }
  };

  // 处理重命名
  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('开始重命名:', item.name);
    setIsRenaming(true);
    setRenameValue(item.name);
  };

  // 确认重命名
  const handleRenameConfirm = async () => {
    console.log('确认重命名:', renameValue.trim(), '原名称:', item.name);

    if (renameValue.trim() && renameValue.trim() !== item.name) {
      try {
        // 优先使用父组件传入的回调，如果没有则使用store方法
        if (onRename) {
          console.log('使用父组件回调重命名');
          await onRename(renameValue.trim());
        } else {
          console.log('使用store方法重命名');
          // 备用方案：直接调用store方法
          const { useNavigationStore } = await import('../../store/navigationStore');
          const store = useNavigationStore.getState();

          if (type === 'workspace') {
            await store.renameWorkspace(item.id, renameValue.trim());
          } else if (type === 'project') {
            await store.renameProject(item.id, renameValue.trim());
          } else if (type === 'board') {
            await store.renameBoard(item.id, renameValue.trim());
          }
        }
        console.log('重命名成功');
      } catch (error) {
        console.error('重命名失败:', error);
        // 重置输入值
        setRenameValue(item.name);
      }
    } else {
      console.log('重命名取消：名称未变化或为空');
    }
    setIsRenaming(false);
  };

  // 取消重命名
  const handleRenameCancel = () => {
    setIsRenaming(false);
    setRenameValue(item.name);
  };

  // 处理重命名输入框的键盘事件
  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      handleRenameConfirm();
    } else if (e.key === 'Escape') {
      handleRenameCancel();
    }
  };

  return (
    <div
      className={classNames(
        'sidebar-item group relative transition-all duration-200',
        `level-${level}`,
        {
          'selected': isSelected,
          'collapsed': isCollapsed
        }
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 主要内容区域 */}
      <div
        className={classNames(
          'flex items-center w-full rounded-lg transition-all duration-300',
          {
            'bg-primary/10 text-primary border-l-4 border-primary': isSelected,
            'hover:bg-surface/50 text-text-secondary hover:text-text-primary hover:shadow-sm hover:scale-[1.02]': !isSelected && !isRenaming,
            'bg-surface/80': isRenaming
          }
        )}
      >
        {/* 左侧内容区域 */}
        <div
          className={classNames(
            'flex items-center min-w-0 px-3 py-2.5 cursor-pointer',
            isCollapsed ? 'justify-center flex-1' : 'flex-1'
          )}
          onClick={!isRenaming ? handleClick : undefined}
        >
          {/* 图标 */}
          <span
            className={classNames(
              'flex-shrink-0 text-lg',
              item.color && `text-[${item.color}]`
            )}
          >
            {getIcon()}
          </span>

          {/* 名称或重命名输入框 */}
          {!isCollapsed && (
            <div className="ml-3 flex-1 min-w-0">
              {isRenaming ? (
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={handleRenameKeyDown}
                  onBlur={(e) => {
                    // 延迟执行，让确认按钮的点击事件先执行
                    setTimeout(() => {
                      if (isRenaming) {
                        handleRenameCancel();
                      }
                    }, 150);
                  }}
                  className="w-full px-2 py-1 text-sm bg-background border-2 border-primary/50 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  autoFocus
                  placeholder="输入新名称..."
                />
              ) : (
                <span
                  className="block text-sm font-medium truncate"
                  title={item.name} // 悬停时显示完整名称
                >
                  {item.name}
                </span>
              )}
            </div>
          )}
        </div>

        {/* 右侧按钮区域 - 使用flex布局，自然排列 */}
        {!isCollapsed && !isRenaming && (
          <div
            className="flex items-center pr-2 flex-shrink-0"
            style={{
              minWidth: isHovered
                ? `${
                    (type !== 'board' ? 32 : 0) + // 展开按钮
                    (onRename ? 32 : 0) + // 重命名按钮
                    ((type === 'workspace' || type === 'project') && onAdd ? 32 : 0) + // 新建按钮
                    (canDelete && onDelete ? 32 : 0) + // 删除按钮
                    8 // 间距
                  }px`
                : `${type !== 'board' ? 32 : 0}px` // 只保留展开按钮的空间
            }}
          >
            {/* 展开/收起按钮 - 始终显示 */}
            {type !== 'board' && (
              <button
                onClick={handleToggle}
                className="p-1.5 rounded hover:bg-primary/20 transition-colors text-xs opacity-70 hover:opacity-100 flex-shrink-0"
                aria-label={isExpanded ? '收起' : '展开'}
              >
                {getExpandIcon()}
              </button>
            )}

            {/* 操作按钮组 - 悬停时显示 */}
            {isHovered && (
              <div className="flex items-center space-x-1 animate-scale-in">
                {/* 重命名按钮 */}
                {onRename && (
                  <button
                    onClick={handleRename}
                    className="p-1.5 rounded text-xs hover:bg-blue-500/20 text-text-secondary hover:text-blue-500 transition-colors flex-shrink-0 z-10"
                    title="重命名"
                  >
                    ✏️
                  </button>
                )}

                {/* 新建按钮 */}
                {(type === 'workspace' || type === 'project') && onAdd && (
                  <button
                    onClick={handleAdd}
                    className="p-1.5 rounded text-xs hover:bg-green-500/20 text-text-secondary hover:text-green-500 transition-colors flex-shrink-0"
                    title={type === 'workspace' ? '新建项目/看板' : '新建看板'}
                  >
                    ➕
                  </button>
                )}

                {/* 删除按钮 */}
                {canDelete && onDelete && (
                  <button
                    onClick={handleDelete}
                    className="p-1.5 rounded text-xs hover:bg-red-500/20 text-text-secondary hover:text-red-500 transition-colors flex-shrink-0"
                    title="删除"
                  >
                    🗑️
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 重命名确认按钮 */}
        {!isCollapsed && isRenaming && (
          <div className="flex items-center space-x-1 pr-2 bg-surface/90 rounded-r-lg">
            <button
              onClick={handleRenameConfirm}
              className="p-1.5 rounded text-xs bg-green-500/10 hover:bg-green-500/20 text-green-600 hover:text-green-700 transition-colors border border-green-200"
              title="确认重命名"
            >
              ✓
            </button>
            <button
              onClick={handleRenameCancel}
              className="p-1.5 rounded text-xs bg-red-500/10 hover:bg-red-500/20 text-red-600 hover:text-red-700 transition-colors border border-red-200"
              title="取消重命名"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* 工具提示 - 在收起状态下显示完整信息 */}
      {isCollapsed && isHovered && (
        <div className="absolute left-full ml-2 top-0 z-50 bg-surface border border-border/30 rounded-lg px-3 py-2 shadow-lg whitespace-nowrap animate-scale-in">
          <div className="text-sm font-medium">{item.name}</div>
          {item.description && (
            <div className="text-xs text-text-secondary mt-1">{item.description}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SidebarItem;
