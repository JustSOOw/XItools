/**
 * 多级导航侧边栏组件
 */

import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { useNavigationStore } from '../../store/navigationStore';
import { useI18n } from '../../hooks/useI18n';
import globalConfirmDialog from '../../services/globalConfirmDialog';
import SidebarItem from './SidebarItem';
import CreateMenu from './CreateMenu';
import CreateSelector from './CreateSelector';
import ThemeToggle from '../ThemeToggle';
import { UserMenu } from '../auth/UserMenu';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  onOpenSettings
}) => {
  const { t } = useI18n();
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showCreateSelector, setShowCreateSelector] = useState(false);
  const [createMenuType, setCreateMenuType] = useState<'workspace' | 'project' | 'board'>('workspace');
  const [createMenuParentId, setCreateMenuParentId] = useState<string | undefined>();
  const [selectorWorkspaceId, setSelectorWorkspaceId] = useState<string | undefined>();

  // 从导航store获取状态
  const {
    workspaces,
    projects,
    boards,
    currentWorkspaceId,
    currentProjectId,
    currentBoardId,
    expandedWorkspaces,
    expandedProjects,
    getProjectsByWorkspace,
    getBoardsByProject,
    getBoardsByWorkspace,
    selectWorkspace,
    selectProject,
    selectBoard,
    toggleWorkspaceExpanded,
    toggleProjectExpanded,
    initialize
  } = useNavigationStore();

  // 初始化数据
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 处理新建菜单
  const handleShowCreateMenu = (type: 'workspace' | 'project' | 'board', parentId?: string) => {
    setCreateMenuType(type);
    setCreateMenuParentId(parentId);
    setShowCreateMenu(true);
  };

  // 显示工作区创建选择器
  const handleShowCreateSelector = (workspaceId: string) => {
    setSelectorWorkspaceId(workspaceId);
    setShowCreateSelector(true);
  };

  // 处理选择器选择结果
  const handleSelectorSelect = (type: 'project' | 'board') => {
    setCreateMenuType(type);
    setCreateMenuParentId(selectorWorkspaceId);
    setShowCreateMenu(true);
  };

  // 处理创建确认
  const handleCreateConfirm = async (data: { name: string; description?: string }) => {
    try {
      const store = useNavigationStore.getState();

      if (createMenuType === 'workspace') {
        await store.createWorkspace(data);
      } else if (createMenuType === 'project' && createMenuParentId) {
        await store.createProject(createMenuParentId, data);
      } else if (createMenuType === 'board') {
        if (createMenuParentId) {
          // 检查parentId是项目还是工作区
          const project = projects.find(p => p.id === createMenuParentId);
          if (project) {
            await store.createBoard({ ...data, projectId: createMenuParentId });
          } else {
            await store.createBoard({ ...data, workspaceId: createMenuParentId });
          }
        } else {
          // 默认创建到当前工作区
          await store.createBoard({ ...data, workspaceId: currentWorkspaceId });
        }
      }

      setShowCreateMenu(false);
      console.log('创建成功:', createMenuType, data.name);
    } catch (error) {
      console.error('创建失败:', error);
      throw error; // 让CreateMenu组件处理错误显示
    }
  };

  // 处理重命名
  const handleRename = async (type: 'workspace' | 'project' | 'board', id: string, newName: string) => {
    try {
      const store = useNavigationStore.getState();

      if (type === 'workspace') {
        await store.renameWorkspace(id, newName);
      } else if (type === 'project') {
        await store.renameProject(id, newName);
      } else if (type === 'board') {
        await store.renameBoard(id, newName);
      }

      console.log('重命名成功:', type, newName);
    } catch (error) {
      console.error('重命名失败:', error);
    }
  };

  // 渲染工作区项目
  const renderWorkspaceItem = (workspace: any) => {
    const isExpanded = expandedWorkspaces.has(workspace.id);
    const isSelected = currentWorkspaceId === workspace.id && !currentProjectId && !currentBoardId;
    const workspaceProjects = getProjectsByWorkspace(workspace.id);
    const workspaceBoards = getBoardsByWorkspace(workspace.id);

    // 检查是否可以删除工作区（不是默认工作区且没有项目和看板）
    const canDeleteWorkspace = !workspace.isDefault && workspaceProjects.length === 0 && workspaceBoards.length === 0;

    return (
      <div key={workspace.id}>
        <SidebarItem
          type="workspace"
          item={workspace}
          level={0}
          isExpanded={isExpanded}
          isSelected={isSelected}
          isCollapsed={isCollapsed}
          canDelete={canDeleteWorkspace}
          onSelect={() => {
            selectWorkspace(workspace.id);
            // 自动展开工作区
            if (!isExpanded) {
              toggleWorkspaceExpanded(workspace.id);
            }
          }}
          onToggle={() => toggleWorkspaceExpanded(workspace.id)}
          onAdd={() => handleShowCreateSelector(workspace.id)}
          onDelete={() => {
            globalConfirmDialog.show(
              {
                title: t('navigation.deleteWorkspaceTitle', { defaultValue: '删除工作区' }),
                message: t('navigation.deleteWorkspaceMessage', {
                  defaultValue: `确定要删除工作区"${workspace.name}"吗？此操作不可撤销，将同时删除其下的所有项目和看板。`,
                  workspaceName: workspace.name
                }),
                type: 'danger',
                confirmText: t('common:actions.delete'),
                cancelText: t('common:actions.cancel'),
              },
              async () => {
                try {
                  const store = useNavigationStore.getState();
                  await store.removeWorkspace(workspace.id);
                  console.log('删除工作区成功:', workspace.id);
                } catch (error) {
                  console.error('删除工作区失败:', error);
                  // 这里可以添加错误提示，但不使用alert
                }
              }
            );
          }}
          onRename={(newName) => handleRename('workspace', workspace.id, newName)}
        />

        {/* 展开时显示项目和直属看板 */}
        {isExpanded && !isCollapsed && (
          <div className="ml-4">
            {/* 项目列表 */}
            {workspaceProjects.map(project => renderProjectItem(project))}

            {/* 工作区直属看板 */}
            {workspaceBoards.map(board => renderBoardItem(board))}
          </div>
        )}
      </div>
    );
  };

  // 渲染项目项目
  const renderProjectItem = (project: any) => {
    const isExpanded = expandedProjects.has(project.id);
    const isSelected = currentProjectId === project.id && !currentBoardId;
    const projectBoards = getBoardsByProject(project.id);

    // 检查是否可以删除项目（没有看板）
    const canDeleteProject = projectBoards.length === 0;

    return (
      <div key={project.id}>
        <SidebarItem
          type="project"
          item={project}
          level={1}
          isExpanded={isExpanded}
          isSelected={isSelected}
          isCollapsed={isCollapsed}
          canDelete={canDeleteProject}
          onSelect={() => {
            selectProject(project.id);
            // 自动展开项目
            if (!isExpanded) {
              toggleProjectExpanded(project.id);
            }
          }}
          onToggle={() => toggleProjectExpanded(project.id)}
          onAdd={() => handleShowCreateMenu('board', project.id)}
          onDelete={() => {
            globalConfirmDialog.show(
              {
                title: t('navigation.deleteProjectTitle', { defaultValue: '删除项目' }),
                message: t('navigation.deleteProjectMessage', {
                  defaultValue: `确定要删除项目"${project.name}"吗？此操作不可撤销，将同时删除其下的所有看板。`,
                  projectName: project.name
                }),
                type: 'danger',
                confirmText: t('common:actions.delete'),
                cancelText: t('common:actions.cancel'),
              },
              async () => {
                try {
                  const store = useNavigationStore.getState();
                  await store.removeProject(project.id);
                  console.log('删除项目成功:', project.id);
                } catch (error) {
                  console.error('删除项目失败:', error);
                }
              }
            );
          }}
          onRename={(newName) => handleRename('project', project.id, newName)}
        />

        {/* 展开时显示项目下的看板 */}
        {isExpanded && !isCollapsed && (
          <div className="ml-4">
            {projectBoards.map(board => renderBoardItem(board))}
          </div>
        )}
      </div>
    );
  };

  // 渲染看板项目
  const renderBoardItem = (board: any) => {
    const isSelected = currentBoardId === board.id;

    return (
      <SidebarItem
        key={board.id}
        type="board"
        item={board}
        level={board.projectId ? 2 : 1}
        isSelected={isSelected}
        isCollapsed={isCollapsed}
        canDelete={true}
        onSelect={() => selectBoard(board.id)}
        onDelete={async () => {
          // 先检查看板是否有任务
          try {
            const { multiBoardService } = await import('../../services/multiBoardService');
            const tasks = await multiBoardService.getTasksByBoard(board.id);

            if (tasks.length > 0) {
              globalConfirmDialog.show(
                {
                  title: t('navigation.cannotDeleteBoardTitle', { defaultValue: '无法删除看板' }),
                  message: t('navigation.cannotDeleteBoardMessage', {
                    defaultValue: `看板"${board.name}"中还有 ${tasks.length} 个任务，请先删除或移动所有任务后再删除看板。`,
                    boardName: board.name,
                    taskCount: tasks.length
                  }),
                  type: 'warning',
                  confirmText: t('common:actions.ok'),
                },
                () => {
                  // 只有确认按钮，不执行删除操作
                }
              );
              return;
            }

            // 如果没有任务，显示删除确认
            globalConfirmDialog.show(
              {
                title: t('navigation.deleteBoardTitle', { defaultValue: '删除看板' }),
                message: t('navigation.deleteBoardMessage', {
                  defaultValue: `确定要删除看板"${board.name}"吗？此操作不可撤销。`,
                  boardName: board.name
                }),
                type: 'danger',
                confirmText: t('common:actions.delete'),
                cancelText: t('common:actions.cancel'),
              },
              async () => {
                try {
                  const store = useNavigationStore.getState();
                  await store.removeBoard(board.id);
                  console.log('删除看板成功:', board.id);
                } catch (error) {
                  console.error('删除看板失败:', error);
                }
              }
            );
          } catch (error) {
            console.error('检查看板任务失败:', error);
            // 如果检查失败，仍然显示删除确认，让后端处理
            globalConfirmDialog.show(
              {
                title: t('navigation.deleteBoardTitle', { defaultValue: '删除看板' }),
                message: t('navigation.deleteBoardMessage', {
                  defaultValue: `确定要删除看板"${board.name}"吗？此操作不可撤销。`,
                  boardName: board.name
                }),
                type: 'danger',
                confirmText: t('common:actions.delete'),
                cancelText: t('common:actions.cancel'),
              },
              async () => {
                try {
                  const store = useNavigationStore.getState();
                  await store.removeBoard(board.id);
                  console.log('删除看板成功:', board.id);
                } catch (error) {
                  console.error('删除看板失败:', error);
                }
              }
            );
          }
        }}
        onRename={(newName) => handleRename('board', board.id, newName)}
      />
    );
  };

  return (
    <aside
      className={classNames(
        'sidebar-container transition-all duration-300 ease-in-out flex flex-col',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo区域 */}
      <div className={classNames(
        'h-16 border-b border-border/30 flex items-center px-4 mb-2',
        isCollapsed ? 'justify-center' : 'justify-between'
      )}>
        {!isCollapsed && <h1 className="text-xl font-bold text-primary">XItools</h1>}
        {isCollapsed && <span className="text-xl font-bold text-primary">XI</span>}

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-element hover:bg-primary/10 text-text-secondary hover:text-primary transition-all duration-200"
          aria-label={isCollapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            {isCollapsed ? (
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            )}
          </svg>
        </button>
      </div>
      
      {/* 导航菜单 */}
      <nav className="flex-1 overflow-y-auto py-2">
        <div className="space-y-1 px-3">
          {/* 工作区列表 */}
          {workspaces.map(workspace => renderWorkspaceItem(workspace))}
          
          {/* 新建工作区按钮 */}
          {!isCollapsed && (
            <button
              onClick={() => handleShowCreateMenu('workspace')}
              className="w-full flex items-center px-3 py-2.5 text-text-secondary hover:text-text-primary hover:bg-surface/50 rounded-lg transition-all duration-200"
            >
              <span className="flex-shrink-0">➕</span>
              <span className="ml-3">{t('navigation.newWorkspace', { defaultValue: '新建工作区' })}</span>
            </button>
          )}
        </div>
      </nav>
      
      {/* 底部控制区 */}
      <div className="p-3 border-t border-border/30 mt-2 space-y-2">
        {/* 用户菜单 */}
        <UserMenu isCollapsed={isCollapsed} />

        {/* 设置和主题切换按钮行 */}
        <div className={classNames(
          'flex gap-2',
          isCollapsed ? 'flex-col' : 'flex-row'
        )}>
          {/* 设置按钮 - 固定宽度，只显示图标和简短文字 */}
          <button
            onClick={onOpenSettings}
            className={classNames(
              'flex items-center px-3 py-2.5 text-text-secondary hover:text-text-primary hover:bg-surface/50 rounded-lg transition-all duration-200',
              isCollapsed ? 'w-full justify-center' : 'flex-shrink-0 justify-start'
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            {!isCollapsed && <span className="ml-3">{t('common:navigation.settings')}</span>}
          </button>

          {/* 主题切换按钮 - 占用剩余空间，确保文字完整显示 */}
          <div className={classNames(
            isCollapsed ? 'w-full' : 'flex-1 min-w-0'
          )}>
            <ThemeToggle
              showLabel={!isCollapsed}
              size="md"
              variant="button"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* 新建菜单 */}
      {showCreateMenu && (
        <CreateMenu
          type={createMenuType}
          parentId={createMenuParentId}
          onClose={() => setShowCreateMenu(false)}
          onConfirm={handleCreateConfirm}
        />
      )}

      {/* 创建选择器 */}
      {showCreateSelector && (
        <CreateSelector
          isOpen={showCreateSelector}
          onClose={() => setShowCreateSelector(false)}
          onSelectType={handleSelectorSelect}
          workspaceName={workspaces.find(w => w.id === selectorWorkspaceId)?.name}
        />
      )}
    </aside>
  );
};

export default Sidebar;
