/**
 * 使用MCP SDK测试MCP工具
 * 
 * 此脚本使用官方MCP SDK与MCP服务进行交互，测试各个工具的功能
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

// 创建MCP客户端
const mcpClient = new Client({
  name: 'mcp-test-client',
  version: '1.0.0'
});

// 连接到MCP服务器
const transport = new StreamableHTTPClientTransport({
  url: 'http://localhost:3000/mcp'
});

async function runTests() {
  try {
    console.log('===== 开始MCP SDK测试 =====');
    
    // 连接到MCP服务器
    console.log('连接到MCP服务器...');
    mcpClient.connect(transport);
    
    // 获取可用工具列表
    console.log('\n获取可用工具列表...');
    const toolsResult = await mcpClient.listTools();
    console.log('可用工具:', toolsResult.tools.map(tool => tool.name));
    
    // 1. 测试get_task_schema工具
    console.log('\n===== 测试工具: get_task_schema =====');
    const schemaResult = await mcpClient.callTool({
      name: 'get_task_schema',
      arguments: {}
    });
    console.log('Schema结果:', schemaResult.content ? schemaResult.content[0].text.substring(0, 200) + '...' : '无结果');
    
    // 2. 测试submit_task_dataset工具
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
    
    const submitResult = await mcpClient.callTool({
      name: 'submit_task_dataset',
      arguments: { tasks: testTasks }
    });
    
    if (submitResult.content && submitResult.content.length > 0) {
      const tasksData = JSON.parse(submitResult.content[0].text);
      console.log('创建的任务数量:', tasksData.length);
      const firstTaskId = tasksData[0].id;
      
      // 3. 测试list_tasks工具
      console.log('\n===== 测试工具: list_tasks =====');
      const listResult = await mcpClient.callTool({
        name: 'list_tasks',
        arguments: { filter_options: { status: 'To Do' } }
      });
      console.log('任务列表结果:', listResult.content ? listResult.content[0].text.substring(0, 200) + '...' : '无结果');
      
      // 4. 测试get_task_details工具
      console.log('\n===== 测试工具: get_task_details =====');
      const detailsResult = await mcpClient.callTool({
        name: 'get_task_details',
        arguments: { task_id: firstTaskId }
      });
      console.log('任务详情结果:', detailsResult.content ? detailsResult.content[0].text.substring(0, 200) + '...' : '无结果');
      
      // 5. 测试update_task工具
      console.log('\n===== 测试工具: update_task =====');
      const updateResult = await mcpClient.callTool({
        name: 'update_task',
        arguments: {
          task_id: firstTaskId,
          updates: {
            status: 'In Progress',
            description: '更新后的任务描述',
            tags: ['测试', 'MCP', '已更新']
          }
        }
      });
      console.log('更新任务结果:', updateResult.content ? updateResult.content[0].text.substring(0, 200) + '...' : '无结果');
      
      // 6. 测试delete_task工具
      console.log('\n===== 测试工具: delete_task =====');
      const deleteResult = await mcpClient.callTool({
        name: 'delete_task',
        arguments: { task_id: firstTaskId }
      });
      console.log('删除任务结果:', deleteResult.content ? deleteResult.content[0].text.substring(0, 200) + '...' : '无结果');
    } else {
      console.log('创建任务失败，无法继续测试');
    }
    
    console.log('\n===== MCP SDK测试完成 =====');
  } catch (error) {
    console.error('测试过程中出错:', error);
  } finally {
    // 关闭连接
    await mcpClient.close();
  }
}

// 执行测试
runTests(); 