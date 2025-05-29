import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Column from './components/Column';
import Card from './components/Card';
import Button from './components/Button';
import Modal from './components/Modal';
import useTheme from './hooks/useTheme';

// 定义任务类型
interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
}

// 定义列类型
interface ColumnType {
  id: string;
  title: string;
  tasks: Task[];
}

function App() {
  const { theme, toggleTheme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [columns, setColumns] = useState<ColumnType[]>([
    { id: 'todo', title: '待办', tasks: [] },
    { id: 'in-progress', title: '进行中', tasks: [] },
    { id: 'done', title: '已完成', tasks: [] },
  ]);

  // 模拟一些任务数据用于演示
  useEffect(() => {
    // 示例数据
    const mockTasks: Task[] = [
      { id: '1', title: '实现基础布局', description: '创建应用的基础布局和可重用组件', status: 'in-progress' },
      { id: '2', title: '设计数据模型', description: '设计任务数据的结构和关系', status: 'todo' },
      { id: '3', title: '实现主题切换', description: '添加多种主题切换功能', status: 'done' },
      { id: '4', title: '添加拖拽功能', description: '实现卡片的拖拽排序功能', status: 'todo' },
    ];
    
    // 更新列数据
    setColumns(prev => 
      prev.map(column => ({
        ...column,
        tasks: mockTasks.filter(task => task.status === column.id)
      }))
    );
  }, []);

  return (
    <Layout>
      <div className="flex flex-col h-full">
        {/* 顶部操作栏 */}
        <header className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">智能任务看板</h1>
          
          <div className="flex items-center space-x-4">
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
        
        {/* 看板内容区 */}
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex h-full space-x-4">
            {columns.map(column => (
              <Column
                key={column.id}
                id={column.id}
                title={column.title}
                count={column.tasks.length}
                onAddCard={() => setIsModalOpen(true)}
              >
                {column.tasks.map(task => (
                  <Card key={task.id} variant="default" isHoverable isInteractive>
                    <h3 className="text-sm font-medium text-text-primary">{task.title}</h3>
                    <p className="text-xs text-text-secondary mt-1">{task.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                        ID: {task.id}
                      </span>
                    </div>
                  </Card>
                ))}
              </Column>
            ))}
          </div>
        </div>
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
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              创建
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              标题
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="输入任务标题"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              描述
            </label>
            <textarea
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
              placeholder="输入任务描述"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              状态
            </label>
            <select
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="todo">待办</option>
              <option value="in-progress">进行中</option>
              <option value="done">已完成</option>
            </select>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

export default App; 