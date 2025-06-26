#!/usr/bin/env node

/**
 * XItools MCP客户端包装器
 * 
 * 这个脚本作为标准MCP服务器接口，将请求转发到运行中的XItools HTTP MCP服务器
 */

const http = require('http');
const readline = require('readline');

// MCP服务器配置
const MCP_SERVER_URL = 'http://8.140.237.185:3000/mcp';

// 创建readline接口用于处理stdin/stdout
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// 日志函数（输出到stderr，不影响MCP通信）
function log(message) {
  console.error(`[MCP Wrapper] ${message}`);
}

// 发送HTTP请求到MCP服务器
function sendToMCPServer(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: '8.140.237.185',
      port: 3000,
      path: '/mcp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          resolve(response);
        } catch (error) {
          reject(new Error(`Invalid JSON response: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// 处理MCP初始化
async function handleInitialize(request) {
  log('处理初始化请求');
  
  // 返回服务器能力
  const response = {
    jsonrpc: '2.0',
    id: request.id,
    result: {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {},
        resources: {}
      },
      serverInfo: {
        name: 'xitools-mcp-server',
        version: '1.0.0'
      }
    }
  };
  
  console.log(JSON.stringify(response));
}

// 处理工具列表请求
async function handleToolsList(request) {
  log('处理工具列表请求');
  
  // 返回可用工具列表
  const tools = [
    {
      name: 'get_task_schema',
      description: '获取任务对象的JSON Schema，用于指导LLM生成正确的数据格式',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'submit_task_dataset',
      description: '提交从PRD解析出的结构化任务数据集，服务器将处理并存储这些任务。状态字段支持中文名称（待办、进行中、已完成）或列ID，工具会自动映射为正确的列ID。',
      inputSchema: {
        type: 'object',
        properties: {
          tasks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                status: {
                  type: 'string',
                  description: '任务状态，支持中文名称（待办、进行中、已完成）或列ID，会自动映射为正确的列ID'
                },
                description: { type: 'string' },
                priority: { type: 'string', enum: ['High', 'Medium', 'Low'] },
                tags: { type: 'array', items: { type: 'string' } }
              },
              required: ['title', 'status']
            }
          }
        },
        required: ['tasks']
      }
    },
    {
      name: 'list_tasks',
      description: '获取当前任务列表，支持过滤条件',
      inputSchema: {
        type: 'object',
        properties: {
          filter_options: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              priority: { type: 'string' },
              assignee: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } }
            }
          }
        }
      }
    },
    {
      name: 'get_task_details',
      description: '获取特定任务的详细信息',
      inputSchema: {
        type: 'object',
        properties: {
          task_id: { type: 'string' }
        },
        required: ['task_id']
      }
    },
    {
      name: 'update_task',
      description: '更新现有任务的一个或多个属性',
      inputSchema: {
        type: 'object',
        properties: {
          task_id: { type: 'string' },
          updates: { type: 'object' }
        },
        required: ['task_id', 'updates']
      }
    },
    {
      name: 'delete_task',
      description: '删除指定的任务',
      inputSchema: {
        type: 'object',
        properties: {
          task_id: { type: 'string' }
        },
        required: ['task_id']
      }
    },
    {
      name: 'clear_all_tasks',
      description: '删除所有任务卡片，用于测试和开发。注意：此操作不可逆，请谨慎使用。',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'get_columns',
      description: '获取所有看板列，按order排序',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'create_column',
      description: '创建新的看板列',
      inputSchema: {
        type: 'object',
        properties: {
          column_data: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: '列名称'
              },
              order: {
                type: 'number',
                description: '排序顺序'
              },
              color: {
                type: 'string',
                description: '列背景色（可选）'
              },
              isDefault: {
                type: 'boolean',
                description: '是否为默认列'
              }
            },
            required: ['name', 'order', 'isDefault']
          }
        },
        required: ['column_data']
      }
    },
    {
      name: 'update_column',
      description: '更新现有看板列的属性',
      inputSchema: {
        type: 'object',
        properties: {
          column_id: {
            type: 'string',
            description: '列ID'
          },
          updates: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              order: { type: 'number' },
              color: { type: 'string' },
              isDefault: { type: 'boolean' }
            }
          }
        },
        required: ['column_id', 'updates']
      }
    },
    {
      name: 'delete_column',
      description: '删除指定的看板列',
      inputSchema: {
        type: 'object',
        properties: {
          column_id: {
            type: 'string',
            description: '要删除的列ID'
          }
        },
        required: ['column_id']
      }
    },
    {
      name: 'reorder_columns',
      description: '重新排序看板列',
      inputSchema: {
        type: 'object',
        properties: {
          column_ids: {
            type: 'array',
            items: { type: 'string' },
            description: '按新顺序排列的列ID数组'
          }
        },
        required: ['column_ids']
      }
    }
  ];
  
  const response = {
    jsonrpc: '2.0',
    id: request.id,
    result: {
      tools: tools
    }
  };
  
  console.log(JSON.stringify(response));
}

// 处理工具调用
async function handleToolCall(request) {
  const { name, arguments: args } = request.params;
  log(`处理工具调用: ${name}`);
  
  try {
    // 转发到HTTP MCP服务器
    const mcpRequest = {
      jsonrpc: '2.0',
      id: request.id,
      method: name,
      params: args
    };
    
    const mcpResponse = await sendToMCPServer(mcpRequest);
    
    // 转换响应格式
    const response = {
      jsonrpc: '2.0',
      id: request.id,
      result: {
        content: [
          {
            type: 'text',
            text: typeof mcpResponse.result === 'string' ? mcpResponse.result : JSON.stringify(mcpResponse.result, null, 2)
          }
        ]
      }
    };
    
    console.log(JSON.stringify(response));
  } catch (error) {
    log(`工具调用失败: ${error.message}`);
    
    const errorResponse = {
      jsonrpc: '2.0',
      id: request.id,
      error: {
        code: -32603,
        message: `工具调用失败: ${error.message}`
      }
    };
    
    console.log(JSON.stringify(errorResponse));
  }
}

// 处理输入的JSON-RPC请求
async function handleRequest(line) {
  try {
    const request = JSON.parse(line);
    log(`收到请求: ${request.method}`);
    
    switch (request.method) {
      case 'initialize':
        await handleInitialize(request);
        break;
      case 'tools/list':
        await handleToolsList(request);
        break;
      case 'tools/call':
        await handleToolCall(request);
        break;
      default:
        const errorResponse = {
          jsonrpc: '2.0',
          id: request.id,
          error: {
            code: -32601,
            message: `未知方法: ${request.method}`
          }
        };
        console.log(JSON.stringify(errorResponse));
    }
  } catch (error) {
    log(`处理请求失败: ${error.message}`);
    
    const errorResponse = {
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32700,
        message: '解析错误'
      }
    };
    
    console.log(JSON.stringify(errorResponse));
  }
}

// 主程序
log('XItools MCP客户端包装器启动');
log(`连接到MCP服务器: ${MCP_SERVER_URL}`);

// 监听stdin输入
rl.on('line', handleRequest);

// 处理进程退出
process.on('SIGINT', () => {
  log('收到退出信号，关闭连接');
  rl.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('收到终止信号，关闭连接');
  rl.close();
  process.exit(0);
});
