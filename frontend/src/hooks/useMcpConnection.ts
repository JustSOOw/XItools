import { useEffect, useState, useCallback } from 'react';
import socketService from '../services/socketService';
import mcpService from '../services/mcpService';
import useTaskStore from '../store/taskStore';
import { getBackendUrl, log } from '../utils/env';

/**
 * 自定义钩子，用于初始化MCP服务连接并加载任务数据
 * @param mcpUrl MCP服务URL
 */
const useMcpConnection = (mcpUrl?: string) => {
  const { setTasks, setLoading, setError } = useTaskStore();
  const [isConnected, setIsConnected] = useState(false);

  // 初始化连接
  const initConnection = useCallback(async () => {
    try {
      // 设置加载状态
      setLoading(true);

      const backendUrl = mcpUrl || getBackendUrl();
      log.info('初始化MCP连接:', backendUrl);

      // 连接到WebSocket
      socketService.connect(backendUrl);

      // 直接设置连接状态，不再测试getTaskSchema（因为它现在需要boardId参数）
      setIsConnected(true);
      log.info('MCP服务连接初始化完成');

      // 清除加载状态
      setLoading(false);
    } catch (error) {
      log.error('初始化MCP连接失败:', error);
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
    reconnect,
  };
};

export default useMcpConnection;
