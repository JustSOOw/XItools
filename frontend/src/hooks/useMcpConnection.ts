import { useEffect, useState, useCallback } from 'react';
import socketService from '../services/socketService';
import mcpService from '../services/mcpService';
import useTaskStore from '../store/taskStore';

// 获取后端服务地址
const getBackendUrl = (): string => {
  // 优先检查是否有云端服务配置
  const cloudUrl = import.meta.env.VITE_CLOUD_BACKEND_URL;
  if (cloudUrl) {
    console.log('MCP连接使用云端配置:', cloudUrl);
    return cloudUrl;
  }

  // 默认本地服务
  console.log('MCP连接使用默认本地配置: http://localhost:3000');
  return 'http://localhost:3000';
};

/**
 * 自定义钩子，用于初始化MCP服务连接并加载任务数据
 * @param mcpUrl MCP服务URL
 */
const useMcpConnection = (mcpUrl: string = getBackendUrl()) => {
  const { setTasks, setLoading, setError } = useTaskStore();
  const [isConnected, setIsConnected] = useState(false);
  
  // 初始化连接
  const initConnection = useCallback(async () => {
    try {
      // 设置加载状态
      setLoading(true);
      
      // 连接到WebSocket
      socketService.connect(mcpUrl);
      
      try {
        // 获取初始任务列表
        const tasks = await mcpService.listTasks();
        setTasks(tasks);
        setIsConnected(true);
      } catch (error) {
        console.error('获取任务列表失败:', error);
        // 即使获取任务失败，我们仍保持连接状态
        setIsConnected(socketService.isConnectedToServer());
        // 设置一些假数据用于测试
        setTasks([
          {
            id: '1',
            title: '连接mcp服务',
            description: '链接mcp服务失败，请检查mcp服务是否启动',
            status: '待办',
            priority: 'Medium',
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            title: '直接API请求',
            description: '这是一个临时数据卡片',
            status: '进行中',
            priority: 'High',
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]);
      }
      
      // 清除加载状态
      setLoading(false);
    } catch (error) {
      console.error('初始化MCP连接失败:', error);
      setError('初始化MCP连接失败，请稍后重试');
      setLoading(false);
      setIsConnected(false);
    }
  }, [mcpUrl, setTasks, setLoading, setError]);
  
  // 重新连接
  const reconnect = useCallback(() => {
    socketService.disconnect();
    setIsConnected(false);
    initConnection();
  }, [initConnection]);
  
  // 监听连接状态变化
  useEffect(() => {
    // 设置事件监听器
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleError = (err: Error) => {
      setError(`MCP服务连接错误: ${err.message}`);
      setIsConnected(false);
    };
    
    // 添加事件监听
    socketService.onConnect(handleConnect);
    socketService.onDisconnect(handleDisconnect);
    socketService.onError(handleError);
    
    // 初始化连接
    initConnection();
    
    // 组件卸载时断开连接
    return () => {
      socketService.offConnect(handleConnect);
      socketService.offDisconnect(handleDisconnect);
      socketService.offError(handleError);
      socketService.disconnect();
    };
  }, [initConnection, setError]);
  
  return {
    isConnected,
    reconnect
  };
};

export default useMcpConnection; 