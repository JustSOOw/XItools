import { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import Column from './components/Column';
import Card from './components/Card';
import Button from './components/Button';
import Modal from './components/Modal';
import useTheme from './hooks/useTheme';
import useMcpConnection from './hooks/useMcpConnection';
import useTaskStore from './store/taskStore';
import mcpService from './services/mcpService';
import { Task as TaskType, PartialTask } from './types/Task';
import { testAxios } from './utils/testAxios';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<PartialTask>({
    title: '',
    description: '',
    status: 'todo',
  });
  
  // 测试axios是否工作正常
  useEffect(() => {
    testAxios().then(result => {
      console.log('Axios测试结果:', result);
    });
  }, []);
  
  // 使用MCP连接
  const { isConnected, reconnect } = useMcpConnection();
  
  // 从store获取状态 - 使用selector函数避免不必要的重渲染
  const tasks = useTaskStore(state => state.tasks);
  const columns = useTaskStore(state => state.columns);
  const isLoading = useTaskStore(state => state.isLoading);
  const error = useTaskStore(state => state.error);
  const setError = useTaskStore(state => state.setError);
  
  // 创建任务
  const handleCreateTask = async () => {
    if (!newTask.title) {
      setError('任务标题不能为空');
      return;
    }
    
    try {
      await mcpService.submitTaskDataset([newTask]);
      setIsModalOpen(false);
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
  
  // 按列组织任务 - 使用useMemo避免不必要的重计算
  const tasksByColumn = useMemo(() => {
    return columns.reduce((acc, column) => {
      acc[column.id] = tasks.filter(task => task.status === column.id);
      return acc;
    }, {} as Record<string, TaskType[]>);
  }, [columns, tasks]);

  return (
    <Layout>
      <div className="flex flex-col h-full">
        {/* 顶部操作栏 */}
        <header className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
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
              onClick={() => setIsModalOpen(true)}
            >
              新建任务
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  {theme === 'dark' ? (
                    <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fillRule="evenodd" clipRule="evenodd" />
                  ) : (
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  )}
                </svg>
              }
              onClick={toggleTheme}
            >
              {theme === 'light' ? '深色模式' : theme === 'dark' ? '柔和模式' : theme === 'soft' ? '艺术模式' : '浅色模式'}
            </Button>
          </div>
        </header>
        
        {/* 错误提示 */}
        {error && (
          <div className="bg-danger/10 border border-danger text-danger px-4 py-2 m-4 rounded-md flex justify-between items-center">
            <p>{error}</p>
          <button
              className="text-sm underline"
              onClick={() => setError(null)}
          >
              关闭
          </button>
          </div>
        )}
        
        {/* 连接状态提示 */}
        {!isConnected && !error && (
          <div className="bg-warning/10 border border-warning text-warning px-4 py-2 m-4 rounded-md">
            <p>未连接到MCP服务，部分功能可能不可用</p>
          </div>
        )}
        
        {/* 加载状态 */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="ml-2 text-text-secondary">加载中...</p>
          </div>
        ) : (
          /* 看板内容区 */
          <div className="flex-1 overflow-x-auto p-6">
            {columns.length > 0 ? (
              <div className="flex h-full space-x-4">
                {columns.map(column => (
                  <Column
                    key={column.id}
                    id={column.id}
                    title={column.name}
                    count={tasksByColumn[column.id]?.length || 0}
                    onAddCard={() => {
                      setNewTask({...newTask, status: column.id});
                      setIsModalOpen(true);
                    }}
                  >
                    {tasksByColumn[column.id]?.map(task => (
                      <Card key={task.id} variant="default" isHoverable isInteractive>
                        <h3 className="text-sm font-medium text-text-primary">{task.title}</h3>
                        {task.description && (
                          <p className="text-xs text-text-secondary mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                            {task.priority || '普通'}
                          </span>
                          <span className="text-xs text-text-secondary">
                            ID: {task.id.substring(0, 8)}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </Column>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-text-secondary">暂无看板列</p>
              </div>
            )}
        </div>
        )}
      </div>
      
      {/* 新建任务模态框 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="新建任务"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
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
              {columns.map((column) => (
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
              onChange={(e) => setNewTask({...newTask, priority: e.target.value || null})}
              disabled={!isConnected}
            >
              <option value="">普通</option>
              <option value="High">高</option>
              <option value="Medium">中</option>
              <option value="Low">低</option>
            </select>
      </div>
    </div>
      </Modal>
    </Layout>
  );
}

export default App; 