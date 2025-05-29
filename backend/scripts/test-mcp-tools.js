/**
 * MCP工具测试脚本
 * 
 * 此脚本用于测试后端MCP服务的工具功能，模拟LLM客户端调用MCP工具的流程。
 * 使用方法：
 * 1. 确保后端服务已启动
 * 2. 运行 npm run test:mcp-tools
 */

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// MCP服务端点
const MCP_ENDPOINT = 'http://localhost:3000/mcp';
// 生成一个会话ID
const SESSION_ID = uuidv4();

/**
 * 初始化MCP会话
 * @returns {Promise<boolean>} 初始化是否成功
 */
async function initializeMcpSession() {
  try {
    console.log('开始MCP会话初始化...');
    
    // 第一步：发送hello请求
    const helloId = uuidv4();
    const helloResponse = await axios.post(MCP_ENDPOINT, {
      jsonrpc: '2.0',
      id: helloId,
      method: 'hello',
      params: {
        version: '1.0.0',
        session_id: SESSION_ID,
        capabilities: {
          streaming: false
        }
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream'
      }
    });
    
    console.log('Hello请求成功，服务器响应:', JSON.stringify(helloResponse.data).substring(0, 200) + '...');
    
    // 第二步：发送initialize请求
    const initializeId = uuidv4();
    const initializeResponse = await axios.post(MCP_ENDPOINT, {
      jsonrpc: '2.0',
      id: initializeId,
      method: 'initialize',
      params: {
        session_id: SESSION_ID,
        client_name: 'mcp-test-client',
        client_version: '1.0.0'
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream'
      }
    });
    
    console.log('Initialize请求成功，服务器响应:', JSON.stringify(initializeResponse.data).substring(0, 200) + '...');
    
    return true;
  } catch (error) {
    console.error('MCP会话初始化失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
    return false;
  }
}

/**
 * 发送MCP请求
 * @param {string} method - 要调用的MCP工具名称
 * @param {object} params - 工具参数
 * @returns {Promise<any>} - 响应数据
 */
async function callMcpTool(method, params = {}) {
  const requestId = uuidv4();
  
  const requestBody = {
    jsonrpc: '2.0',
    id: requestId,
    method: 'call_tool',
    params: {
      session_id: SESSION_ID,
      name: method,
      arguments: params
    }
  };
  
  try {
    console.log(`\n调用工具: ${method}`);
    console.log('参数:', JSON.stringify(params, null, 2));
    
    const response = await axios.post(MCP_ENDPOINT, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream'
      }
    });
    
    if (response.data.error) {
      console.error('错误:', response.data.error);
      return null;
    }
    
    const result = response.data.result;
    console.log('结果:', JSON.stringify(result, null, 2).substring(0, 500) + '...');
    return result;
  } catch (error) {
    console.error('请求失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
    return null;
  }
}

/**
 * 运行测试流程
 */
async function runTests() {
  try {
    console.log('===== 开始MCP工具测试 =====');
    
    // 首先初始化MCP会话
    const initialized = await initializeMcpSession();
    if (!initialized) {
      console.error('无法初始化MCP会话，测试中止');
      return;
    }
    
    // 1. 测试get_task_schema
    console.log('\n===== 测试工具: get_task_schema =====');
    await callMcpTool('get_task_schema');
    
    // 2. 测试submit_task_dataset
    console.log('\n===== 测试工具: submit_task_dataset =====');
    const testTasks = [
      {
        title: '测试任务1',
        description: '这是一个测试任务的描述',
        status: 'To Do',
        priority: 'Medium',
        tags: ['测试', 'MCP']
      },
      {
        title: '测试任务2',
        description: '这是另一个测试任务的描述',
        status: 'To Do',
        priority: 'High',
        tags: ['测试', '优先级高']
      }
    ];
    const createdTasks = await callMcpTool('submit_task_dataset', { tasks: testTasks });
    
    if (createdTasks && createdTasks.content && createdTasks.content.length > 0) {
      const tasksData = JSON.parse(createdTasks.content[0].text);
      const firstTaskId = tasksData[0].id;
      
      // 3. 测试list_tasks
      console.log('\n===== 测试工具: list_tasks =====');
      await callMcpTool('list_tasks', { filter_options: { status: 'To Do' } });
      
      // 4. 测试get_task_details
      console.log('\n===== 测试工具: get_task_details =====');
      await callMcpTool('get_task_details', { task_id: firstTaskId });
      
      // 5. 测试update_task
      console.log('\n===== 测试工具: update_task =====');
      await callMcpTool('update_task', { 
        task_id: firstTaskId, 
        updates: { 
          status: 'In Progress', 
          description: '更新后的任务描述',
          tags: ['测试', 'MCP', '已更新']
        } 
      });
      
      // 6. 测试delete_task
      console.log('\n===== 测试工具: delete_task =====');
      await callMcpTool('delete_task', { task_id: firstTaskId });
    }
    
    console.log('\n===== MCP工具测试完成 =====');
  } catch (error) {
    console.error('测试过程中出错:', error);
  }
}

// 执行测试
runTests(); 