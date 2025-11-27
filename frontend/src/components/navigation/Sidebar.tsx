/**
 * 多级导航侧边栏组件
 */

import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { useNavigationStore } from '../../store/navigationStore';
import { useTeamStore } from '../../store/teamStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { useI18n } from '../../hooks/useI18n';
import globalConfirmDialog from '../../services/globalConfirmDialog';
import { toast } from '../ui/Toast';
import SidebarItem from './SidebarItem';
import CreateMenu from './CreateMenu';
import CreateSelector from './CreateSelector';
import ThemeToggle from '../ThemeToggle';
import { UserMenu } from '../auth/UserMenu';
import CreateTeamDialog from '../team/CreateTeamDialog';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  UserGroupIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { SidebarExpandIcon, SidebarCollapseIcon } from '../icons/SidebarIcons';


interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse, onOpenSettings }) => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showCreateSelector, setShowCreateSelector] = useState(false);
  const [createMenuType, setCreateMenuType] = useState<'workspace' | 'project' | 'board'>(
    'workspace',
  );
  const [createMenuParentId, setCreateMenuParentId] = useState<string | undefined>();
  const [selectorWorkspaceId, setSelectorWorkspaceId] = useState<string | undefined>();
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);

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
    batchSetExpanded,
    initialize,
  } = useNavigationStore();

  const { teams, fetchMyTeam, currentTeam, selectTeam } = useTeamStore();

  useEffect(() => {
    fetchMyTeam();
  }, [fetchMyTeam]);

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
        // 如果有 parentId，说明是在团队下创建工作区
        let newWorkspaceId: string;
        if (createMenuParentId) {
          newWorkspaceId = await store.createWorkspace({ ...data, teamId: createMenuParentId });
        } else {
          newWorkspaceId = await store.createWorkspace(data);
        }
        // 创建成功提示
        toast.success(t('navigation.workspaceCreated', { defaultValue: `工作区"${data.name}"创建成功` }));
        // 自动选中新创建的工作区
        selectWorkspace(newWorkspaceId);
        // 如果在其他页面，导航回主页
        if (location.pathname !== '/') {
          navigate('/');
        }
      } else if (createMenuType === 'project' && createMenuParentId) {
        const newProjectId = await store.createProject(createMenuParentId, data);
        // 创建成功提示
        toast.success(t('navigation.projectCreated', { defaultValue: `项目"${data.name}"创建成功` }));
        // 展开父工作区并选中新项目
        if (!expandedWorkspaces.has(createMenuParentId)) {
          toggleWorkspaceExpanded(createMenuParentId);
        }
        selectProject(newProjectId);
        // 如果在其他页面，导航回主页
        if (location.pathname !== '/') {
          navigate('/');
        }
      } else if (createMenuType === 'board') {
        let boardData: { name: string; description?: string; projectId?: string; workspaceId?: string };
        if (createMenuParentId) {
          // 检查parentId是项目还是工作区
          const project = projects.find((p) => p.id === createMenuParentId);
          if (project) {
            boardData = { ...data, projectId: createMenuParentId };
          } else {
            boardData = { ...data, workspaceId: createMenuParentId };
          }
        } else {
          // 默认创建到当前工作区
          boardData = { ...data, workspaceId: currentWorkspaceId || undefined };
        }
        const newBoardId = await store.createBoard(boardData);
        // 创建成功提示
        toast.success(t('navigation.boardCreated', { defaultValue: `看板"${data.name}"创建成功` }));
        // 展开父级并选中新看板
        if (boardData.projectId) {
          // 看板在项目下
          const parentProject = projects.find((p) => p.id === boardData.projectId);
          if (parentProject) {
            // 确保工作区展开
            if (!expandedWorkspaces.has(parentProject.workspaceId)) {
              toggleWorkspaceExpanded(parentProject.workspaceId);
            }
            // 确保项目展开
            if (!expandedProjects.has(boardData.projectId)) {
              toggleProjectExpanded(boardData.projectId);
            }
          }
        } else if (boardData.workspaceId) {
          // 看板直接在工作区下
          if (!expandedWorkspaces.has(boardData.workspaceId)) {
            toggleWorkspaceExpanded(boardData.workspaceId);
          }
        }
        selectBoard(newBoardId);
        // 如果在其他页面，导航回主页
        if (location.pathname !== '/') {
          navigate('/');
        }
      }

      setShowCreateMenu(false);
    } catch (error) {
      console.error('创建失败:', error);
      throw error; // 让CreateMenu组件处理错误显示
    }
  };

  // 处理重命名
  const handleRename = async (
    type: 'workspace' | 'project' | 'board',
    id: string,
    newName: string,
  ) => {
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
      const errorMessage = error instanceof Error ? error.message : '重命名失败';
      toast.error(errorMessage);
    }
  };
  // 检查指定范围是否全部已展开
  const checkIsAllExpanded = (scope: 'personal' | 'team') => {
    let targetWorkspaces: any[] = [];
    let targetProjects: any[] = [];

    if (scope === 'personal') {
      targetWorkspaces = workspaces.filter((ws) => !ws.teamId);
    } else {
      targetWorkspaces = workspaces.filter((ws) => ws.teamId);
    }

    // 收集所有相关项目
    targetWorkspaces.forEach((ws) => {
      const wsProjects = getProjectsByWorkspace(ws.id);
      targetProjects = [...targetProjects, ...wsProjects];
    });

    // 检查是否全部已展开
    const allWorkspacesExpanded = targetWorkspaces.every((ws) => expandedWorkspaces.has(ws.id));
    const allProjectsExpanded = targetProjects.every((p) => expandedProjects.has(p.id));

    return {
      isAllExpanded: allWorkspacesExpanded && allProjectsExpanded,
      targetWorkspaces,
      targetProjects
    };
  };

  // 处理一键展开/收纳
  const handleToggleAll = (scope: 'personal' | 'team') => {
    const { isAllExpanded, targetWorkspaces, targetProjects } = checkIsAllExpanded(scope);

    // 切换状态
    const workspaceIds = targetWorkspaces.map((ws) => ws.id);
    const projectIds = targetProjects.map((p) => p.id);

    batchSetExpanded(workspaceIds, projectIds, !isAllExpanded);
  };

  // 渲染工作区项目
  const renderWorkspaceItem = (workspace: any) => {
    const isExpanded = expandedWorkspaces.has(workspace.id);
    const isSelected = currentWorkspaceId === workspace.id && !currentProjectId && !currentBoardId;
    const workspaceProjects = getProjectsByWorkspace(workspace.id);
    const workspaceBoards = getBoardsByWorkspace(workspace.id);

    // 检查是否可以删除工作区（不是默认工作区且没有项目和看板）
    const canDeleteWorkspace =
      !workspace.isDefault && workspaceProjects.length === 0 && workspaceBoards.length === 0;

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
            // 如果当前在团队设置或其他页面，导航回主页面
            if (location.pathname !== '/') {
              navigate('/');
            }
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
                  workspaceName: workspace.name,
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
                  const errorMessage = error instanceof Error ? error.message : '删除工作区失败';
                  toast.error(errorMessage);
                }
              },
            );
          }}
          onRename={(newName) => handleRename('workspace', workspace.id, newName)}
        />

        {/* 展开时显示项目和直属看板 */}
        {isExpanded && !isCollapsed && (
          <div className="ml-4">
            {/* 项目列表 */}
            {workspaceProjects.map((project) => renderProjectItem(project))}

            {/* 工作区直属看板 */}
            {workspaceBoards.map((board) => renderBoardItem(board))}
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
            // 如果当前在团队设置或其他页面，导航回主页面
            if (location.pathname !== '/') {
              navigate('/');
            }
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
                  projectName: project.name,
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
                  const errorMessage = error instanceof Error ? error.message : '删除项目失败';
                  toast.error(errorMessage);
                }
              },
            );
          }}
          onRename={(newName) => handleRename('project', project.id, newName)}
        />

        {/* 展开时显示项目下的看板 */}
        {isExpanded && !isCollapsed && (
          <div className="ml-4">{projectBoards.map((board) => renderBoardItem(board))}</div>
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
        onSelect={() => {
          selectBoard(board.id);
          // 如果当前在团队设置或其他页面，导航回主页面
          if (location.pathname !== '/') {
            navigate('/');
          }
        }}
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
                    taskCount: tasks.length,
                  }),
                  type: 'warning',
                  confirmText: t('common:actions.ok'),
                },
                () => {
                  // 只有确认按钮，不执行删除操作
                },
              );
              return;
            }

            // 如果没有任务，显示删除确认
            globalConfirmDialog.show(
              {
                title: t('navigation.deleteBoardTitle', { defaultValue: '删除看板' }),
                message: t('navigation.deleteBoardMessage', {
                  defaultValue: `确定要删除看板"${board.name}"吗？此操作不可撤销。`,
                  boardName: board.name,
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
                  const errorMessage = error instanceof Error ? error.message : '删除看板失败';
                  toast.error(errorMessage);
                }
              },
            );
          } catch (error) {
            console.error('检查看板任务失败:', error);
            // 如果检查失败，仍然显示删除确认，让后端处理
            globalConfirmDialog.show(
              {
                title: t('navigation.deleteBoardTitle', { defaultValue: '删除看板' }),
                message: t('navigation.deleteBoardMessage', {
                  defaultValue: `确定要删除看板"${board.name}"吗？此操作不可撤销。`,
                  boardName: board.name,
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
                  const errorMessage = error instanceof Error ? error.message : '删除看板失败';
                  toast.error(errorMessage);
                }
              },
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
        isCollapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo区域 */}
      <div
        className={classNames(
          'h-16 border-b border-border/30 flex items-center px-4 mb-2',
          isCollapsed ? 'justify-center' : 'justify-between',
        )}
      >
        {!isCollapsed && <h1 className="text-xl font-bold text-primary">XItools</h1>}
        {isCollapsed && <span className="text-xl font-bold text-primary">XI</span>}

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-element hover:bg-primary/10 text-text-secondary hover:text-primary transition-all duration-200"
          aria-label={isCollapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-5 w-5" />
          ) : (
            <ChevronLeftIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 overflow-y-auto py-2">
        <div className="space-y-1 px-3">
          {/* ===== 个人工作区部分 ===== */}
          {!isCollapsed && (
            <div className="flex items-center justify-between mb-2 px-2 group/header">
              <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                {t('common:navigation.personalWorkspace', { defaultValue: '个人工作区' })}
              </div>
              <button
                onClick={() => handleToggleAll('personal')}
                className="p-1 rounded hover:bg-surface/50 text-text-tertiary hover:text-text-secondary transition-colors opacity-0 group-hover/header:opacity-100"
                title={t('common:action.toggleAll', { defaultValue: '展开/收纳全部' })}
              >
                {checkIsAllExpanded('personal').isAllExpanded ? (
                  <SidebarCollapseIcon className="h-3.5 w-3.5" />
                ) : (
                  <SidebarExpandIcon className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          )}

          {/* 个人工作区列表（teamId === null） */}
          {workspaces
            .filter((ws) => !ws.teamId)
            .map((workspace) => renderWorkspaceItem(workspace))}

          {/* 新建个人工作区按钮 */}
          {!isCollapsed && (
            <button
              onClick={() => handleShowCreateMenu('workspace')}
              className="w-full flex items-center px-3 py-2.5 text-text-secondary hover:text-text-primary hover:bg-surface/50 rounded-lg transition-all duration-200"
            >
              <PlusIcon className="h-5 w-5 flex-shrink-0" />
              <span className="ml-3">
                {t('common:navigation.createWorkspace', { defaultValue: '新建工作区' })}
              </span>
            </button>
          )}

          <div className="border-t border-border/30 my-4"></div>

          {/* ===== 团队部分 ===== */}
          {!isCollapsed && teams.length > 0 && (
            <div className="flex items-center justify-between mb-2 px-2 group/header">
              <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                {t('team:common.team', { defaultValue: '团队' })}
              </div>
              <button
                onClick={() => handleToggleAll('team')}
                className="p-1 rounded hover:bg-surface/50 text-text-tertiary hover:text-text-secondary transition-colors opacity-0 group-hover/header:opacity-100"
                title={t('common:action.toggleAll', { defaultValue: '展开/收纳全部' })}
              >
                {checkIsAllExpanded('team').isAllExpanded ? (
                  <SidebarCollapseIcon className="h-3.5 w-3.5" />
                ) : (
                  <SidebarExpandIcon className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          )}

          {teams.map((team) => {
            // 获取团队下的工作区（teamId 等于 team.id 的工作区）
            const teamWorkspaces = workspaces.filter((ws: any) => ws.teamId === team.id);
            // const isTeamExpanded = expandedWorkspaces.has(team.id); // No longer needed

            return (
              <div key={team.id} className="mb-1">
                {/* 团队节点 - 使用自定义样式，不是工作区 */}
                <div
                  className={classNames(
                    'group flex items-center px-3 py-2.5 rounded-lg transition-all duration-200',
                    'hover:bg-surface/50',
                    isCollapsed ? 'justify-center' : 'justify-between'
                  )}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <div
                      className="flex items-center flex-1 min-w-0"
                    >
                      <UserGroupIcon className="h-5 w-5 flex-shrink-0 text-primary" />
                      {!isCollapsed && (
                        <span className="ml-3 text-sm font-medium text-text-primary truncate">
                          {team.name}
                        </span>
                      )}
                    </div>
                    {!isCollapsed && (
                      <button
                        onClick={() => {
                          selectTeam(team);
                          navigate(`/team/settings?teamId=${team.id}`);
                        }}
                        className="ml-2 p-1 rounded hover:bg-primary/10 text-text-secondary hover:text-primary transition-colors"
                        title={t('team:action.teamSettings', { defaultValue: '团队设置' })}
                      >
                        <Cog6ToothIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 始终显示团队下的工作区 */}
                {!isCollapsed && (
                  <div className="ml-4 mt-1 space-y-1">
                    {teamWorkspaces.map((workspace: any) => renderWorkspaceItem(workspace))}

                    {/* 团队工作区创建按钮 - 独立显示 */}
                    <button
                      onClick={() => handleShowCreateMenu('workspace', team.id)}
                      className="w-full flex items-center px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface/30 rounded-lg transition-all duration-200"
                    >
                      <PlusIcon className="h-4 w-4 flex-shrink-0" />
                      <span className="ml-3">
                        {t('team:action.createTeamWorkspace', { defaultValue: '新建团队工作区' })}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* 新建/加入团队按钮 - 仅在无团队时显示 */}
          {!isCollapsed && teams.length === 0 && (
            <button
              onClick={() => setShowCreateTeamDialog(true)}
              className="w-full flex items-center justify-center px-3 py-3 mt-2 text-text-secondary hover:text-primary border-2 border-dashed border-border hover:border-primary rounded-lg transition-all duration-200 group"
            >
              <UserGroupIcon className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="ml-2 font-medium">
                {t('team:action.createOrJoin', { defaultValue: '创建或加入团队' })}
              </span>
            </button>
          )}
        </div>
      </nav>

      {/* 底部控制区 */}
      <div className="p-3 border-t border-border/30 mt-2 space-y-2">
        {/* 用户菜单 */}
        <UserMenu isCollapsed={isCollapsed} />



        {/* 设置和主题切换按钮行 */}
        <div className={classNames('flex gap-2', isCollapsed ? 'flex-col' : 'flex-row')}>
          {/* 设置按钮 - 固定宽度，只显示图标和简短文字 */}
          <button
            onClick={onOpenSettings}
            className={classNames(
              'flex items-center px-3 py-2.5 text-text-secondary hover:text-text-primary hover:bg-surface/50 rounded-lg transition-all duration-200',
              isCollapsed ? 'w-full justify-center' : 'flex-shrink-0 justify-start',
            )}
          >
            <Cog6ToothIcon className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3">{t('common:navigation.settings')}</span>}
          </button>



          {/* 主题切换按钮 - 占用剩余空间，确保文字完整显示 */}
          <div className={classNames(isCollapsed ? 'w-full' : 'flex-1 min-w-0')}>
            <ThemeToggle showLabel={!isCollapsed} size="md" variant="button" className="w-full" />
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
          workspaceName={workspaces.find((w) => w.id === selectorWorkspaceId)?.name}
        />
      )}

      {/* 创建团队对话框 */}
      <CreateTeamDialog
        isOpen={showCreateTeamDialog}
        onClose={() => setShowCreateTeamDialog(false)}
      />
    </aside>
  );
};

export default Sidebar;
