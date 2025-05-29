import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary-600 mb-6">XItools - 智能任务看板</h1>
        <p className="text-lg mb-8">欢迎使用XItools智能任务看板系统</p>
        <div className="p-6 bg-card rounded-lg shadow-lg max-w-md mx-auto">
          <button
            onClick={() => setCount((count) => count + 1)}
            className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
          >
            计数: {count}
          </button>
          <p className="mt-4 text-sm text-muted-foreground">
            点击按钮增加计数，测试React状态管理
          </p>
        </div>
      </div>
    </div>
  );
}

export default App; 