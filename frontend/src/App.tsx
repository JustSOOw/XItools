import React from 'react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
          XItools - 智能任务看板
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-center">
          欢迎使用XItools智能任务看板应用，我们正在努力构建中...
        </p>
      </div>
    </div>
  );
};

export default App; 