/**
 * 导航概览组件
 * 当选择工作区或项目时显示的概览界面
 */

import React from 'react';
import { useNavigationStore } from '../../store/navigationStore';
import { useI18n } from '../../hooks/useI18n';

const NavigationOverview: React.FC = () => {
  const { t } = useI18n();

  const {
    currentWorkspaceId,
    currentProjectId,
    currentBoardId,
    getCurrentWorkspace,
    getCurrentProject,
    getProjectsByWorkspace,
    getBoardsByProject,
    getBoardsByWorkspace,
    selectBoard,
  } = useNavigationStore();

  const currentWorkspace = getCurrentWorkspace();
  const currentProject = getCurrentProject();

  // 如果选中了看板，不显示概览
  if (currentBoardId) {
    return null;
  }

  // 显示项目概览
  if (currentProjectId && currentProject) {
    const projectBoards = getBoardsByProject(currentProjectId);

    return (
      <div className="flex-1 p-4">
        <div className="modern-container h-full board-content">
          <div className="h-full overflow-y-auto p-6 custom-scrollbar">
            <div className="max-w-4xl mx-auto animate-fade-in">
              {/* 项目标题 */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-text-primary mb-2">
                  📁 {currentProject.name}
                </h1>
                {currentProject.description && (
                  <p className="text-lg text-text-secondary">{currentProject.description}</p>
                )}
              </div>

              {/* 项目统计 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div
                  className="bg-surface rounded-lg p-6 border border-border animate-slide-up stats-card"
                  style={{ animationDelay: '0.1s' }}
                >
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-500/10 rounded-lg mr-4">
                      <svg
                        className="w-6 h-6 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v10z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-text-primary">{projectBoards.length}</p>
                      <p className="text-text-secondary">
                        {t('navigation.boards', { defaultValue: '看板' })}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="bg-surface rounded-lg p-6 border border-border animate-slide-up stats-card"
                  style={{ animationDelay: '0.2s' }}
                >
                  <div className="flex items-center">
                    <div className="p-3 bg-green-500/10 rounded-lg mr-4">
                      <svg
                        className="w-6 h-6 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-text-primary">0</p>
                      <p className="text-text-secondary">
                        {t('navigation.completedTasks', { defaultValue: '已完成任务' })}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="bg-surface rounded-lg p-6 border border-border animate-slide-up stats-card"
                  style={{ animationDelay: '0.3s' }}
                >
                  <div className="flex items-center">
                    <div className="p-3 bg-orange-500/10 rounded-lg mr-4">
                      <svg
                        className="w-6 h-6 text-orange-500"
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
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-text-primary">0</p>
                      <p className="text-text-secondary">
                        {t('navigation.pendingTasks', { defaultValue: '待处理任务' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 看板列表 */}
              <div>
                <h2 className="text-xl font-semibold text-text-primary mb-4">
                  {t('navigation.projectBoards', { defaultValue: '项目看板' })}
                </h2>

                {projectBoards.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projectBoards.map((board) => (
                      <div
                        key={board.id}
                        onClick={() => selectBoard(board.id)}
                        className="bg-surface rounded-lg p-6 border border-border hover:border-primary/50 cursor-pointer transition-all duration-300 hover:shadow-lg card-hover-lift"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-text-primary">{board.name}</h3>
                          <span className="text-2xl">📋</span>
                        </div>
                        {board.description && (
                          <p className="text-text-secondary text-sm mb-3">{board.description}</p>
                        )}
                        <div className="flex items-center text-xs text-text-secondary">
                          <span>点击进入看板</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      {t('navigation.noBoardsInProject', { defaultValue: '项目中还没有看板' })}
                    </h3>
                    <p className="text-text-secondary">
                      {t('navigation.createFirstBoard', {
                        defaultValue: '创建第一个看板开始管理任务',
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 显示工作区概览
  if (currentWorkspaceId && currentWorkspace) {
    const workspaceProjects = getProjectsByWorkspace(currentWorkspaceId);
    const workspaceBoards = getBoardsByWorkspace(currentWorkspaceId);

    return (
      <div className="flex-1 p-4">
        <div className="modern-container h-full board-content">
          <div className="h-full overflow-y-auto p-6 custom-scrollbar">
            <div className="max-w-4xl mx-auto animate-fade-in">
              {/* 工作区标题 */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-text-primary mb-2">
                  🏠 {currentWorkspace.name}
                </h1>
                {currentWorkspace.description && (
                  <p className="text-lg text-text-secondary">{currentWorkspace.description}</p>
                )}
              </div>

              {/* 工作区统计 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div
                  className="bg-surface rounded-lg p-6 border border-border animate-slide-up stats-card"
                  style={{ animationDelay: '0.1s' }}
                >
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-500/10 rounded-lg mr-4">
                      <svg
                        className="w-6 h-6 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-text-primary">
                        {workspaceProjects.length}
                      </p>
                      <p className="text-text-secondary">
                        {t('navigation.projects', { defaultValue: '项目' })}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="bg-surface rounded-lg p-6 border border-border animate-slide-up stats-card"
                  style={{ animationDelay: '0.2s' }}
                >
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-500/10 rounded-lg mr-4">
                      <svg
                        className="w-6 h-6 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v10z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-text-primary">
                        {workspaceBoards.length}
                      </p>
                      <p className="text-text-secondary">
                        {t('navigation.directBoards', { defaultValue: '直属看板' })}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="bg-surface rounded-lg p-6 border border-border animate-slide-up stats-card"
                  style={{ animationDelay: '0.3s' }}
                >
                  <div className="flex items-center">
                    <div className="p-3 bg-green-500/10 rounded-lg mr-4">
                      <svg
                        className="w-6 h-6 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-text-primary">
                        {workspaceProjects.length + workspaceBoards.length}
                      </p>
                      <p className="text-text-secondary">
                        {t('navigation.totalItems', { defaultValue: '总项目数' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 快速访问 */}
              <div>
                <h2 className="text-xl font-semibold text-text-primary mb-4">
                  {t('navigation.quickAccess', { defaultValue: '快速访问' })}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 项目列表 */}
                  {workspaceProjects.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-text-primary mb-3">
                        📁 {t('navigation.projects', { defaultValue: '项目' })}
                      </h3>
                      <div className="space-y-2">
                        {workspaceProjects.slice(0, 5).map((project) => (
                          <div
                            key={project.id}
                            onClick={() => selectBoard(project.id)}
                            className="p-3 bg-surface rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-all duration-300 card-hover-lift"
                          >
                            <h4 className="font-medium text-text-primary">{project.name}</h4>
                            {project.description && (
                              <p className="text-sm text-text-secondary mt-1">
                                {project.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 直属看板列表 */}
                  {workspaceBoards.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-text-primary mb-3">
                        📋 {t('navigation.directBoards', { defaultValue: '直属看板' })}
                      </h3>
                      <div className="space-y-2">
                        {workspaceBoards.slice(0, 5).map((board) => (
                          <div
                            key={board.id}
                            onClick={() => selectBoard(board.id)}
                            className="p-3 bg-surface rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-all duration-300 card-hover-lift"
                          >
                            <h4 className="font-medium text-text-primary">{board.name}</h4>
                            {board.description && (
                              <p className="text-sm text-text-secondary mt-1">
                                {board.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 默认状态：没有选择任何内容
  return (
    <div className="flex-1 p-4">
      <div className="modern-container h-full board-content">
        <div className="h-full flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="text-6xl mb-4 animate-bounce-gentle">🏠</div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              {t('navigation.welcomeToXItools', { defaultValue: '欢迎使用 XItools' })}
            </h2>
            <p className="text-text-secondary">
              {t('navigation.selectWorkspaceToStart', {
                defaultValue: '从左侧导航栏选择工作区或看板开始使用',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationOverview;
